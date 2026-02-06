import { PrismaClient, Role, HankoType, DocumentStatus, ApprovalStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Test user credentials
const TEST_USERS = [
  {
    email: 'admin@hankosign.jp',
    password: 'Admin@123456',
    name: '管理者太郎',
    nameKana: 'カンリシャタロウ',
    companyName: 'HankoSign株式会社',
    corporateNumber: '1234567890123',
    department: '管理部',
    position: 'システム管理者',
    role: Role.SUPER_ADMIN,
  },
  {
    email: 'manager@hankosign.jp',
    password: 'Manager@123456',
    name: '部長次郎',
    nameKana: 'ブチョウジロウ',
    companyName: 'HankoSign株式会社',
    corporateNumber: '1234567890123',
    department: '営業部',
    position: '部長',
    role: Role.ADMIN,
  },
  {
    email: 'user1@hankosign.jp',
    password: 'User@123456',
    name: '社員三郎',
    nameKana: 'シャインサブロウ',
    companyName: 'HankoSign株式会社',
    corporateNumber: '1234567890123',
    department: '営業部',
    position: '営業担当',
    role: Role.USER,
  },
  {
    email: 'user2@hankosign.jp',
    password: 'User@123456',
    name: '社員花子',
    nameKana: 'シャインハナコ',
    companyName: 'HankoSign株式会社',
    corporateNumber: '1234567890123',
    department: '経理部',
    position: '経理担当',
    role: Role.USER,
  },
  {
    email: 'external@example.com',
    password: 'External@123456',
    name: '外部太郎',
    nameKana: 'ガイブタロウ',
    companyName: 'パートナー企業株式会社',
    corporateNumber: '9876543210987',
    department: '営業部',
    position: '担当者',
    role: Role.USER,
  },
];

// Generate a secure verification code (XXXX-XXXX-XXXX)
const generateVerificationCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const randomBytes = crypto.randomBytes(12);
  let code = '';
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(randomBytes[i] % chars.length);
  }
  return code.match(/.{1,4}/g)?.join('-') || code;
};

