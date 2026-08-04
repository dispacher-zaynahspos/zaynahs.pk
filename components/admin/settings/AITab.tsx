'use client';

import React, { useState } from 'react';
import { ExternalLink, Zap, Loader2, ShieldCheck } from '@/components/common/Icons';

interface AITabProps {
  aiEnabled: boolean;
  setAiEnabled: (val: boolean) => void;
  contentProvider: string;
  setContentProvider: (val: string) => void;
  contentModel: string;
  setContentModel: (val: string) => void;
  aiModelCredentials: Record<string, Record<string, string>>;
  setAiModelCredentials: (val: Record<string, Record<string, string>>) => void;
  visionProvider: string;
  setVisionProvider: (val: string) => void;
  visionModel: string;
  setVisionModel: (val: string) => void;
  aiPersonaConfig: {
    tone: string;
    language: string;
    customInstructions: string;
    targetAudiences: string[];
    productTypes: string[];
  };
  setAiPersonaConfig: (val: {
    tone: string;
    language: string;
    customInstructions: string;
    targetAudiences: string[];
    productTypes: string[];
  }) => void;
  autoContentSeo: boolean;
  setAutoContentSeo: (val: boolean) => void;
  autoMediaAi: boolean;
  setAutoMediaAi: (val: boolean) => void;
  categoryDefaultTemplate: string;
  setCategoryDefaultTemplate: (val: string) => void;
  productDefaultTemplate: string;
  setProductDefaultTemplate: (val: string) => void;
  categoryDescriptionPrompt: string;
  setCategoryDescriptionPrompt: (val: string) => void;
  categoryDescriptionLimit: number;
  setCategoryDescriptionLimit: (val: number) => void;
  productDescriptionPrompt: string;
  setProductDescriptionPrompt: (val: string) => void;
  productDescriptionLimit: number;
  setProductDescriptionLimit: (val: number) => void;
  productShortPrompt: string;
  setProductShortPrompt: (val: string) => void;
  productShortLimit: number;
  setProductShortLimit: (val: number) => void;
  collectionDefaultTemplate: string;
  setCollectionDefaultTemplate: (val: string) => void;
  collectionDescriptionPrompt: string;
  setCollectionDescriptionPrompt: (val: string) => void;
  collectionDescriptionLimit: number;
  setCollectionDescriptionLimit: (val: number) => void;
}

const PROVIDERS = [
  { group: '🆓 FREE', options: ['groq', 'gemini', 'cerebras', 'mistral', 'cloudflare', 'nvidia', 'openrouter'] },
  { group: '💲 CHEAP', options: ['deepseek', 'together', 'fireworks', 'siliconflow', 'kimi', 'qwen'] },
  { group: '💎 PREMIUM', options: ['openai', 'anthropic', 'minimax'] }
];

const TEXT_MODELS: Record<string, string[]> = {
  // ── FREE PROVIDERS ──────────────────────────────────────────────
  groq: [
    'llama-3.3-70b-versatile',
    'llama-3.1-70b-versatile',
    'llama-3.1-8b-instant',
    'deepseek-r1-distill-llama-70b',
    'qwen-qwq-32b',
    'llama3-70b-8192',
    'llama3-8b-8192',
    'mixtral-8x7b-32768',
    'gemma2-9b-it',
    'mistral-saba-24b',
  ],
  gemini: [
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.5-flash-lite',
    'gemma-3-27b-it',
    'gemma-3-12b-it',
    'gemma-3-4b-it',
    'gemma-3-1b-it'
  ],
  cerebras: [
    'llama-3.3-70b',
    'llama-3.1-8b',
    'llama-3.1-70b',
    'llama3-70b-8k',
    'llama3-8b-8k'
  ],
  mistral: [
    'open-mistral-nemo',
    'devstral-2512',
    'magistral-medium-2509',
    'magistral-small-2509',
  ],
  cloudflare: [
    '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
    '@cf/meta/llama-3.3-70b-instruct',
    '@cf/meta/llama-3.1-70b-instruct',
    '@cf/meta/llama-3.1-8b-instruct',
    '@cf/meta/llama-3.2-3b-instruct',
    '@cf/meta/llama-3.2-1b-instruct',
    '@cf/google/gemma-3n-e4b-it',
    '@cf/google/gemma-3-12b-it',
    '@cf/google/gemma-2-2b-it',
    '@cf/qwen/qwen2.5-72b-instruct',
    '@cf/qwen/qwen2.5-coder-32b-instruct',
    '@cf/mistralai/mistral-7b-instruct-v0.2',
    '@cf/mistralai/mistral-small-3.1-24b-instruct',
    '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b',
    '@cf/microsoft/phi-2'
  ],
  nvidia: [
    'meta/llama-3.3-70b-instruct',
    'meta/llama-3.1-70b-instruct',
    'meta/llama-3.1-8b-instruct',
    'nvidia/llama-3.1-nemotron-70b-instruct',
    'nvidia/nemotron-4-340b-instruct',
    'nvidia/nemotron-mini-4b-instruct',
    'mistralai/mistral-large-2-instruct',
    'mistralai/mistral-nemo-12b-instruct',
    'mistralai/mixtral-8x7b-instruct-v0.1',
    'mistralai/mixtral-8x22b-instruct-v0.1',
    'google/gemma-3-27b-it',
    'google/gemma-3-12b-it',
    'microsoft/phi-3-mini-128k-instruct',
    'microsoft/phi-3-medium-128k-instruct',
    'microsoft/phi-3.5-mini-instruct',
    'qwen/qwen2.5-72b-instruct',
    'qwen/qwen2.5-7b-instruct',
    'deepseek-ai/deepseek-r1',
    'deepseek-ai/deepseek-coder-6.7b-instruct'
  ],
  openrouter: [
    'meta-llama/llama-3.3-70b-instruct:free',
    'deepseek/deepseek-r1:free',
    'deepseek/deepseek-chat:free',
    'deepseek/deepseek-v3-base:free',
    'qwen/qwen3-235b-a22b:free',
    'qwen/qwen3-30b-a3b:free',
    'qwen/qwen3-8b:free',
    'google/gemma-3-27b-it:free',
    'google/gemma-3-12b-it:free',
    'google/gemma-3-4b-it:free',
    'microsoft/phi-4-reasoning-plus:free',
    'microsoft/phi-4-reasoning:free',
    'microsoft/phi-4-mini-reasoning:free',
    'mistralai/mistral-7b-instruct:free',
    'mistralai/mistral-nemo:free',
    'meta-llama/llama-3.1-8b-instruct:free',
    'meta-llama/llama-3.2-3b-instruct:free',
    'thudm/glm-z1-32b:free',
    'thudm/glm-4-32b:free',
    'nousresearch/hermes-3-llama-3.1-405b:free',
    'openchat/openchat-7b:free',
    'huggingfaceh4/zephyr-7b-beta:free'
  ],
  // ── CHEAP PROVIDERS ──────────────────────────────────────────────
  deepseek: [
    'deepseek-v4-flash',
    'deepseek-chat',
    'deepseek-reasoner',
    'deepseek-coder',
  ],
  together: [
    'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
    'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
    'mistralai/Mixtral-8x7B-Instruct-v0.1',
    'mistralai/Mistral-7B-Instruct-v0.3',
    'Qwen/Qwen2.5-72B-Instruct-Turbo',
    'Qwen/QwQ-32B',
    'deepseek-ai/DeepSeek-R1',
    'deepseek-ai/DeepSeek-V3',
    'google/gemma-2-27b-it',
    'google/gemma-2-9b-it'
  ],
  fireworks: [
    'accounts/fireworks/models/llama-v3p3-70b-instruct',
    'accounts/fireworks/models/llama-v3p2-3b-instruct',
    'accounts/fireworks/models/llama-v3p1-8b-instruct',
    'accounts/fireworks/models/mixtral-8x7b-instruct',
    'accounts/fireworks/models/mixtral-8x22b-instruct',
    'accounts/fireworks/models/gemma2-9b-it',
    'accounts/fireworks/models/qwen2p5-72b-instruct',
    'accounts/fireworks/models/deepseek-r1',
    'accounts/fireworks/models/deepseek-v3'
  ],
  siliconflow: [
    'Qwen/Qwen3-235B-A22B',
    'Qwen/Qwen3-30B-A3B',
    'Qwen/Qwen2.5-72B-Instruct',
    'Qwen/Qwen2.5-32B-Instruct',
    'Qwen/Qwen2.5-7B-Instruct',
    'meta-llama/Meta-Llama-3.1-70B-Instruct',
    'meta-llama/Meta-Llama-3.1-8B-Instruct',
    'deepseek-ai/DeepSeek-R1',
    'deepseek-ai/DeepSeek-V3',
    'deepseek-ai/DeepSeek-V2.5',
    'THUDM/glm-4-9b-chat',
    '01-ai/Yi-1.5-34B-Chat-16K',
    'internlm/internlm2_5-20b-chat',
    'mistralai/Mistral-7B-Instruct-v0.2'
  ],
  kimi: [
    'moonshot-v1-8k',
    'moonshot-v1-32k',
    'moonshot-v1-128k',
    'kimi-latest',
    'kimi-thinking-preview'
  ],
  qwen: [
    'qwen3-235b-a22b',
    'qwen3-30b-a3b',
    'qwen3-32b',
    'qwen3-14b',
    'qwen3-8b',
    'qwen2.5-72b-instruct',
    'qwen2.5-32b-instruct',
    'qwen2.5-14b-instruct',
    'qwen2.5-7b-instruct',
    'qwq-32b',
    'qwen2.5-coder-32b-instruct',
    'qwen2.5-coder-7b-instruct'
  ],
  // ── PREMIUM PROVIDERS ───────────────────────────────────────────
  openai: [
    'gpt-4.1',
    'gpt-4.1-mini',
    'gpt-4.1-nano',
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
    'gpt-4',
    'gpt-3.5-turbo',
    'o4-mini',
    'o3',
    'o3-mini',
    'o1',
    'o1-mini',
    'o1-preview'
  ],
  anthropic: [
    'claude-opus-4-5',
    'claude-sonnet-4-5',
    'claude-haiku-3-5',
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022',
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307'
  ],
  minimax: [
    'MiniMax-Text-01',
    'abab6.5s-chat',
    'abab6.5g-chat',
    'abab5.5-chat'
  ]
};

