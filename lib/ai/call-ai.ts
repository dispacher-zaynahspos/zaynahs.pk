import { getAISettings } from './settings';
import { normalizeGoogleModel } from './google';

/**
 * Downloads an image from a URL and converts it to a base64 string
 */
async function fetchImageAsBase64(url: string): Promise<{ base64: string; mimeType: string }> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = response.headers.get('content-type') || 'image/webp';
    return {
      base64: buffer.toString('base64'),
      mimeType
    };
  } catch (error) {
    console.error('[aiEngine] Error fetching image as base64:', error);
    throw error;
  }
}

/**
 * Main AI call function supporting Groq, Gemini, Claude, Mistral, DeepSeek, Workers AI, etc.
 * Rotates key array upon encountering rate limits (429, 503, 402).
 */
export async function callAI(
  prompt: string,
  systemPrompt: string,
  isVision: boolean = false,
  imageUrl?: string
): Promise<string> {
  const settings = await getAISettings();

  if (!settings.ai_enabled) {
    throw new Error('AI features are globally disabled in settings.');
  }

  let provider = isVision ? settings.vision_provider : settings.content_provider;
  let model = isVision ? settings.vision_model : settings.content_model;

  if (provider.toLowerCase() === 'gemini' || provider.toLowerCase() === 'google') {
    model = normalizeGoogleModel(model);
  }

  const section = isVision ? 'vision' : 'content';
  const keysRaw =
    settings.ai_model_credentials?.[section]?.[provider] ||
    (isVision ? settings.vision_keys : settings.content_keys) ||
    '';

  let keys = keysRaw
    .split('\n')
    .map((k) => k.trim())
    .filter(Boolean);

  // Fallback to environment keys if none configured in settings
  if (keys.length === 0) {
    if (provider.toLowerCase() === 'gemini' || provider.toLowerCase() === 'google') {
      const envKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY)?.trim();
      if (envKey) keys.push(envKey);
    } else if (provider.toLowerCase() === 'groq') {
      const envKey = process.env.GROQ_API_KEY?.trim();
      if (envKey) keys.push(envKey);
    }
  }

  // If still no keys found, fallback to Gemini if env key is available
  if (keys.length === 0) {
    const envGemini = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY)?.trim();
    if (envGemini) {
      provider = 'gemini';
      model = 'gemini-3.5-flash';
      keys.push(envGemini);
    }
  }

  if (keys.length === 0) {
    throw new Error(`No API keys found for provider: ${provider}`);
  }

  for (let i = 0; i < keys.length; i++) {
    const apiKey = keys[i];
    try {
      return await executeRequest(provider, model, apiKey, prompt, systemPrompt, isVision, imageUrl);
    } catch (err: any) {
      console.warn(`[aiEngine] Key ${i} failed for provider ${provider}:`, err.message || err);
      const status = err.status || err.statusCode;
      if (status === 429 || status === 503 || status === 402) {
        continue;
      }
      throw err;
    }
  }

  const freeHint = isVision
    ? ' Try switching to: Gemini 2.5 Flash (1500 req/day free), Groq llama-4-scout (14400 req/day), or OpenRouter free models.'
    : ' Try switching to: Groq llama-4-scout (fastest, 14400 req/day), Gemini 2.5 Flash, or Mistral mistral-small-2506.';
  throw new Error(`All ${provider} API keys exhausted (rate limited).${freeHint} Update keys or switch provider in Settings → AI Models.`);
}

