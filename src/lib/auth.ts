// src/lib/auth.ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from './prisma';
import type { Role } from '@prisma/client';

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/login',
  },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: (credentials.email as string).trim().toLowerCase() },
          include: { service: true, atelier: true },
        });

        if (!user || user.statut !== 'actif') return null;

        const isValid = await bcrypt.compare(credentials.password as string, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          name: `${user.prenom} ${user.nom}`,
          email: user.email,
          image: user.photo,
          role: user.role,
          matricule: user.matricule,
          serviceId: user.serviceId || undefined,
          serviceName: user.service?.nom || undefined,
          atelierId: user.atelierId || undefined,
          atelierName: user.atelier?.nom || undefined,
          fonction: user.fonction,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.matricule = (user as any).matricule;
        token.serviceId = (user as any).serviceId;
        token.serviceName = (user as any).serviceName;
        token.atelierId = (user as any).atelierId;
        token.atelierName = (user as any).atelierName;
        token.fonction = (user as any).fonction;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role as Role;
        (session.user as any).matricule = token.matricule as string;
        (session.user as any).serviceId = token.serviceId as string;
        (session.user as any).serviceName = token.serviceName as string;
        (session.user as any).atelierId = token.atelierId as string | null;
        (session.user as any).atelierName = token.atelierName as string | null;
        (session.user as any).fonction = token.fonction as string;
      }
      return session;
    },
  },
});
