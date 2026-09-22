import { callAI } from './call-ai';

/**
 * Shared helper to generate image SEO metadata using the vision model
 */
export async function generateImageMeta(imageUrl: string): Promise<{
  alt_text: string;
  seo_filename: string;
  title: string;
  description: string;
  caption: string;
}> {
  const systemPrompt = `You are an expert Image SEO optimizer. Analyze the provided image and generate relevant SEO tags. Return ONLY a valid JSON object matching the requested schema. Do not include markdown code block wrappers or extra text.`;
  const userPrompt = `Analyze this image and return ONLY this JSON schema:
{
  "alt_text": "Highly descriptive, SEO-friendly ALT text focusing on clothing attributes, material, and color.",
  "seo_filename": "hyphen-separated-lowercase-filename.webp",
  "title": "Clean, descriptive title for the image.",
  "description": "A 100-150 words detailed description of what is visible in the image.",
  "caption": "A short, engaging caption for the image."
}`;

  const rawResult = await callAI(userPrompt, systemPrompt, true, imageUrl);
  let cleanJsonStr = rawResult.trim();
  if (cleanJsonStr.includes('```json')) {
    cleanJsonStr = cleanJsonStr.split('```json')[1].split('```')[0].trim();
  } else if (cleanJsonStr.includes('```')) {
    cleanJsonStr = cleanJsonStr.split('```')[1].split('```')[0].trim();
  }
  return JSON.parse(cleanJsonStr);
}
