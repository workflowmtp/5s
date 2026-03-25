// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nom, prenom, email, password, telephone } = body;

    // Validation
    if (!nom || !prenom || !email || !password) {
      return NextResponse.json(
        { error: 'Les champs nom, prénom, email et mot de passe sont obligatoires.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères.' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé.' },
        { status: 409 }
      );
    }

    // Generate matricule
    const count = await prisma.user.count();
    const matricule = `EMP${String(count + 1).padStart(4, '0')}`;

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user (service, atelier, fonction will be assigned by admin)
    const user = await prisma.user.create({
      data: {
        matricule,
        nom,
        prenom,
        email: email.toLowerCase(),
        password: hashed,
        role: 'employe',
        telephone: telephone || null,
      },
    });

    return NextResponse.json(
      { id: user.id, matricule: user.matricule, email: user.email },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du compte.' },
      { status: 500 }
    );
  }
}