const VISION_MODELS: Record<string, string[]> = {
  // ── FREE PROVIDERS ──────────────────────────────────────────────
  groq: [
    'meta-llama/llama-4-scout-17b-16e-instruct',
    'meta-llama/llama-4-maverick-17b-128e-instruct',
    'llama-3.2-11b-vision-preview',
    'llama-3.2-90b-vision-preview',
  ],
  gemini: [
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.5-flash-lite',
  ],
  cerebras: [
    'llama-3.2-11b-vision-instruct'
  ],
  mistral: [
    'mistral-small-2506',
    'ministral-3b-2512',
    'ministral-8b-2512',
    'ministral-14b-2512',
    'mistral-large-2512',
    'mistral-medium-2508',
  ],
  cloudflare: [
    '@cf/meta/llama-3.2-11b-vision-instruct',
    '@cf/meta/llama-4-scout-17b-16e-instruct',
    '@cf/mistralai/mistral-small-3.1-24b-instruct',
    '@cf/qwen/qwen2.5-vl-7b-instruct',
    '@cf/google/gemma-3-12b-it',
    '@cf/microsoft/phi-4-multimodal-instruct'
  ],
  nvidia: [
    'meta/llama-4-maverick-17b-128e-instruct',
    'meta/llama-4-scout-17b-16e-instruct',
    'meta/llama-3.2-90b-vision-instruct',
    'meta/llama-3.2-11b-vision-instruct',
    'nvidia/llama-3.1-nemotron-nano-vl-8b-v1',
    'nvidia/neva-22b',
    'google/paligemma',
    'microsoft/phi-3.5-vision-instruct',
    'microsoft/phi-4-multimodal-instruct',
    'mistralai/pixtral-12b-vision',
    'qwen/qwen2.5-vl-72b-instruct',
    'qwen/qwen2-vl-7b-instruct'
  ],
  openrouter: [
    'google/gemini-2.5-flash-preview:free',
    'google/gemini-2.0-flash-exp:free',
    'meta-llama/llama-4-maverick:free',
    'meta-llama/llama-4-scout:free',
    'meta-llama/llama-3.2-11b-vision-instruct:free',
    'qwen/qwen2.5-vl-7b-instruct:free',
    'microsoft/phi-4-multimodal-instruct:free'
  ],
  // ── CHEAP PROVIDERS ──────────────────────────────────────────────
  deepseek: [
    'deepseek-chat',
    'deepseek-reasoner',
    'deepseek-v4-flash',
  ],
  together: [
    'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8',
    'meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo',
    'meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo',
    'Qwen/Qwen2-VL-72B-Instruct'
  ],
  fireworks: [
    'accounts/fireworks/models/llama-v3p2-11b-vision-instruct',
    'accounts/fireworks/models/llama-v3p2-90b-vision-instruct',
    'accounts/fireworks/models/phi-3-vision-128k-instruct'
  ],
  siliconflow: [
    'Qwen/Qwen2.5-VL-72B-Instruct',
    'Qwen/Qwen2.5-VL-7B-Instruct',
    'meta-llama/Llama-3.2-11B-Vision-Instruct',
    'meta-llama/Llama-3.2-90B-Vision-Instruct',
    'deepseek-ai/DeepSeek-VL2',
    'THUDM/glm-4v-9b'
  ],
  kimi: [
    'moonshot-v1-8k',
    'moonshot-v1-32k',
    'moonshot-v1-128k'
  ],
  qwen: [
    'qwen-vl-max',
    'qwen-vl-plus',
    'qwen2.5-vl-72b-instruct',
    'qwen2.5-vl-7b-instruct',
    'qwen2-vl-72b-instruct',
    'qwen2-vl-7b-instruct'
  ],
  // ── PREMIUM PROVIDERS ───────────────────────────────────────────
  openai: [
    'gpt-4.1',
    'gpt-4.1-mini',
    'gpt-4.1-nano',
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
    'o4-mini',
    'o3'
  ],
  anthropic: [
    'claude-opus-4-5',
    'claude-sonnet-4-5',
    'claude-haiku-3-5',
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022',
    'claude-3-opus-20240229'
  ],
  minimax: [
    'MiniMax-VL-01',
    'abab6.5s-chat'
  ]
};

