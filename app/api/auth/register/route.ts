import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address').max(255),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .regex(/[A-Z]/, 'Password must include uppercase letters')
    .regex(/[a-z]/, 'Password must include lowercase letters')
    .regex(/[0-9]/, 'Password must include numbers'),
  name: z.string().min(1, 'Please enter your name').max(100),
  nameKana: z.string().max(100).optional(),
  companyName: z.string().max(200).optional(),
  department: z.string().max(100).optional(),
  position: z.string().max(100).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validatedData = registerSchema.parse(body);
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'This email address is already registered' },
        { status: 400 }
      );
    }
    
    // Hash password
    const hashedPassword = await hash(validatedData.password, 12);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        nameKana: validatedData.nameKana,
        companyName: validatedData.companyName,
        department: validatedData.department,
        position: validatedData.position,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });
    
    return NextResponse.json(
      {
        message: 'Registration completed successfully',
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
