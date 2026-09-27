// Real, currently-valid Google Generative Language API model IDs.
// `gemini-3.6-flash` (previously hardcoded here) is NOT a real Google model — it 404s.
export const DEFAULT_GOOGLE_MODEL = 'gemini-2.0-flash';
export const GOOGLE_FALLBACK_MODEL = 'gemini-1.5-flash';

export const GOOGLE_MODELS = {
  text: ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-flash-latest'],
  vision: ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-flash-latest'],
} as const;

export const GOOGLE_FREE_LIMITS: Record<string, { reqPerDay: number; rpm: number }> = {
  'gemini-2.5-flash': { reqPerDay: 1500, rpm: 15 },
  'gemini-2.0-flash': { reqPerDay: 1500, rpm: 15 },
  'gemini-1.5-flash': { reqPerDay: 1500, rpm: 15 },
  'gemini-1.5-pro': { reqPerDay: 50, rpm: 2 },
  'gemini-flash-latest': { reqPerDay: 1500, rpm: 15 },
};

/**
 * Resolve the admin-selected Google model to a real API model ID.
 * Respects any genuine `gemini-*` / `gemma-*` model the admin picked; coerces the
 * fictitious `gemini-3.x` strings (and blanks) to the safe current default.
 */
export function normalizeGoogleModel(requestedModel: string): string {
  const m = (requestedModel || '').trim().toLowerCase();
  if (!m) return DEFAULT_GOOGLE_MODEL;
  // Fictitious / non-existent Google models that were previously hardcoded → default.
  if (m.startsWith('gemini-3.')) return DEFAULT_GOOGLE_MODEL;
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
  const fallbackModel = primaryModel === GOOGLE_FALLBACK_MODEL ? DEFAULT_GOOGLE_MODEL : GOOGLE_FALLBACK_MODEL;
  const modelsToTry = [primaryModel, fallbackModel];

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
