// src/types/index.ts
import type { Role } from '@prisma/client';

// Extend NextAuth types
declare module 'next-auth' {
  interface User {
    role?: Role;
    matricule?: string;
    serviceId?: string;
    serviceName?: string;
    atelierId?: string | null;
    atelierName?: string | null;
    fonction?: string;
  }

  interface Session {
    user: User & {
      id: string;
      role: Role;
      matricule: string;
      serviceId: string;
      serviceName: string;
      atelierId: string | null;
      atelierName: string | null;
      fonction: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: Role;
    matricule?: string;
    serviceId?: string;
    serviceName?: string;
    atelierId?: string | null;
    atelierName?: string | null;
    fonction?: string;
  }
}

// ============================================================
// APPLICATION TYPES
// ============================================================

export interface ScoreResult5S {
  pillarScores: Record<string, number>;
  total: number;
}

export interface ScoreResultSugg {
  clarte: number;
  pertinence: number;
  faisabilite: number;
  impact: number;
  originalite: number;
  detail: number;
  total: number;
}

export interface IAAnalysis5S {
  commentaire: string;
  forces: string[];
  faiblesses: string[];
  actions: string[];
  synthese_manageriale?: string;
  niveau_priorite?: string;
}

export interface IAAnalysisSugg {
  commentaire: string;
  forces: string[];
  limites: string[];
  actions: string[];
  synthese_manageriale?: string;
  potentiel_mise_en_oeuvre?: string;
  niveau_priorite?: string;
}

export interface DashboardStats {
  avg5S: number;
  avgSugg: number;
  nbEvals: number;
  nbSuggs: number;
  nbRetenues: number;
}

export interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
  timestamp?: Date;
}