// Generate a hanko image as a data URI (SVG)
const createHankoImage = (name: string): string => {
  // Use last 2 chars for hanko text (typical Japanese seal style)
  const hankoText = name.slice(-2);
  const svg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="100" r="90" fill="none" stroke="#D32F2F" stroke-width="8"/><text x="100" y="115" font-family="serif" font-size="64" font-weight="bold" fill="#D32F2F" text-anchor="middle">${hankoText}</text></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
};

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clear existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.auditLog.deleteMany();
  await prisma.signature.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.workflow.deleteMany();
  await prisma.document.deleteMany();
  await prisma.hanko.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Existing data cleared\n');

  // Create users
  console.log('👥 Creating test users...');
  const createdUsers = [];

  for (const userData of TEST_USERS) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        nameKana: userData.nameKana,
        password: hashedPassword,
        companyName: userData.companyName,
        corporateNumber: userData.corporateNumber,
        department: userData.department,
        position: userData.position,
        role: userData.role,
      },
    });
    createdUsers.push(user);
    console.log(`   ✓ Created ${user.role}: ${user.email} (password: ${userData.password})`);
  }
  console.log('✅ Test users created\n');

  // Create hankos for each user
  console.log('🎯 Creating hankos...');
  const hankosByUser: Record<string, any[]> = {};

  for (const user of createdUsers) {
    const userHankos = [];

    // Create different types of hankos
    const hankoTypes = [
      { type: HankoType.MITOMEIN, label: '認印', isRegistered: false },
      { type: HankoType.GINKOIN, label: '銀行印', isRegistered: false },
      { type: HankoType.JITSUIN, label: '実印', isRegistered: true, registrationNumber: `REG-${Math.random().toString(36).substring(7).toUpperCase()}` },
    ];

    for (const hankoType of hankoTypes) {
      const hanko = await prisma.hanko.create({
        data: {
          userId: user.id,
          name: `${user.name}の${hankoType.label}`,
          type: hankoType.type,
          imageUrl: `/api/hankos/${user.id}/${hankoType.type}`,
          imageData: createHankoImage(user.name),
          font: '篆書体',
          size: 60,
          isRegistered: hankoType.isRegistered,
          registrationNumber: hankoType.registrationNumber,
        },
      });
      userHankos.push(hanko);
    }

    hankosByUser[user.id] = userHankos;
    console.log(`   ✓ Created ${userHankos.length} hankos for ${user.name}`);
  }
  console.log('✅ Hankos created\n');

  // Create sample documents with workflows
  console.log('📄 Creating sample documents...');

  const admin = createdUsers.find(u => u.role === Role.SUPER_ADMIN)!;
  const manager = createdUsers.find(u => u.role === Role.ADMIN)!;
  const user1 = createdUsers.find(u => u.email === 'user1@hankosign.jp')!;
  const user2 = createdUsers.find(u => u.email === 'user2@hankosign.jp')!;
  const external = createdUsers.find(u => u.email === 'external@example.com')!;

  // Document 1: Completed contract (manager created, signed by manager + user1)
  const doc1 = await prisma.document.create({
    data: {
      title: '業務委託契約書',
      description: 'システム開発業務委託契約',
      fileUrl: 's3://hankosign-documents/contracts/sample-contract-001.pdf',
      fileName: 'sample-contract-001.pdf',
      fileSize: 524288,
      mimeType: 'application/pdf',
      status: DocumentStatus.COMPLETED,
      createdById: manager.id,
      verificationCode: generateVerificationCode(),
      templateType: '契約書',
      metadata: { category: 'contract', importance: 'high' },
      completedAt: new Date(),
    },
  });

  await prisma.signature.create({
    data: {
      documentId: doc1.id,
      hankoId: hankosByUser[manager.id][2].id, // Jitsuin
      userId: manager.id,
      positionX: 450,
      positionY: 650,
      page: 1,
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0',
    },
  });

  await prisma.signature.create({
    data: {
      documentId: doc1.id,
      hankoId: hankosByUser[user1.id][2].id, // Jitsuin
      userId: user1.id,
      positionX: 450,
      positionY: 700,
      page: 1,
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0',
    },
  });

  console.log(`   ✓ Created completed document: ${doc1.title}`);

  // Document 2: In-progress expense report (user1 created, pending approval)
  const doc2 = await prisma.document.create({
    data: {
      title: '経費精算書',
      description: '2024年12月分経費精算',
      fileUrl: 's3://hankosign-documents/expense/expense-202412.pdf',
      fileName: 'expense-202412.pdf',
      fileSize: 204800,
      mimeType: 'application/pdf',
      status: DocumentStatus.IN_PROGRESS,
      createdById: user1.id,
      verificationCode: generateVerificationCode(),
      templateType: '経費精算書',
      metadata: { amount: 125000, currency: 'JPY' },
    },
  });

  const workflow1 = await prisma.workflow.create({
    data: {
      documentId: doc2.id,
      name: '経費承認フロー',
      currentStep: 0,
      totalSteps: 2,
      isSequential: true,
      configuration: {
        steps: [
          { order: 0, approverId: manager.id, role: '部長承認' },
          { order: 1, approverId: admin.id, role: '最終承認' },
        ],
      },
    },
  });

  await prisma.approval.create({
    data: {
      workflowId: workflow1.id,
      documentId: doc2.id,
      approverId: manager.id,
      order: 0,
      status: ApprovalStatus.PENDING,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.approval.create({
    data: {
      workflowId: workflow1.id,
      documentId: doc2.id,
      approverId: admin.id,
      order: 1,
      status: ApprovalStatus.PENDING,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  console.log(`   ✓ Created in-progress document: ${doc2.title}`);

  // Document 3: Draft invoice (user2 created)
  const doc3 = await prisma.document.create({
    data: {
      title: '請求書 2024-001',
      description: '2024年1月分請求書',
      fileUrl: 's3://hankosign-documents/invoices/invoice-2024-001.pdf',
      fileName: 'invoice-2024-001.pdf',
      fileSize: 153600,
      mimeType: 'application/pdf',
      status: DocumentStatus.DRAFT,
      createdById: user2.id,
      verificationCode: generateVerificationCode(),
      templateType: '請求書',
      metadata: { amount: 500000, currency: 'JPY', invoiceNumber: '2024-001' },
    },
  });

  console.log(`   ✓ Created draft document: ${doc3.title}`);

  // Document 4: Admin policy document (admin created, completed)
  const doc4 = await prisma.document.create({
    data: {
      title: '社内規程改定通知',
      description: '情報セキュリティポリシー改定に伴う通知',
      fileUrl: 's3://hankosign-documents/policies/security-policy-v2.pdf',
      fileName: 'security-policy-v2.pdf',
      fileSize: 312000,
      mimeType: 'application/pdf',
      status: DocumentStatus.COMPLETED,
      createdById: admin.id,
      verificationCode: generateVerificationCode(),
      templateType: '通知書',
      metadata: { category: 'policy', version: '2.0' },
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.signature.create({
    data: {
      documentId: doc4.id,
      hankoId: hankosByUser[admin.id][2].id, // Jitsuin
      userId: admin.id,
      positionX: 450,
      positionY: 650,
      page: 1,
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
    },
  });

  console.log(`   ✓ Created completed document: ${doc4.title}`);

  // Document 5: Pending NDA (admin created, waiting for external)
  const doc5 = await prisma.document.create({
    data: {
      title: '秘密保持契約書（NDA）',
      description: 'パートナー企業との秘密保持契約',
      fileUrl: 's3://hankosign-documents/contracts/nda-partner-001.pdf',
      fileName: 'nda-partner-001.pdf',
      fileSize: 410000,
      mimeType: 'application/pdf',
      status: DocumentStatus.PENDING,
      createdById: admin.id,
      verificationCode: generateVerificationCode(),
      templateType: '契約書',
      metadata: { category: 'nda', counterparty: 'パートナー企業株式会社' },
    },
  });

  const workflow2 = await prisma.workflow.create({
    data: {
      documentId: doc5.id,
      name: 'NDA署名フロー',
      currentStep: 0,
      totalSteps: 2,
      isSequential: true,
      configuration: {
        steps: [
          { order: 0, approverId: external.id, role: '相手方署名' },
          { order: 1, approverId: admin.id, role: '自社署名' },
        ],
      },
    },
  });

  await prisma.approval.create({
    data: {
      workflowId: workflow2.id,
      documentId: doc5.id,
      approverId: external.id,
      order: 0,
      status: ApprovalStatus.PENDING,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.approval.create({
    data: {
      workflowId: workflow2.id,
      documentId: doc5.id,
      approverId: admin.id,
      order: 1,
      status: ApprovalStatus.PENDING,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  console.log(`   ✓ Created pending document: ${doc5.title}`);

  // Document 6: Rejected purchase order (user2 created, rejected by manager)
  const doc6 = await prisma.document.create({
    data: {
      title: '備品購入申請書',
      description: 'オフィス備品購入申請（デスク・チェア）',
      fileUrl: 's3://hankosign-documents/purchase/purchase-order-001.pdf',
      fileName: 'purchase-order-001.pdf',
      fileSize: 180000,
      mimeType: 'application/pdf',
      status: DocumentStatus.REJECTED,
      createdById: user2.id,
      verificationCode: generateVerificationCode(),
      templateType: '申請書',
      metadata: { amount: 350000, currency: 'JPY', reason: 'equipment' },
    },
  });

  const workflow3 = await prisma.workflow.create({
    data: {
      documentId: doc6.id,
      name: '購入承認フロー',
      currentStep: 0,
      totalSteps: 1,
      isSequential: true,
      configuration: {
        steps: [
          { order: 0, approverId: manager.id, role: '部長承認' },
        ],
      },
    },
  });

  await prisma.approval.create({
    data: {
      workflowId: workflow3.id,
      documentId: doc6.id,
      approverId: manager.id,
      order: 0,
      status: ApprovalStatus.REJECTED,
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      comment: '予算超過のため却下。次期予算で再申請してください。',
    },
  });

  console.log(`   ✓ Created rejected document: ${doc6.title}`);

  // Document 7: External partner's document (external created)
  const doc7 = await prisma.document.create({
    data: {
      title: '業務提携契約書',
      description: 'パートナー企業との業務提携契約',
      fileUrl: 's3://hankosign-documents/contracts/partnership-agreement-001.pdf',
      fileName: 'partnership-agreement-001.pdf',
      fileSize: 620000,
      mimeType: 'application/pdf',
      status: DocumentStatus.DRAFT,
      createdById: external.id,
      verificationCode: generateVerificationCode(),
      templateType: '契約書',
      metadata: { category: 'partnership', importance: 'high' },
    },
  });

  console.log(`   ✓ Created draft document: ${doc7.title}`);

  // Document 8: Archived old contract (manager created)
  const doc8 = await prisma.document.create({
    data: {
      title: '旧システム保守契約書',
      description: '2023年度システム保守契約（期間満了）',
      fileUrl: 's3://hankosign-documents/contracts/maintenance-2023.pdf',
      fileName: 'maintenance-2023.pdf',
      fileSize: 480000,
      mimeType: 'application/pdf',
      status: DocumentStatus.ARCHIVED,
      createdById: manager.id,
      verificationCode: generateVerificationCode(),
      templateType: '契約書',
      metadata: { category: 'maintenance', year: 2023 },
      completedAt: new Date('2023-12-31'),
    },
  });

  console.log(`   ✓ Created archived document: ${doc8.title}`);

  console.log('✅ Sample documents created\n');

  // Create audit logs
  console.log('📊 Creating audit logs...');

  await prisma.auditLog.createMany({
    data: [
      {
        userId: manager.id,
        action: 'DOCUMENT_CREATED',
        entityType: 'Document',
        entityId: doc1.id,
        details: { title: doc1.title },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
      },
      {
        userId: manager.id,
        action: 'SIGNATURE_APPLIED',
        entityType: 'Signature',
        entityId: doc1.id,
        details: { documentTitle: doc1.title, hankoType: 'JITSUIN' },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
      },
      {
        userId: user1.id,
        action: 'SIGNATURE_APPLIED',
        entityType: 'Signature',
        entityId: doc1.id,
        details: { documentTitle: doc1.title, hankoType: 'JITSUIN' },
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0',
      },
      {
        userId: user1.id,
        action: 'DOCUMENT_CREATED',
        entityType: 'Document',
        entityId: doc2.id,
        details: { title: doc2.title },
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0',
      },
      {
        userId: user2.id,
        action: 'DOCUMENT_CREATED',
        entityType: 'Document',
        entityId: doc3.id,
        details: { title: doc3.title },
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0',
      },
      {
        userId: admin.id,
        action: 'DOCUMENT_CREATED',
        entityType: 'Document',
        entityId: doc4.id,
        details: { title: doc4.title },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      },
      {
        userId: admin.id,
        action: 'SIGNATURE_APPLIED',
        entityType: 'Signature',
        entityId: doc4.id,
        details: { documentTitle: doc4.title, hankoType: 'JITSUIN' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      },
      {
        userId: admin.id,
        action: 'DOCUMENT_CREATED',
        entityType: 'Document',
        entityId: doc5.id,
        details: { title: doc5.title },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      },
      {
        userId: user2.id,
        action: 'DOCUMENT_CREATED',
        entityType: 'Document',
        entityId: doc6.id,
        details: { title: doc6.title },
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0',
      },
      {
        userId: manager.id,
        action: 'APPROVAL_REJECTED',
        entityType: 'Approval',
        entityId: doc6.id,
        details: { documentTitle: doc6.title, comment: '予算超過のため却下' },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
      },
      {
        userId: external.id,
        action: 'DOCUMENT_CREATED',
        entityType: 'Document',
        entityId: doc7.id,
        details: { title: doc7.title },
        ipAddress: '203.0.113.50',
        userAgent: 'Mozilla/5.0',
      },
    ],
  });

  console.log('✅ Audit logs created\n');

  console.log('🎉 Database seeded successfully!\n');
  console.log('📋 TEST CREDENTIALS:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  TEST_USERS.forEach(user => {
    console.log(`${user.role.padEnd(15)} | ${user.email.padEnd(25)} | ${user.password}`);
  });
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('💡 You can now log in with any of these credentials!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
