// Real, currently-valid Google Generative Language API model IDs.
// Gemini 3.6 Flash is Google's active, ultra-fast 1,500 req/day FREE model supporting both Text & Vision.
export const DEFAULT_GOOGLE_MODEL = 'gemini-3.6-flash';
export const GOOGLE_FALLBACK_MODEL = 'gemma-4-26b-a4b-it';

export const GOOGLE_MODELS = {
  text: [
    'gemini-3.6-flash',
    'gemma-4-26b-a4b-it',
    'gemma-4-31b-it',
    'gemini-3.8-flash',
    'gemini-3.1-flash-lite',
    'gemini-3.7-flash',
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-flash-latest',
  ],
  vision: [
    'gemini-3.6-flash',
    'gemini-3.8-flash',
    'gemini-3.1-flash-lite',
    'gemini-3.7-flash',
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-flash-latest',
  ],
} as const;

export const GOOGLE_FREE_LIMITS: Record<string, { reqPerDay: number; rpm: number }> = {
  'gemini-3.6-flash': { reqPerDay: 1500, rpm: 15 },
  'gemma-4-26b-a4b-it': { reqPerDay: 1500, rpm: 15 },
  'gemma-4-31b-it': { reqPerDay: 1500, rpm: 15 },
  'gemini-3.8-flash': { reqPerDay: 1500, rpm: 15 },
  'gemini-3.1-flash-lite': { reqPerDay: 1500, rpm: 15 },
  'gemini-3.7-flash': { reqPerDay: 1500, rpm: 15 },
  'gemini-3.5-flash': { reqPerDay: 1500, rpm: 15 },
  'gemini-3.5-flash-lite': { reqPerDay: 1500, rpm: 15 },
  'gemini-flash-latest': { reqPerDay: 1500, rpm: 15 },
};

/**
 * Resolve the admin-selected Google model to a real active API model ID.
 * Automatically upgrades retired or high-demand models to gemini-3.6-flash.
 */
export function normalizeGoogleModel(requestedModel: string): string {
  const m = (requestedModel || '').trim().toLowerCase();
  if (!m) return DEFAULT_GOOGLE_MODEL;
  if (
    m === 'gemini-1.5-flash' ||
    m === 'gemini-1.5-pro' ||
    m === 'gemini-2.0-flash' ||
    m === 'gemini-2.5-flash' ||
    m === 'gemini-2.5-pro' ||
    m === 'gemini-2.5-flash-lite' ||
    m === 'gemini-flash-latest'
  ) {
    return DEFAULT_GOOGLE_MODEL;
  }
  if (m.startsWith('gemini-') || m.startsWith('gemma-')) return m;
  return DEFAULT_GOOGLE_MODEL;
}

export async function callGoogle(
  apiKey: string,
  model: string,
  prompt: string,
  systemPrompt: string,
  isVision: boolean,
  base64Data?: string,
  mimeType?: string,
): Promise<string> {
  const primaryModel = normalizeGoogleModel(model);
  const modelsToTry = isVision
    ? Array.from(new Set([
        primaryModel,
        'gemini-3.6-flash',
        'gemini-3.8-flash',
        'gemini-3.1-flash-lite',
        'gemini-3.7-flash',
        'gemini-3.5-flash',
      ]))
    : Array.from(new Set([
        primaryModel,
        'gemini-3.6-flash',
        'gemma-4-26b-a4b-it',
        'gemma-4-31b-it',
        'gemini-3.8-flash',
        'gemini-3.1-flash-lite',
        'gemini-3.7-flash',
        'gemini-3.5-flash',
      ]));

  const wantsJson = /json|\{|\}/i.test(prompt) || /json/i.test(systemPrompt);

  let lastError: any = null;

  for (let idx = 0; idx < modelsToTry.length; idx++) {
    const currentModel = modelsToTry[idx];
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`;

    const parts: any[] = [];
    if (isVision && base64Data) {
      parts.push({ inlineData: { mimeType: mimeType || 'image/webp', data: base64Data } });
    }
    parts.push({ text: prompt });

    const body: any = {
      contents: [{ role: 'user', parts }],
    };

    if (systemPrompt && systemPrompt.trim()) {
      body.systemInstruction = { parts: [{ text: systemPrompt }] };
    }

    if (wantsJson) {
      body.generationConfig = { responseMimeType: 'application/json' };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 45000);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const errMsg = errJson?.error?.message || `Google API error ${res.status}`;
        const err = new Error(errMsg);
        (err as any).status = res.status;
        lastError = err;

        // Auto-failover immediately if high-demand, rate-limited, or deprecated
        if (res.status === 503 || res.status === 500 || res.status === 404 || res.status === 429) {
          console.warn(`[callGoogle] ${currentModel} returned ${res.status} (${errMsg}). Auto-switching to next model...`);
          // Brief pause before trying fallback to avoid hammering
          await new Promise((r) => setTimeout(r, 250));
          continue;
        }
        throw err;
      }

      const json = await res.json();
      const parts = json?.candidates?.[0]?.content?.parts || [];
      const nonThought = parts.filter((p: any) => !p.thought);
      const text = (nonThought.length > 0 ? nonThought : parts)
        .map((p: any) => p.text || '')
        .join('')
        .trim();
      if (!text) {
        throw new Error('Empty response from Google Gemini API');
      }
      return text;
    } catch (fetchErr: any) {
      lastError = fetchErr;
      if (
        fetchErr.status === 503 ||
        fetchErr.status === 500 ||
        fetchErr.status === 404 ||
        fetchErr.status === 429 ||
        fetchErr.name === 'AbortError'
      ) {
        console.warn(`[callGoogle] ${currentModel} failed (${fetchErr.message}). Retrying fallback...`);
        await new Promise((r) => setTimeout(r, 250));
        continue;
      }
      throw fetchErr;
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError || new Error('Google Gemini API calls failed for all models');
}
