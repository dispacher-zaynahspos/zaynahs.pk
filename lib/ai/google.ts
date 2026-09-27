// Real, currently-valid Google Generative Language API model IDs.
// Gemini 3.5 Flash is Google's active 1,500 req/day FREE model supporting both Text & Vision.
export const DEFAULT_GOOGLE_MODEL = 'gemini-3.5-flash';
export const GOOGLE_FALLBACK_MODEL = 'gemini-flash-latest';

export const GOOGLE_MODELS = {
  text: [
    'gemini-3.5-flash',
    'gemini-3.8-flash',
    'gemini-flash-latest',
    'gemini-3.5-flash-lite',
    'gemini-3.7-flash',
    'gemini-3.6-flash',
    'gemini-3.1-flash-lite',
    'gemma-4-31b-it',
    'gemma-4-26b-a4b-it'
  ],
  vision: [
    'gemini-3.5-flash',
    'gemini-3.8-flash',
    'gemini-flash-latest',
    'gemini-3.5-flash-lite',
    'gemini-3.7-flash',
    'gemini-3.6-flash'
  ],
} as const;

export const GOOGLE_FREE_LIMITS: Record<string, { reqPerDay: number; rpm: number }> = {
  'gemini-3.5-flash': { reqPerDay: 1500, rpm: 15 },
  'gemini-3.8-flash': { reqPerDay: 1500, rpm: 15 },
  'gemini-flash-latest': { reqPerDay: 1500, rpm: 15 },
  'gemini-3.5-flash-lite': { reqPerDay: 1500, rpm: 15 },
  'gemini-3.7-flash': { reqPerDay: 1500, rpm: 15 },
  'gemini-3.6-flash': { reqPerDay: 1500, rpm: 15 },
  'gemini-3.1-flash-lite': { reqPerDay: 1500, rpm: 15 },
};

/**
 * Resolve the admin-selected Google model to a real API model ID.
 * Automatically upgrades retired models (gemini-1.5-flash, gemini-2.0-flash, gemini-2.5-flash)
 * to gemini-3.5-flash to prevent 404 NOT_FOUND errors.
 */
export function normalizeGoogleModel(requestedModel: string): string {
  const m = (requestedModel || '').trim().toLowerCase();
  if (!m) return DEFAULT_GOOGLE_MODEL;
  if (
    m === 'gemini-1.5-flash' ||
    m === 'gemini-1.5-pro' ||
    m === 'gemini-2.0-flash' ||
    m === 'gemini-2.5-flash'
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
  const modelsToTry = Array.from(new Set([
    primaryModel,
    DEFAULT_GOOGLE_MODEL,
    'gemini-flash-latest',
    'gemini-3.8-flash',
    'gemini-3.5-flash-lite'
  ]));

  const wantsJson = /json|\{|\}/i.test(prompt) || /json/i.test(systemPrompt);

  let lastError: any = null;

  for (const currentModel of modelsToTry) {
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

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const errMsg = errJson?.error?.message || `Google API error ${res.status}`;
        const err = new Error(errMsg);
        (err as any).status = res.status;
        lastError = err;

        // If 503 (high demand) or 404 (model deprecated) or 429 (rate limit), try fallback
        if (res.status === 503 || res.status === 404 || res.status === 429) {
          console.warn(`[callGoogle] ${currentModel} returned ${res.status}. Retrying with fallback...`);
          continue;
        }
        throw err;
      }

      const json = await res.json();
      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('Empty response from Google Gemini API');
      }
      return text;
    } catch (fetchErr: any) {
      lastError = fetchErr;
      if (fetchErr.status === 503 || fetchErr.status === 404 || fetchErr.status === 429) {
        continue;
      }
      throw fetchErr;
    }
  }

  throw lastError || new Error('Google Gemini API calls failed for all models');
}
