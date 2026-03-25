// src/app/api/admin/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !['admin', 'direction'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'all';
  let csv = '\uFEFF'; // BOM UTF-8

  if (type === 'users' || type === 'all') {
    const users = await prisma.user.findMany({ include: { service: true, atelier: true } });
    csv += 'UTILISATEURS\n';
    csv += 'Matricule;Nom;Prénom;Rôle;Service;Atelier;Fonction;Statut\n';
    for (const u of users) {
      csv += `${u.matricule};${u.nom};${u.prenom};${u.role};${u.service?.nom || ''};${u.atelier?.nom || ''};${u.fonction};${u.statut}\n`;
    }
    csv += '\n';
  }

  if (type === 'evals' || type === 'all') {
    const evals = await prisma.evaluation.findMany({
      include: { service: true, zone: true, user: true },
      orderBy: { date: 'desc' },
    });
    csv += 'ÉVALUATIONS 5S\n';
    csv += 'Date;Employé;Service;Zone;Seiri;Seiton;Seiso;Seiketsu;Shitsuke;Total;Appréciation;Statut\n';
    for (const e of evals) {
      csv += `${e.date.toISOString().split('T')[0]};${e.user.prenom} ${e.user.nom};${e.service.nom};${e.zone.nom};${e.scoreSeiri || 0};${e.scoreSeiton || 0};${e.scoreSeiso || 0};${e.scoreSeiketsu || 0};${e.scoreShitsuke || 0};${e.scoreTotal || 0};${e.appreciation || ''};${e.statut}\n`;
    }
    csv += '\n';
  }

  if (type === 'suggestions' || type === 'all') {
    const suggs = await prisma.suggestion.findMany({
      include: { user: true, categorie: true },
      orderBy: { date: 'desc' },
    });
    csv += 'SUGGESTIONS\n';
    csv += 'Date;Employé;Titre;Catégorie;Score;Appréciation;Statut;Urgence;Impact\n';
    for (const s of suggs) {
      csv += `${s.date.toISOString().split('T')[0]};${s.user.prenom} ${s.user.nom};${s.titre.replace(/;/g, ',')};${s.categorie.nom};${s.scoreTotal || ''};${s.appreciation || ''};${s.statut};${s.urgence || ''};${s.impactEstime || ''}\n`;
    }
    csv += '\n';
  }

  if (type === 'actions' || type === 'all') {
    const actions = await prisma.action.findMany({
      include: { responsable: true },
      orderBy: { createdAt: 'desc' },
    });
    csv += 'ACTIONS CORRECTIVES\n';
    csv += 'Description;Responsable;Échéance;Statut;Priorité;Avancement\n';
    for (const a of actions) {
      csv += `${a.description.replace(/;/g, ',')};${a.responsable ? a.responsable.prenom + ' ' + a.responsable.nom : ''};${a.echeance ? a.echeance.toISOString().split('T')[0] : ''};${a.statut};${a.priorite};${a.avancement}%\n`;
    }
  }

  const filename = `5s_excellence_${type}_${new Date().toISOString().split('T')[0]}.csv`;

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