async function executeRequest(
  provider: string,
  model: string,
  apiKey: string,
  prompt: string,
  systemPrompt: string,
  isVision: boolean,
  imageUrl?: string
): Promise<string> {
  let url = '';
  let headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  let body: any = {};

  let base64Data = '';
  let mimeType = 'image/webp';
  if (isVision && imageUrl) {
    const imgInfo = await fetchImageAsBase64(imageUrl);
    base64Data = imgInfo.base64;
    mimeType = imgInfo.mimeType;
  }

  switch (provider.toLowerCase()) {
    case 'gemini': {
      const primaryModel = normalizeGoogleModel(model);
      const fallbackModel = primaryModel === 'gemini-3.1-flash-lite' ? 'gemini-3.5-flash' : 'gemini-3.1-flash-lite';
      const modelsToTry = [primaryModel, fallbackModel];
      const wantsJson = /json|\{|\}/i.test(prompt) || /json/i.test(systemPrompt);

      const parts: any[] = [];
      if (isVision && base64Data) {
        parts.push({
          inlineData: {
            mimeType: mimeType,
            data: base64Data
          }
        });
      }
      parts.push({ text: prompt });

      const bodyData: any = {
        contents: [
          {
            role: 'user',
            parts: parts
          }
        ]
      };

      if (systemPrompt && systemPrompt.trim()) {
        bodyData.systemInstruction = {
          parts: [{ text: systemPrompt }]
        };
      }

      if (wantsJson) {
        bodyData.generationConfig = {
          responseMimeType: 'application/json'
        };
      }

      let lastError: any = null;
      for (const currentModel of modelsToTry) {
        url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`;
        headers = { 'Content-Type': 'application/json' };

        try {
          const res = await makeFetch(url, headers, bodyData);
          const json = JSON.parse(res);
          const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) throw new Error('Empty response from Gemini API');
          return text;
        } catch (fetchErr: any) {
          lastError = fetchErr;
          const status = fetchErr.status || fetchErr.statusCode;
          if (status === 503 || status === 404 || status === 429) {
            console.warn(`[callAI] Gemini model ${currentModel} returned ${status}. Retrying fallback...`);
            continue;
          }
          throw fetchErr;
        }
      }

      throw lastError || new Error('Gemini API call failed for all models');
    }

    case 'anthropic': {
      url = 'https://api.anthropic.com/v1/messages';
      headers = {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
        'anthropic-dangerous-direct-browser-access': 'true'
      };

      let content: any = prompt;
      if (isVision && base64Data) {
        content = [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType,
              data: base64Data
            }
          },
          {
            type: 'text',
            text: prompt
          }
        ];
      }

      body = {
        model: model,
        system: systemPrompt,
        messages: [{ role: 'user', content: content }],
        max_tokens: 4000
      };

      const res = await makeFetch(url, headers, body);
      const json = JSON.parse(res);
      const text = json?.content?.[0]?.text;
      if (!text) throw new Error('Empty response from Anthropic API');
      return text;
    }

    case 'cloudflare': {
      const accountId = process.env.CF_ACCOUNT_ID || '';
      url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;
      headers = {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      };

      if (isVision && base64Data) {
        body = {
          image: Array.from(Buffer.from(base64Data, 'base64')),
          prompt: prompt
        };
      } else {
        body = {
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ]
        };
      }

      const res = await makeFetch(url, headers, body);
      const json = JSON.parse(res);
      const text = json?.result?.response || json?.result?.text;
      if (!text) throw new Error('Empty response from Cloudflare API');
      return text;
    }

    default: {
      const providers: Record<string, string> = {
        groq: 'https://api.groq.com/openai/v1/chat/completions',
        cerebras: 'https://api.cerebras.ai/v1/chat/completions',
        mistral: 'https://api.mistral.ai/v1/chat/completions',
        openrouter: 'https://openrouter.ai/api/v1/chat/completions',
        nvidia: 'https://integrate.api.nvidia.com/v1/chat/completions',
        deepseek: 'https://api.deepseek.com/v1/chat/completions',
        together: 'https://api.together.xyz/v1/chat/completions',
        fireworks: 'https://api.fireworks.ai/inference/v1/chat/completions',
        siliconflow: 'https://api.siliconflow.cn/v1/chat/completions',
        kimi: 'https://api.moonshot.cn/v1/chat/completions',
        qwen: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
        openai: 'https://api.openai.com/v1/chat/completions',
        minimax: 'https://api.minimax.chat/v1/text/chatcompletion_v2',
      };

      const endpoint = providers[provider.toLowerCase()];
      if (!endpoint) throw new Error(`Unknown provider: ${provider}`);

      url = endpoint;
      headers = {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      };

      let userContent: any = prompt;
      if (isVision && base64Data) {
        userContent = [
          { type: 'text', text: prompt },
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${base64Data}`
            }
          }
        ];
      }

      const wantsJson = /json|\{|\}/i.test(prompt) || /json/i.test(systemPrompt);

      body = {
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent }
        ],
      };

      if (wantsJson) {
        body.response_format = { type: 'json_object' };
      }

      if (provider.toLowerCase() === 'openrouter') {
        headers['HTTP-Referer'] = process.env.NEXT_PUBLIC_SITE_URL || '';
        headers['X-Title'] = process.env.NEXT_PUBLIC_BRAND_NAME || 'Store';
      }

      const res = await makeFetch(url, headers, body);
      const json = JSON.parse(res);
      const text = json?.choices?.[0]?.message?.content;
      if (!text) throw new Error('Empty response from OpenAI compatible API');
      return text;
    }
  }
}

async function makeFetch(url: string, headers: Record<string, string>, body: any): Promise<string> {
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errText = await response.text();
    const error: any = new Error(`API Error ${response.status}: ${errText}`);
    error.status = response.status;
    throw error;
  }

  return response.text();
}