const AI_TONES = [
  { id: 'Professional', name: 'Professional & Informative' },
  { id: 'Casual', name: 'Casual & Friendly' },
  { id: 'Bold', name: 'Bold & Persuasive' },
  { id: 'Elegant', name: 'Elegant & Luxury-focused' },
  { id: 'Urgent', name: 'Urgent & Sale-driven' },
];

const AI_LANGUAGES = [
  { id: 'English', name: 'English' },
  { id: 'Urdu', name: 'Urdu (اردو)' },
  { id: 'Roman Urdu', name: 'Roman Urdu (Urdu written in English alphabets)' },
];

const PROVIDER_KEY_LINKS: Record<string, string> = {
  groq: 'https://console.groq.com/keys',
  gemini: 'https://aistudio.google.com/apikey',
  openai: 'https://platform.openai.com/api-keys',
  anthropic: 'https://console.anthropic.com/settings/keys',
  deepseek: 'https://platform.deepseek.com/api_keys',
  nvidia: 'https://build.nvidia.com/explore/discover',
  mistral: 'https://console.mistral.ai/api-keys/',
  cloudflare: 'https://dash.cloudflare.com/profile/api-tokens',
  openrouter: 'https://openrouter.ai/keys',
  together: 'https://api.together.xyz/settings/api-keys',
  fireworks: 'https://fireworks.ai/api-keys',
  siliconflow: 'https://cloud.siliconflow.cn/account/ak',
  minimax: 'https://platform.minimaxi.com/user-center/basic-information/interface-key',
  kimi: 'https://platform.moonshot.cn/console/api-keys',
  qwen: 'https://dashscope.console.aliyun.com/apiKey',
  cerebras: 'https://cloud.cerebras.ai/platform'
};

const AUDIENCE_PRESETS = ['Men', 'Women', 'Kids'];
const TYPE_PRESETS = ['Clothes', 'Shoes', 'Accessories', 'Jewellery', 'Bags'];

// ─────────────────────────────────────────────────────────────
// Business Type Presets — auto-fill all AI writing settings
// ─────────────────────────────────────────────────────────────
export interface BusinessPreset {
  id: string;
  name: string;
  emoji: string;
  audiences: string[];
  productTypes: string[];
  tone: string;
  categoryPrompt: string;
  categoryLimit: number;
  productPrompt: string;
  productLimit: number;
  shortPrompt: string;
  shortLimit: number;
  categoryTemplate: string;
  productTemplate: string;
}

