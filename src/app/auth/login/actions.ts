// src/app/auth/login/actions.ts
'use server';

import bcrypt from 'bcryptjs';
import { encode } from 'next-auth/jwt';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

const SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || '';

export async function loginAction(email: string, password: string) {
  try {
    const emailLower = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: emailLower },
      include: { service: true, atelier: true },
    });

    if (!user || user.statut !== 'actif') {
      return { success: false, error: 'Email ou mot de passe incorrect.' };
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return { success: false, error: 'Email ou mot de passe incorrect.' };
    }

    // Build token payload matching the jwt callback in auth.ts
    const tokenPayload = {
      id: user.id,
      name: `${user.prenom} ${user.nom}`,
      email: user.email,
      picture: user.photo,
      sub: user.id,
      role: user.role,
      matricule: user.matricule,
      serviceId: user.serviceId,
      serviceName: user.service?.nom ?? null,
      atelierId: user.atelierId,
      atelierName: user.atelier?.nom ?? null,
      fonction: user.fonction,
    };

    // Encode using NextAuth's own encode function (produces JWE)
    const token = await encode({
      token: tokenPayload,
      secret: SECRET,
      salt: 'authjs.session-token',
    });

    // Set the session cookie (same name/format NextAuth v5 uses)
    const cookieStore = await cookies();
    cookieStore.set('authjs.session-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return { success: true };
  } catch (error) {
    console.error('[LOGIN ACTION] Error:', error);
    return { success: false, error: 'Erreur serveur.' };
  }
}
