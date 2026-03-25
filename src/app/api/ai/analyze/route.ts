// src/app/api/ai/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { IA_SYSTEM_PROMPT } from '@/lib/constants';
import prisma from '@/lib/prisma';

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://n8n.mtb-app.com/webhook/ef23526a-87b5-4d63-965b-3e5753de899c';
const N8N_USER = process.env.N8N_WEBHOOK_USER || 'multiprint';
const N8N_PASS = process.env.N8N_WEBHOOK_PASS || 'Admin@1234';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const body = await req.json();
  const { type, prompt } = body; // type: "5s" | "suggestion"

  // Check if IA is active (default to active if DB is unreachable)
  let iaActive = true;
  try {
    const iaConfig = await prisma.config.findUnique({ where: { cle: 'ia' } });
    iaActive = (iaConfig?.valeur as any)?.actif !== false;
  } catch {
    // DB unreachable — default to active
  }

  if (!iaActive) {
    return NextResponse.json({ result: null, source: 'unavailable' });
  }

  try {
    const basicAuth = Buffer.from(`${N8N_USER}:${N8N_PASS}`).toString('base64');

    const fullMessage = `[Système]\n${IA_SYSTEM_PROMPT}\n\n[Type d'analyse: ${type}]\n\n${prompt}`;

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: JSON.stringify({ message: fullMessage }),
    });

    if (!response.ok) throw new Error(`Webhook status ${response.status}`);

    const data = await response.json();

    // Support multiple response formats from n8n
    const raw = data.output || data.result || data.text || data.message || data.response || '';

    // Try to parse as JSON if it's a string
    let parsed = raw;
    if (typeof raw === 'string') {
      const clean = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      try {
        parsed = JSON.parse(clean);
      } catch {
        parsed = raw;
      }
    }

    return NextResponse.json({ result: parsed, source: 'api' });
  } catch (error) {
    console.error('AI Analyze error:', error);
    return NextResponse.json({ result: null, source: 'error' });
  }
}