const BUSINESS_PRESETS: BusinessPreset[] = [
  {
    id: 'clothing',
    name: 'Clothing & Fashion',
    emoji: '👗',
    audiences: ['Women', 'Men', 'Kids'],
    productTypes: ['Clothes', 'Dresses', 'Tops', 'Trousers', 'Suits', 'T-shirts', 'Co-ord Sets'],
    tone: 'Professional',
    categoryPrompt: 'Write an engaging category overview. Highlight fabric quality, style variety, and occasion suitability. Mention Pakistani fashion trends.',
    categoryLimit: 100,
    productPrompt: 'Write a detailed product description with fabric composition, fit, occasions, care instructions, and styling tips for Pakistani audiences.',
    productLimit: 200,
    shortPrompt: 'Write a catchy 1-line highlight with fabric and key feature. Include focus keyword.',
    shortLimit: 25,
    categoryTemplate: '<p>Explore our exclusively curated <strong>{{category_name}}</strong> collection — from everyday elegance to festive statement pieces. Premium materials, intricate details, and exquisite craftsmanship designed for every occasion.</p>',
    productTemplate: '<h2>{{product_name}} — Style Meets Comfort</h2>\n<p>Elevate your wardrobe with this premium piece from our curated fashion collection.</p>\n<h2>Key Features</h2>\n<ul>\n<li><strong>Fabric:</strong> Premium quality material</li>\n<li><strong>Fit:</strong> Comfortable, true-to-size cut</li>\n<li><strong>Occasions:</strong> Casual, formal, and festive wear</li>\n</ul>\n<h2>Care Instructions</h2>\n<ul>\n<li>Machine wash cold</li>\n<li>Do not bleach</li>\n</ul>',
  },
  {
    id: 'jewellery',
    name: 'Jewellery',
    emoji: '💍',
    audiences: ['Women', 'Men'],
    productTypes: ['Jewellery', 'Necklaces', 'Earrings', 'Rings', 'Bracelets', 'Bangles', 'Pendants'],
    tone: 'Elegant',
    categoryPrompt: 'Write a luxurious, elegant category description. Mention craftsmanship, metals, stones, and occasions like weddings, eid, and formal events.',
    categoryLimit: 100,
    productPrompt: 'Write a premium jewellery description inspired by: paragraph explaining the jewelry style, material quality, and design; "Key Features" bullet list; "Available Finishes" list; "Care Instructions" section. Make it luxurious and emotional.',
    productLimit: 200,
    shortPrompt: 'Write a catchy, high-conversion single-line product highlight about the jewelry piece. Include focus keyword and optimize for SEO.',
    shortLimit: 25,
    categoryTemplate: '<p>Explore our exclusively curated <strong>{{category_name}}</strong> collection — from everyday elegance to festive statement pieces. Premium materials, intricate details, and exquisite craftsmanship designed for women of all ages.</p>',
    productTemplate: '<h2>Exquisite Craftsmanship</h2>\n<p>Each piece in our <strong>{{product_name}}</strong> collection is designed to make you feel radiant and timeless.</p>\n<h2>Key Features</h2>\n<ul>\n<li><strong>Premium Diamonds:</strong> Sparkling marquise and round cut</li>\n<li><strong>Durable Chain:</strong> Fade-resistant and tarnish-free</li>\n<li><strong>Adjustable Length:</strong> Perfect fit for everyone</li>\n</ul>\n<h2>Care Instructions</h2>\n<ul>\n<li>Keep away from water, perfume, and lotion</li>\n<li>Store in a dry place away from direct sunlight</li>\n<li>Wipe gently with a soft cloth after each use</li>\n</ul>',
  },
  {
    id: 'shoes',
    name: 'Shoes & Footwear',
    emoji: '👟',
    audiences: ['Women', 'Men', 'Kids'],
    productTypes: ['Shoes', 'Sneakers', 'Heels', 'Sandals', 'Boots', 'Flats', 'Slippers'],
    tone: 'Bold',
    categoryPrompt: 'Write an energetic category description for shoes. Highlight comfort technology, sole quality, occasions, and style types.',
    categoryLimit: 100,
    productPrompt: 'Write a detailed shoe description covering material (upper, sole), comfort features, sizing guide, occasion fit, and care tips.',
    productLimit: 180,
    shortPrompt: 'Write a bold, SEO-rich 1-line highlight of the shoe model. Include material and key comfort feature.',
    shortLimit: 25,
    categoryTemplate: '<p>Step into style with our premium <strong>{{category_name}}</strong> collection. Engineered for comfort and designed for every occasion — from casual outings to formal events.</p>',
    productTemplate: '<h2>Step Into Comfort & Style</h2>\n<p>Our <strong>{{product_name}}</strong> combines premium craftsmanship with all-day comfort.</p>\n<h2>Key Features</h2>\n<ul>\n<li><strong>Upper Material:</strong> Premium quality leather/fabric</li>\n<li><strong>Sole:</strong> Anti-slip, cushioned rubber sole</li>\n<li><strong>Fit:</strong> True to size, available in multiple widths</li>\n</ul>\n<h2>Care Tips</h2>\n<ul>\n<li>Wipe clean with dry cloth</li>\n<li>Store away from direct sunlight</li>\n</ul>',
  },
  {
    id: 'bags',
    name: 'Bags & Accessories',
    emoji: '👜',
    audiences: ['Women', 'Men'],
    productTypes: ['Bags', 'Handbags', 'Clutches', 'Wallets', 'Belts', 'Backpacks', 'Tote Bags'],
    tone: 'Professional',
    categoryPrompt: 'Write a professional category description for bags. Highlight material quality, capacity, compartments, and style versatility.',
    categoryLimit: 100,
    productPrompt: 'Write a detailed bag description covering material, dimensions, compartments, hardware quality, and occasions it suits.',
    productLimit: 180,
    shortPrompt: 'Write a conversion-driven 1-line product summary for a bag. Include material and key functional feature.',
    shortLimit: 25,
    categoryTemplate: '<p>Discover our curated <strong>{{category_name}}</strong> collection — where function meets fashion. Crafted from premium materials with thoughtful design for the modern lifestyle.</p>',
    productTemplate: '<h2>Crafted for the Modern Lifestyle</h2>\n<p>Our <strong>{{product_name}}</strong> blends timeless design with everyday functionality.</p>\n<h2>Key Features</h2>\n<ul>\n<li><strong>Material:</strong> Premium quality leather/synthetic</li>\n<li><strong>Compartments:</strong> Spacious main compartment + organizer pockets</li>\n<li><strong>Hardware:</strong> Durable gold/silver-tone metal hardware</li>\n</ul>\n<h2>Care Instructions</h2>\n<ul>\n<li>Wipe with a dry cloth</li>\n<li>Avoid direct sunlight and moisture</li>\n</ul>',
  },
  {
    id: 'electronics',
    name: 'Electronics & Laptops',
    emoji: '💻',
    audiences: ['Men', 'Women', 'Students'],
    productTypes: ['Laptops', 'Tablets', 'Accessories', 'Headphones', 'Keyboards', 'Monitors', 'UPS'],
    tone: 'Professional',
    categoryPrompt: 'Write a technical, informative category description. Highlight performance specs, brand reliability, and use cases (office, gaming, study).',
    categoryLimit: 100,
    productPrompt: 'Write a comprehensive electronics product description with specs (processor, RAM, storage, display), performance highlights, use cases, and warranty info.',
    productLimit: 250,
    shortPrompt: 'Write a precise, spec-driven 1-line product summary. Mention key spec and use case.',
    shortLimit: 25,
    categoryTemplate: '<p>Explore our premium <strong>{{category_name}}</strong> collection — featuring the latest technology from trusted global brands. Built for performance, designed for productivity.</p>',
    productTemplate: '<h2>Performance Meets Reliability</h2>\n<p>The <strong>{{product_name}}</strong> is engineered for professionals and power users who demand the best.</p>\n<h2>Key Specifications</h2>\n<ul>\n<li><strong>Processor:</strong> Latest generation CPU</li>\n<li><strong>RAM:</strong> High-speed memory for multitasking</li>\n<li><strong>Storage:</strong> Fast SSD storage</li>\n<li><strong>Display:</strong> Full HD+ display</li>\n</ul>\n<h2>Warranty & Support</h2>\n<ul>\n<li>Official brand warranty included</li>\n<li>Authorized service centers across Pakistan</li>\n</ul>',
  },
  {
    id: 'mobile',
    name: 'Mobile Phones',
    emoji: '📱',
    audiences: ['Men', 'Women', 'Students'],
    productTypes: ['Mobile Phones', 'Smartphones', 'Covers', 'Chargers', 'Cables', 'Screen Protectors'],
    tone: 'Bold',
    categoryPrompt: 'Write an exciting category description for mobile phones. Highlight camera quality, battery life, performance, and price-to-value ratio.',
    categoryLimit: 100,
    productPrompt: 'Write a comprehensive mobile phone description with camera specs, battery, processor, display, connectivity features, and storage options.',
    productLimit: 250,
    shortPrompt: 'Write a punchy, spec-focused 1-line mobile phone summary. Highlight camera or battery as the hero feature.',
    shortLimit: 25,
    categoryTemplate: '<p>Stay connected with our latest <strong>{{category_name}}</strong> collection — featuring flagship and budget-friendly smartphones with cutting-edge features and official warranties.</p>',
    productTemplate: '<h2>Capture Every Moment. Power Through Every Day.</h2>\n<p>The <strong>{{product_name}}</strong> redefines what a smartphone can do.</p>\n<h2>Key Specifications</h2>\n<ul>\n<li><strong>Camera:</strong> Pro-grade multi-lens system</li>\n<li><strong>Battery:</strong> Long-lasting fast-charging battery</li>\n<li><strong>Processor:</strong> High-performance chipset</li>\n<li><strong>Display:</strong> Smooth AMOLED/LCD display</li>\n</ul>\n<h2>In The Box</h2>\n<ul>\n<li>Smartphone</li>\n<li>Charger & Cable</li>\n<li>Official Warranty Card</li>\n</ul>',
  },
  {
    id: 'hardware',
    name: 'Hardware & Tools',
    emoji: '🔧',
    audiences: ['Men', 'Technicians', 'Businesses'],
    productTypes: ['Tools', 'Hardware', 'Equipment', 'Spare Parts', 'Power Tools', 'Hand Tools'],
    tone: 'Professional',
    categoryPrompt: 'Write a professional, technical category description for hardware and tools. Highlight durability, materials, and professional use cases.',
    categoryLimit: 100,
    productPrompt: 'Write a detailed technical description covering build quality, materials, specifications, safety features, and professional applications.',
    productLimit: 200,
    shortPrompt: 'Write a precise, professional 1-line product summary. Highlight key spec or professional use case.',
    shortLimit: 25,
    categoryTemplate: '<p>Shop our premium <strong>{{category_name}}</strong> collection — professional-grade tools and hardware engineered for durability, precision, and performance in demanding environments.</p>',
    productTemplate: '<h2>Built for Professionals</h2>\n<p>The <strong>{{product_name}}</strong> is engineered to deliver reliable performance in the most demanding conditions.</p>\n<h2>Key Specifications</h2>\n<ul>\n<li><strong>Material:</strong> Industrial-grade quality</li>\n<li><strong>Durability:</strong> Heavy-duty construction</li>\n<li><strong>Application:</strong> Professional and DIY use</li>\n</ul>\n<h2>Safety & Compliance</h2>\n<ul>\n<li>Safety-certified design</li>\n<li>Ergonomic grip for extended use</li>\n</ul>',
  },
  {
    id: 'cosmetics',
    name: 'Cosmetics & Beauty',
    emoji: '💄',
    audiences: ['Women'],
    productTypes: ['Makeup', 'Skincare', 'Lipstick', 'Foundation', 'Serums', 'Moisturizers', 'Perfumes'],
    tone: 'Elegant',
    categoryPrompt: 'Write a luxurious, empowering beauty category description. Highlight ingredients, skin benefits, and the confidence it brings.',
    categoryLimit: 100,
    productPrompt: 'Write a premium beauty product description with key ingredients, skin benefits, how-to-use instructions, and who it suits best.',
    productLimit: 200,
    shortPrompt: 'Write a glamorous, benefit-driven 1-line product highlight. Mention key ingredient and skin benefit.',
    shortLimit: 25,
    categoryTemplate: '<p>Discover our premium <strong>{{category_name}}</strong> collection — expertly formulated to enhance your natural beauty. From everyday essentials to luxurious treatments, find your perfect match.</p>',
    productTemplate: '<h2>Your Skin Deserves the Best</h2>\n<p>Our <strong>{{product_name}}</strong> is crafted with premium ingredients to deliver visible results.</p>\n<h2>Key Benefits</h2>\n<ul>\n<li><strong>Active Ingredients:</strong> Clinically proven formulation</li>\n<li><strong>Skin Type:</strong> Suitable for all skin types</li>\n<li><strong>Results:</strong> Visible improvement within days</li>\n</ul>\n<h2>How to Use</h2>\n<ul>\n<li>Apply to clean skin morning and/or evening</li>\n<li>Follow with SPF during daytime use</li>\n</ul>',
  },
  {
    id: 'furniture',
    name: 'Furniture & Home Decor',
    emoji: '🪑',
    audiences: ['Women', 'Men', 'Families'],
    productTypes: ['Furniture', 'Sofa', 'Bed', 'Tables', 'Chairs', 'Wardrobes', 'Decor', 'Lighting'],
    tone: 'Professional',
    categoryPrompt: 'Write an inspiring home decor category description. Highlight design style, material quality, durability, and how it transforms living spaces.',
    categoryLimit: 100,
    productPrompt: 'Write a detailed furniture description covering materials, dimensions, assembly info, style compatibility, and maintenance.',
    productLimit: 200,
    shortPrompt: 'Write a space-inspiring 1-line product summary. Highlight material and design style.',
    shortLimit: 25,
    categoryTemplate: '<p>Transform your living space with our premium <strong>{{category_name}}</strong> collection — blending contemporary design with exceptional craftsmanship for a home that reflects your style.</p>',
    productTemplate: '<h2>Elevate Your Living Space</h2>\n<p>The <strong>{{product_name}}</strong> combines aesthetic design with practical functionality.</p>\n<h2>Key Features</h2>\n<ul>\n<li><strong>Material:</strong> Premium quality wood/fabric/metal</li>\n<li><strong>Dimensions:</strong> Optimal size for Pakistani homes</li>\n<li><strong>Style:</strong> Modern/Contemporary/Traditional design</li>\n</ul>\n<h2>Care & Maintenance</h2>\n<ul>\n<li>Wipe clean with dry cloth</li>\n<li>Avoid direct sunlight to preserve color</li>\n</ul>',
  },
  {
    id: 'general',
    name: 'General / Multi-Category',
    emoji: '🛒',
    audiences: ['Women', 'Men', 'Kids'],
    productTypes: ['Products', 'Items', 'Goods', 'Accessories', 'Gifts'],
    tone: 'Professional',
    categoryPrompt: 'Write an engaging category overview that welcomes customers and highlights quality, variety, and value.',
    categoryLimit: 80,
    productPrompt: 'Write a comprehensive product description highlighting features, benefits, material quality, and who it suits best.',
    productLimit: 150,
    shortPrompt: 'Write a concise, benefit-focused 1-line product highlight. Include focus keyword.',
    shortLimit: 20,
    categoryTemplate: '<p>Explore our <strong>{{category_name}}</strong> collection — carefully selected for quality, value, and customer satisfaction. Find exactly what you need.</p>',
    productTemplate: '<h2>{{product_name}} — Quality You Can Trust</h2>\n<p>This premium product delivers exceptional value and performance.</p>\n<h2>Key Features</h2>\n<ul>\n<li>Premium quality construction</li>\n<li>Designed for everyday use</li>\n<li>Value for money</li>\n</ul>',
  },
];


