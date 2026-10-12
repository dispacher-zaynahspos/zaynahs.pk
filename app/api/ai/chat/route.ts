import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { getAISettings } from '@/lib/ai';
import { routeText, extractKeys } from '@/lib/ai/router';

export const runtime = 'nodejs';

/**
 * POST /api/ai/chat
 * Accept: { messages: array, provider?: string }
 * messages: [{ role: 'user'|'assistant'|'system', content: string }]
 * Returns: { result, provider, model }
 */
export async function POST(req: NextRequest) {
  const _denied = await requireAdmin(req);
  if (_denied) return _denied;
  try {
    const { messages, provider: forcedProvider } = (await req.json()) as {
      messages?: unknown;
      provider?: string;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const settings = await getAISettings();
    const keys = extractKeys(settings);

    type ChatMessage = { role: string; content: string };
    const typedMessages = messages as ChatMessage[];

    // Build prompt from message history
    const systemMsg = typedMessages.find((m) => m.role === 'system');
    const historyMsgs = typedMessages.filter((m) => m.role !== 'system');
    const conversation = historyMsgs.map((m) => `${m.role}: ${m.content}`).join('\n');
    const prompt = conversation;
    const systemPrompt = systemMsg?.content || 'You are a helpful e-commerce assistant.';

    if (forcedProvider && keys.text[forcedProvider]) {
      const result = await routeText(prompt, systemPrompt, {
        [forcedProvider]: keys.text[forcedProvider],
      }, settings.content_model);
      return NextResponse.json(result);
    }

    const result = await routeText(prompt, systemPrompt, keys.text, settings.content_model);
    if (!result) {
      return NextResponse.json({ error: 'All text providers failed' }, { status: 503 });
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error('[Chat API]', err);
    const message = err instanceof Error ? err.message : 'Chat failed';
    const status =
      typeof err === 'object' && err !== null && 'status' in err && typeof (err as { status: unknown }).status === 'number'
        ? (err as { status: number }).status
        : 500;
    return NextResponse.json(
      { error: message },
      { status },
    );
  }
}
