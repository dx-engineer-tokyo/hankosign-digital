'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { X, ZoomIn } from 'lucide-react';

declare global {
	interface Window {
		mermaid?: {
			initialize: (config: Record<string, unknown>) => void;
			run: (options?: { nodes?: NodeListOf<Element> }) => void;
		};
	}
}

const DIAGRAMS: Array<{ id: string; title: string; code: string }> = [
	{
		id: 'system-architecture',
		title: 'High-Level System Architecture',
		code: `flowchart LR
			user[User Browser] --> ui[Next.js App Router UI]
			ui --> api[Next.js API Routes]
			api --> db[(PostgreSQL via Prisma)]
			api --> s3[(S3 or MinIO)]
			api --> smtp[SMTP Server]
			api --> redis[(Redis Cache)]
			ui --> auth[NextAuth Credentials]
			auth --> api
		`,
	},
	{
		id: 'backend-architecture',
		title: 'Backend Architecture',
		code: `flowchart TB
			subgraph api[API Routes]
				auth["auth/*<br/>register<br/>forgot-password<br/>nextauth"]
				docs["documents<br/>GET, POST, DELETE"]
				hankos["hankos<br/>GET, POST, DELETE"]
				sigs["signatures<br/>POST"]
				verify["verify/code<br/>GET"]
				contact["contact<br/>POST"]
				admin["admin/users<br/>GET, role PATCH"]
				user["user/*<br/>profile, company, password, preferences"]
			end
			api --> prisma["Prisma Client"]
			prisma --> db[(PostgreSQL)]
			docs --> s3[(S3/MinIO)]
			hankos --> s3
			contact --> smtp[SMTP]
			auth --> bcrypt[bcryptjs]
			sigs --> audit[AuditLog]
			admin --> audit
			user --> audit
		`,
	},
	{
		id: 'frontend-architecture',
		title: 'Frontend Architecture',
		code: `flowchart TB
			root["app/layout.tsx"] --> locale["app/locale/layout.tsx"]
			locale --> public["Public Pages<br/>Home, About, Legal, Privacy, Contact, Demo"]
			locale --> authPages["Auth Pages<br/>Login, Register, Forgot Password"]
			locale --> verifyPage["Verify Page /verify/code"]
			locale --> dashboard["Dashboard Layout"]
			dashboard --> dashHome["Dashboard Overview"]
			dashboard --> dashDocs["Documents<br/>List, New, Detail"]
			dashboard --> dashHankos["Hankos<br/>List, Create"]
			dashboard --> dashRoles["Roles Admin"]
			dashboard --> dashSettings["Settings"]
			components["Shared Components<br/>HomePage, HankoDesigner, HankoIcon, Alert, AuthProvider"]
			public --> components
			authPages --> components
			dashboard --> components
		`,
	},
	{
		id: 'database-schema',
		title: 'Database Schema',
		code: `erDiagram
			User ||--o{ Hanko : owns
			User ||--o{ Document : creates
			User ||--o{ Signature : signs
			User ||--o{ Approval : approves
			Document ||--o{ Signature : contains
			Document ||--o{ Approval : requires
			Document ||--|| Workflow : has
			Workflow ||--o{ Approval : steps
			Approval ||--o| Signature : results_in
			User ||--o{ AuditLog : logs

			User {
				string id PK
				string email
				string name
				string password
				string role
			}
			Hanko {
				string id PK
				string userId FK
				string name
				string type
				string imageUrl
				string imageData
			}
			Document {
				string id PK
				string createdById FK
				string title
				string fileUrl
				string status
				string verificationCode
			}
			Workflow {
				string id PK
				string documentId FK
				int currentStep
				int totalSteps
			}
			Approval {
				string id PK
				string workflowId FK
				string documentId FK
				string approverId FK
				string status
			}
			Signature {
				string id PK
				string documentId FK
				string hankoId FK
				string userId FK
			}
			AuditLog {
				string id PK
				string action
				string entityType
				string entityId
			}
		`,
	},
	{
		id: 'api-flow-register',
		title: 'API Flow: Registration',
		code: `flowchart TD
			A([ Start ]) --> B["User submits register form"]
			B --> C["POST api auth register"]
			C --> D["Validate payload with zod"]
			D --> E{"Email exists?"}
			E -->|Yes| F["400 Email in use"]
			E -->|No| G["Hash password"]
			G --> H["Create User in DB"]
			H --> I["201 User created"]
			F --> Z([ End ])
			I --> Z
		`,
	},
	{
		id: 'api-flow-upload',
		title: 'API Flow: Document Upload',
		code: `flowchart TD
			A([ Start ]) --> B["User uploads file"]
			B --> C["POST api documents"]
			C --> D["Session check"]
			D -->|Fail| E["401"]
			D -->|OK| F["Validate file type size title"]
			F --> G["Upload file to S3"]
			G --> H["Generate verification code"]
			H --> I["Create Document in DB"]
			I --> J["201 Document created"]
			E --> Z([ End ])
			J --> Z
		`,
	},
	{
		id: 'api-flow-sign',
		title: 'API Flow: Sign Document',
		code: `flowchart TD
			A([ Start ]) --> B["Select hanko and position"]
			B --> C["POST api signatures"]
			C --> D["Session check"]
			D -->|Fail| E["401"]
			D -->|OK| F["Load Document"]
			F --> G{"Signable status?"}
			G -->|No| H["400 Not signable"]
			G -->|Yes| I["Validate hanko ownership"]
			I -->|Fail| H
			I -->|OK| J["Create Signature"]
			J --> K["Update Document to IN_PROGRESS"]
			K --> L["201 Signature created"]
			E --> Z([ End ])
			H --> Z
			L --> Z
		`,
	},
	{
		id: 'component-interactions',
		title: 'Component Interaction: Document Detail',
		code: `flowchart LR
			page["Document Detail Page"] --> apiDocs["GET /api/documents"]
			page --> apiHankos["GET /api/hankos"]
			page --> apiSign["POST /api/signatures"]
			apiDocs --> page
			apiHankos --> page
			apiSign --> page
			page --> preview["Document Preview"]
			page --> signaturePanel["Signature Panel"]
		`,
	},
	{
		id: 'auth-flow',
		title: 'Workflow: Authentication',
		code: `flowchart TD
			A([ Start ]) --> B["Login form"]
			B --> C["POST nextauth callback"]
			C --> D["CredentialsProvider authorize"]
			D --> E["Lookup user in DB"]
			E --> F["Compare password hash"]
			F -->|OK| G["Issue JWT session"]
			F -->|Fail| H["Login error"]
			G --> I["Session available in UI"]
			I --> Z([ End ])
			H --> Z
		`,
	},
	{
		id: 'request-lifecycle',
		title: 'Workflow: Request/Response Lifecycle (API)',
		code: `flowchart TD
			A([ Request ]) --> B["Next.js Route Handler"]
			B --> C["Session check if required"]
			C --> D["Zod validate payload"]
			D --> E["Business logic"]
			E --> F["Prisma query mutation"]
			F --> G["JSON response"]
			G --> Z(["Client receives response"])
		`,
	},
	{
		id: 'business-flows',
		title: 'Workflow: Core Business Flows',
		code: `flowchart LR
			user[User] --> hanko[Create Hanko]
			user --> doc[Upload Document]
			doc --> sign[Sign Document]
			sign --> verify[Public Verification]
			doc --> admin[Admin role management]
		`,
	},
	{
		id: 'background-jobs',
		title: 'Workflow: Background Jobs',
		code: `flowchart TD
			start([None configured]) --> note[Redis client exists but no jobs/cron implemented]
		`,
	},
];