export default function AITab({
  aiEnabled,
  setAiEnabled,
  contentProvider,
  setContentProvider,
  contentModel,
  setContentModel,
  aiModelCredentials,
  setAiModelCredentials,
  visionProvider,
  setVisionProvider,
  visionModel,
  setVisionModel,
  aiPersonaConfig,
  setAiPersonaConfig,
  autoContentSeo,
  setAutoContentSeo,
  autoMediaAi,
  setAutoMediaAi,
  categoryDefaultTemplate,
  setCategoryDefaultTemplate,
  productDefaultTemplate,
  setProductDefaultTemplate,
  categoryDescriptionPrompt,
  setCategoryDescriptionPrompt,
  categoryDescriptionLimit,
  setCategoryDescriptionLimit,
  productDescriptionPrompt,
  setProductDescriptionPrompt,
  productDescriptionLimit,
  setProductDescriptionLimit,
  productShortPrompt,
  setProductShortPrompt,
  productShortLimit,
  setProductShortLimit,
}: AITabProps) {
  const [customAudience, setCustomAudience] = useState('');
  const [customType, setCustomType] = useState('');
  const [testingKey, setTestingKey] = useState<'content' | 'vision' | null>(null);
  const [keyTestResult, setKeyTestResult] = useState<{ section: string; valid: boolean; message: string } | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');

  const applyPreset = (presetId: string) => {
    const preset = BUSINESS_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    setAiPersonaConfig({
      ...aiPersonaConfig,
      targetAudiences: preset.audiences,
      productTypes: preset.productTypes,
      tone: preset.tone,
    });
    setCategoryDescriptionPrompt(preset.categoryPrompt);
    setCategoryDescriptionLimit(preset.categoryLimit);
    setProductDescriptionPrompt(preset.productPrompt);
    setProductDescriptionLimit(preset.productLimit);
    setProductShortPrompt(preset.shortPrompt);
    setProductShortLimit(preset.shortLimit);
    setCategoryDefaultTemplate(preset.categoryTemplate);
    setProductDefaultTemplate(preset.productTemplate);
    setSelectedPresetId(presetId);
  };

  const handleTestKey = async (section: 'content' | 'vision') => {
    const provider = section === 'content' ? contentProvider : visionProvider;
    const keysRaw = aiModelCredentials?.[section]?.[provider] || '';
    const firstKey = keysRaw.split('\n').map(k => k.trim()).filter(Boolean)[0];
    if (!firstKey) {
      setKeyTestResult({ section, valid: false, message: 'No API key entered' });
      return;
    }
    setTestingKey(section);
    setKeyTestResult(null);
    try {
      const res = await fetch('/api/ai/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey: firstKey, section }),
      });
      const data = await res.json();
      setKeyTestResult({ section, valid: data.valid, message: data.valid ? 'Key is valid ✓' : (data.error || 'Invalid key') });
    } catch {
      setKeyTestResult({ section, valid: false, message: 'Connection failed' });
    } finally {
      setTestingKey(null);
    }
  };

  const setContentKeys = (val: string) => {
    setAiModelCredentials({
      ...aiModelCredentials,
      content: {
        ...(aiModelCredentials.content || {}),
        [contentProvider]: val,
      },
    });
  };

  const setVisionKeys = (val: string) => {
    setAiModelCredentials({
      ...aiModelCredentials,
      vision: {
        ...(aiModelCredentials.vision || {}),
        [visionProvider]: val,
      },
    });
  };

  const contentKeys = aiModelCredentials?.content?.[contentProvider] || '';
  const visionKeys = aiModelCredentials?.vision?.[visionProvider] || '';

  const handleContentProviderChange = (val: string) => {
    setContentProvider(val);
    const defaultModel = TEXT_MODELS[val]?.[0] || '';
    setContentModel(defaultModel);
  };

  const handleVisionProviderChange = (val: string) => {
    setVisionProvider(val);
    const defaultModel = VISION_MODELS[val]?.[0] || '';
    setVisionModel(defaultModel);
  };

  const hydrated = aiPersonaConfig && (aiPersonaConfig.targetAudiences?.length > 0 || aiPersonaConfig.productTypes?.length > 0);
  const [isHydrated, setIsHydrated] = useState(false);
  React.useEffect(() => {
    const timer = setTimeout(() => setIsHydrated(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const audiencesList = aiPersonaConfig.targetAudiences || [];
  const typesList = aiPersonaConfig.productTypes || [];

  const toggleAudience = (aud: string) => {
    const updated = audiencesList.includes(aud)
      ? audiencesList.filter(a => a !== aud)
      : [...audiencesList, aud];
    setAiPersonaConfig({ ...aiPersonaConfig, targetAudiences: updated });
  };

  const addCustomAudience = () => {
    if (!customAudience.trim()) return;
    const clean = customAudience.trim();
    if (!audiencesList.includes(clean)) {
      setAiPersonaConfig({ ...aiPersonaConfig, targetAudiences: [...audiencesList, clean] });
    }
    setCustomAudience('');
  };

  const toggleProductType = (t: string) => {
    const updated = typesList.includes(t)
      ? typesList.filter(x => x !== t)
      : [...typesList, t];
    setAiPersonaConfig({ ...aiPersonaConfig, productTypes: updated });
  };

  const addCustomProductType = () => {
    if (!customType.trim()) return;
    const clean = customType.trim();
    if (!typesList.includes(clean)) {
      setAiPersonaConfig({ ...aiPersonaConfig, productTypes: [...typesList, clean] });
    }
    setCustomType('');
  };

  if (!isHydrated) {
    return (
      <div className="space-y-8 col-span-1 md:col-span-2">
        <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4" />
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4" />
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 col-span-1 md:col-span-2">
      {/* Master Switch Card */}
      <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between gap-4 transition-colors">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Enable AI Copilot globally
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Turn the AI system ON or OFF. When disabled, "Write AI" description generators and background indexing checks will be suspended.
          </p>
        </div>
        <input
          type="checkbox"
          checked={aiEnabled}
          onChange={(e) => setAiEnabled(e.target.checked)}
          className="w-10 h-6 rounded-full bg-gray-200 checked:bg-[#e94560] appearance-none cursor-pointer transition-all relative after:content-[''] after:absolute after:h-5 after:w-5 after:bg-white after:rounded-full after:top-[2px] after:left-[2px] checked:after:left-[18px] after:transition-all shrink-0"
        />
      </div>

      {aiEnabled ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Panel: Models & Credentials */}
          <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6 transition-colors">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">AI Models & Credentials</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Select model providers and supply your API credentials. API keys are stored securely in the database.
            </p>

            {/* Text/SEO Provider */}
            <div className="space-y-4 pt-2 border-t border-gray-150 dark:border-gray-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#e94560]">Text & SEO Copywriter</h4>
              
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-455">Model Provider</label>
                <select
                  value={contentProvider}
                  onChange={(e) => handleContentProviderChange(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all cursor-pointer"
                >
                  {Object.keys(TEXT_MODELS).map((prov) => (
                    <option key={prov} value={prov}>{prov.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-455">Model Identifier</label>
                <select
                  value={contentModel}
                  onChange={(e) => setContentModel(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all cursor-pointer"
                >
                  {(TEXT_MODELS[contentProvider] || []).map((model) => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-455">
                  API Key / Access Secret
                  {!contentKeys && (
                    <span className="ml-2 text-[10px] font-bold text-amber-500 uppercase">Not Configured</span>
                  )}
                </label>
                <div className="relative mt-1.5">
                  <textarea
                    rows={2}
                    value={contentKeys}
                    onChange={(e) => setContentKeys(e.target.value)}
                    placeholder="Enter API Key(s), one per line for rotation"
                    className={`w-full rounded-xl border bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2 text-xs font-mono text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all ${
                      !contentKeys
                        ? 'border-dashed border-amber-300 dark:border-amber-700'
                        : 'border-gray-200 dark:border-gray-800'
                    }`}
                  />
                  {!contentKeys && (
                    <div className="absolute inset-0 rounded-xl border border-dashed border-amber-300 dark:border-amber-700 pointer-events-none" />
                  )}
                </div>
                {PROVIDER_KEY_LINKS[contentProvider] && (
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <span>Need keys?</span>
                    <a 
                      href={PROVIDER_KEY_LINKS[contentProvider]} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-0.5"
                    >
                      Get keys from {contentProvider.toUpperCase()} Console <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => handleTestKey('content')}
                    disabled={testingKey !== null || !contentKeys}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {testingKey === 'content' ? (
                      <><Loader2 className="w-3 h-3 animate-spin" /> Testing...</>
                    ) : (
                      <><ShieldCheck className="w-3 h-3" /> Validate Key</>
                    )}
                  </button>
                  {keyTestResult && keyTestResult.section === 'content' && (
                    <span className={`text-xs font-semibold ${keyTestResult.valid ? 'text-green-600' : 'text-red-500'}`}>
                      {keyTestResult.message}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Vision/Image Analyzer Provider */}
            <div className="space-y-4 pt-4 border-t border-gray-150 dark:border-gray-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#e94560]">Media & Vision Analyzer</h4>
              
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-455">Vision Provider</label>
                <select
                  value={visionProvider}
                  onChange={(e) => handleVisionProviderChange(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all cursor-pointer"
                >
                  {Object.keys(VISION_MODELS).map((prov) => (
                    <option key={prov} value={prov}>{prov.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-455">Vision Model Identifier</label>
                <select
                  value={visionModel}
                  onChange={(e) => setVisionModel(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all cursor-pointer"
                >
                  {(VISION_MODELS[visionProvider] || []).map((model) => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-455">
                  API Key / Access Secret
                  {!visionKeys && (
                    <span className="ml-2 text-[10px] font-bold text-amber-500 uppercase">Not Configured</span>
                  )}
                </label>
                <div className="relative mt-1.5">
                  <textarea
                    rows={2}
                    value={visionKeys}
                    onChange={(e) => setVisionKeys(e.target.value)}
                    placeholder="Enter Vision API key"
                    className={`w-full rounded-xl border bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2 text-xs font-mono text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all ${
                      !visionKeys
                        ? 'border-dashed border-amber-300 dark:border-amber-700'
                        : 'border-gray-200 dark:border-gray-800'
                    }`}
                  />
                  {!visionKeys && (
                    <div className="absolute inset-0 rounded-xl border border-dashed border-amber-300 dark:border-amber-700 pointer-events-none" />
                  )}
                </div>
                {PROVIDER_KEY_LINKS[visionProvider] && (
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <span>Need keys?</span>
                    <a 
                      href={PROVIDER_KEY_LINKS[visionProvider]} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-0.5"
                    >
                      Get keys from {visionProvider.toUpperCase()} Console <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => handleTestKey('vision')}
                    disabled={testingKey !== null || !visionKeys}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {testingKey === 'vision' ? (
                      <><Loader2 className="w-3 h-3 animate-spin" /> Testing...</>
                    ) : (
                      <><ShieldCheck className="w-3 h-3" /> Validate Key</>
                    )}
                  </button>
                  {keyTestResult && keyTestResult.section === 'vision' && (
                    <span className={`text-xs font-semibold ${keyTestResult.valid ? 'text-green-600' : 'text-red-500'}`}>
                      {keyTestResult.message}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Persona & Toggles */}
          <div className="space-y-8">

            {/* === BUSINESS PRESET SELECTOR === */}
            <div className="bg-gradient-to-br from-[#1a1a2e]/5 to-[#e94560]/5 dark:from-[#1a1a2e] dark:to-[#16162a] p-6 rounded-2xl border border-[#e94560]/20 dark:border-[#e94560]/30 shadow-sm space-y-4 transition-colors">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span>⚡</span> Business Type Presets
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Select your business type to auto-fill all AI prompts, word limits, target audiences, product types, and HTML templates.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {BUSINESS_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedPresetId(selectedPresetId === preset.id ? '' : preset.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      selectedPresetId === preset.id
                        ? 'bg-[#e94560] border-[#e94560] text-white shadow-md'
                        : 'bg-white dark:bg-[#16162a] border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#e94560] hover:text-[#e94560]'
                    }`}
                  >
                    <span>{preset.emoji}</span>
                    {preset.name}
                  </button>
                ))}
              </div>
              {selectedPresetId && (
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => applyPreset(selectedPresetId)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#e94560] hover:bg-[#c73652] text-white rounded-xl text-xs font-bold transition-all shadow"
                  >
                    ✅ Apply &ldquo;{BUSINESS_PRESETS.find(p => p.id === selectedPresetId)?.name}&rdquo; Preset
                  </button>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Will auto-fill audiences, product types, prompts, word limits &amp; HTML templates below.
                  </span>
                </div>
              )}
            </div>

            {/* Behavior configuration */}

            <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6 transition-colors">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Copywriting Persona & Behavior</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-455">Tone of Voice</label>
                  <select
                    value={aiPersonaConfig.tone}
                    onChange={(e) => setAiPersonaConfig({ ...aiPersonaConfig, tone: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all cursor-pointer"
                  >
                    {AI_TONES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-455">Output Language</label>
                  <select
                    value={aiPersonaConfig.language}
                    onChange={(e) => setAiPersonaConfig({ ...aiPersonaConfig, language: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all cursor-pointer"
                  >
                    {AI_LANGUAGES.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Audiences Selector */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-455">Target Audiences</label>
                  <div className="flex flex-wrap gap-4 items-center mt-1">
                    {AUDIENCE_PRESETS.map((aud) => (
                      <label key={aud} className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-gray-700 dark:text-gray-300">
                        <input
                          type="checkbox"
                          checked={audiencesList.includes(aud)}
                          onChange={() => toggleAudience(aud)}
                          className="w-3.5 h-3.5 rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] cursor-pointer"
                        />
                        {aud}
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-2 items-center mt-2">
                    <input
                      type="text"
                      value={customAudience}
                      onChange={(e) => setCustomAudience(e.target.value)}
                      placeholder="Custom audience..."
                      className="flex-1 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none h-[36px]"
                    />
                    <button
                      type="button"
                      onClick={addCustomAudience}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white rounded-xl text-xs font-bold h-[36px]"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Product Types Presets */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-455">Product Types</label>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {TYPE_PRESETS.map((t) => {
                      const isActive = typesList.includes(t);
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => toggleProductType(t)}
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all ${
                            isActive
                              ? 'bg-blue-50 border-blue-400 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400'
                              : 'bg-white border-gray-200 text-gray-600 dark:bg-transparent dark:border-gray-700 dark:text-gray-400'
                          }`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-2 items-center mt-2">
                    <input
                      type="text"
                      value={customType}
                      onChange={(e) => setCustomType(e.target.value)}
                      placeholder="Custom product type..."
                      className="flex-1 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none h-[36px]"
                    />
                    <button
                      type="button"
                      onClick={addCustomProductType}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white rounded-xl text-xs font-bold h-[36px]"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-455">Custom System Instructions</label>
                  <textarea
                    rows={3}
                    value={aiPersonaConfig.customInstructions}
                    onChange={(e) => setAiPersonaConfig({ ...aiPersonaConfig, customInstructions: e.target.value })}
                    placeholder="e.g. Always write descriptions targeting young Pakistani fashion enthusiasts..."
                    className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Automation toggles */}
            <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 transition-colors">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#e94560]">Automation Switches</h4>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoContentSeo}
                    onChange={(e) => setAutoContentSeo(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Enable auto-generation of SEO titles/meta descriptions on save
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoMediaAi}
                    onChange={(e) => setAutoMediaAi(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Enable auto-tagging & description analysis for uploaded product media
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Full-width Row: Custom prompt instructions & word limits */}
          <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 transition-colors col-span-1 md:col-span-2">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">AI Writing Prompts & Word Limits</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Configure target word limits and custom copywriting guidelines/prompts for category descriptions, product descriptions, and product short descriptions.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Category Description */}
              <div className="space-y-3 p-4 rounded-xl bg-gray-50/50 dark:bg-[#0f0f1b]/50 border border-gray-100 dark:border-gray-800/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-500">Category Description</h4>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500">Prompt Instructions</label>
                  <textarea
                    rows={4}
                    value={categoryDescriptionPrompt}
                    onChange={(e) => setCategoryDescriptionPrompt(e.target.value)}
                    placeholder="e.g. Focus on fabric care instructions, sizing recommendations for kids age 1-14 years, and summer/festive styling tips."
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-850 bg-white dark:bg-[#16162a] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500">Word Limit</label>
                  <input
                    type="number"
                    value={categoryDescriptionLimit || ''}
                    onChange={(e) => setCategoryDescriptionLimit(e.target.value ? Number(e.target.value) : 0)}
                    placeholder="150"
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-850 bg-white dark:bg-[#16162a] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Product Description */}
              <div className="space-y-3 p-4 rounded-xl bg-gray-50/50 dark:bg-[#0f0f1b]/50 border border-gray-100 dark:border-gray-800/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#e94560]">Product Description</h4>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500">Prompt Instructions</label>
                  <textarea
                    rows={4}
                    value={productDescriptionPrompt}
                    onChange={(e) => setProductDescriptionPrompt(e.target.value)}
                    placeholder="e.g. Include detailed features, premium fabric quality, color choices, and wash instructions in list format."
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-850 bg-white dark:bg-[#16162a] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500">Word Limit</label>
                  <input
                    type="number"
                    value={productDescriptionLimit || ''}
                    onChange={(e) => setProductDescriptionLimit(e.target.value ? Number(e.target.value) : 0)}
                    placeholder="250"
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-850 bg-white dark:bg-[#16162a] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560] transition-all"
                  />
                </div>
              </div>

              {/* Product Short Description */}
              <div className="space-y-3 p-4 rounded-xl bg-gray-50/50 dark:bg-[#0f0f1b]/50 border border-gray-100 dark:border-gray-800/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-500">Product Short Description</h4>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500">Prompt Instructions</label>
                  <textarea
                    rows={4}
                    value={productShortPrompt}
                    onChange={(e) => setProductShortPrompt(e.target.value)}
                    placeholder="e.g. Write a catchy single paragraph highlight of the outfit to grab immediate attention with a call-to-action."
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-855 bg-white dark:bg-[#16162a] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500">Word Limit</label>
                  <input
                    type="number"
                    value={productShortLimit || ''}
                    onChange={(e) => setProductShortLimit(e.target.value ? Number(e.target.value) : 0)}
                    placeholder="100"
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-855 bg-white dark:bg-[#16162a] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Collection Description */}
              <div className="space-y-3 p-4 rounded-xl bg-gray-50/50 dark:bg-[#0f0f1b]/50 border border-gray-100 dark:border-gray-800/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-500">Collection Description</h4>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500">Prompt Instructions</label>
                  <textarea
                    rows={4}
                    value={collectionDescriptionPrompt}
                    onChange={(e) => setCollectionDescriptionPrompt(e.target.value)}
                    placeholder="e.g. Focus on premium quality, curated styles, and perfect fits."
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-850 bg-white dark:bg-[#16162a] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500">Word Limit</label>
                  <input
                    type="number"
                    value={collectionDescriptionLimit || ''}
                    onChange={(e) => setCollectionDescriptionLimit(e.target.value ? Number(e.target.value) : 0)}
                    placeholder="100"
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-850 bg-white dark:bg-[#16162a] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Full-width Row: Rich default templates */}
          <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 transition-colors col-span-1 md:col-span-2">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Default HTML copy guidelines</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Provide default structured guidelines/HTML code skeleton wrappers that the AI Copywriter should follow when generating long description fields.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-455">Category Default Template (HTML)</label>
                <textarea
                  rows={4}
                  value={categoryDefaultTemplate}
                  onChange={(e) => setCategoryDefaultTemplate(e.target.value)}
                  placeholder="e.g., <p>Discover premium {{category_name}} crafted for daily wear...</p>"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-xs font-mono text-gray-900 dark:text-white focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-455">Product Default Template (HTML)</label>
                <textarea
                  rows={4}
                  value={productDefaultTemplate}
                  onChange={(e) => setProductDefaultTemplate(e.target.value)}
                  placeholder="e.g., <p>Get {{product_name}} with soft cotton fabric...</p>"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-xs font-mono text-gray-900 dark:text-white focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#16162a] p-12 text-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-455 transition-colors col-span-1 md:col-span-2">
          <Zap className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">AI System Disabled</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            AI copywriting and image analysis capabilities are currently disabled globally. Turn on the switch above to configure API keys, models, behavior parameters, and default templates.
          </p>
        </div>
      )}
    </div>
  );
}
