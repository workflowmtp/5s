// src/app/api/ai/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { IA_SYSTEM_PROMPT, IA_CHAT_SYSTEM_APPEND } from '@/lib/constants';
import prisma from '@/lib/prisma';

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://n8n.mtb-app.com/webhook/ef23526a-87b5-4d63-965b-3e5753de899c';
const N8N_USER = process.env.N8N_WEBHOOK_USER || 'multiprint';
const N8N_PASS = process.env.N8N_WEBHOOK_PASS || 'Admin@1234';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const body = await req.json();
  const { messages, context } = body;

  // Check if IA is active (default to active if DB is unreachable)
  let iaActive = true;
  try {
    const iaConfig = await prisma.config.findUnique({ where: { cle: 'ia' } });
    iaActive = (iaConfig?.valeur as any)?.actif !== false;
  } catch {
    // DB unreachable — default to active
  }

  if (!iaActive) {
    return NextResponse.json({
      reply: 'L\'agent IA est actuellement désactivé. Contactez votre administrateur.',
    });
  }

  // Build system prompt with user context
  let systemPrompt = IA_SYSTEM_PROMPT + IA_CHAT_SYSTEM_APPEND;
  if (context) {
    systemPrompt += '\n\nContexte utilisateur :\n' + context;
  }

  try {
    const basicAuth = Buffer.from(`${N8N_USER}:${N8N_PASS}`).toString('base64');

    // Build a single message with system context + conversation history
    const conversationParts = messages.map((m: any) => {
      const role = m.role === 'bot' ? 'Assistant' : 'Utilisateur';
      return `${role}: ${m.text || m.content}`;
    });

    const fullMessage = `[Système]\n${systemPrompt}\n\n[Conversation]\n${conversationParts.join('\n')}`;

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: JSON.stringify({ message: fullMessage }),
    });

    if (!response.ok) {
      throw new Error(`Webhook status ${response.status}`);
    }

    const data = await response.json();

    // Support multiple response formats from n8n
    const reply = data.output || data.reply || data.text || data.message || data.response || '';

    return NextResponse.json({ reply: reply || 'Pas de réponse.' });
  } catch (error) {
    console.error('AI Chat error:', error);
    return NextResponse.json({
      reply: 'Erreur de communication avec l\'IA. Veuillez réessayer.',
    });
  }
}