export default function FlowPage() {
	const [activeDiagram, setActiveDiagram] = useState<{ title: string; svg: string } | null>(null);

	useEffect(() => {
		const interval = setInterval(() => {
			if (window.mermaid) {
				window.mermaid.initialize({
					startOnLoad: false,
					theme: 'neutral',
					securityLevel: 'loose',
				});
				window.mermaid.run({ nodes: document.querySelectorAll('.mermaid') });
				clearInterval(interval);
			}
		}, 100);

		return () => clearInterval(interval);
	}, []);

	const openDiagram = (id: string, title: string) => {
		const svg = document.querySelector(`#${id} .mermaid svg`);
		if (!svg) return;
		setActiveDiagram({ title, svg: svg.outerHTML });
	};

	const closeDiagram = () => setActiveDiagram(null);

	return (
		<div className="min-h-screen bg-white">
			<Script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js" strategy="afterInteractive" />
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
				<header className="space-y-3">
					<h1 className="text-3xl sm:text-4xl font-bold text-gray-900">System Flow and Architecture</h1>
					<p className="text-gray-600">
						This page renders the latest architecture and workflow diagrams derived from the current codebase.
					</p>
				</header>

				{DIAGRAMS.map((diagram) => (
					<section
						key={diagram.id}
						id={diagram.id}
						className="border border-gray-200 rounded-lg bg-white p-6"
					>
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-xl font-semibold text-gray-900">{diagram.title}</h2>
							<button
								type="button"
								onClick={() => openDiagram(diagram.id, diagram.title)}
								className="inline-flex items-center gap-2 border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
								aria-label={`Zoom ${diagram.title}`}
							>
								<ZoomIn className="h-4 w-4" />
								Zoom
							</button>
						</div>
						<div className="mermaid text-sm">{diagram.code}</div>
					</section>
				))}
			</div>

			{activeDiagram && (
				<div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
					<div className="bg-white w-full h-full max-w-6xl max-h-[90vh] rounded-lg shadow-lg flex flex-col">
						<div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
							<h3 className="text-lg font-semibold text-gray-900">{activeDiagram.title}</h3>
							<button
								type="button"
								onClick={closeDiagram}
								className="inline-flex items-center gap-2 border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
								aria-label="Close zoomed diagram"
							>
								<X className="h-4 w-4" />
								Close
							</button>
						</div>
						<div className="flex-1 bg-gray-50 overflow-auto p-4">
							<div
								className="w-full h-full flex items-center justify-center"
								dangerouslySetInnerHTML={{ __html: activeDiagram.svg }}
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
