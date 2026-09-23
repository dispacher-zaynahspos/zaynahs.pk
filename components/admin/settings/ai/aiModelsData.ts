'use client';

export const PROVIDERS = [
  { group: '🆓 FREE', options: ['groq', 'gemini', 'cerebras', 'mistral', 'cloudflare', 'nvidia', 'openrouter'] },
  { group: '💲 CHEAP', options: ['deepseek', 'together', 'fireworks', 'siliconflow', 'kimi', 'qwen'] },
  { group: '💎 PREMIUM', options: ['openai', 'anthropic', 'minimax'] }
];

export const TEXT_MODELS: Record<string, string[]> = {
  groq: [
    'meta-llama/llama-4-scout-17b-16e-instruct',
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'meta-llama/llama-4-maverick-17b-128e-instruct',
    'deepseek-r1-distill-llama-70b',
    'qwen-qwq-32b',
    'gemma2-9b-it',
    'mistral-saba-24b',
    'llama-3.1-70b-versatile',
    'mixtral-8x7b-32768',
    'llama3-70b-8192',
    'llama3-8b-8192',
  ],
  gemini: [
    'gemini-3.6-flash',
    'gemini-flash-latest',
    'gemma-3-27b-it',
    'gemma-3-12b-it',
    'gemma-3-4b-it',
    'gemma-3-1b-it'
  ],
  cerebras: [
    'llama-3.3-70b',
    'llama-3.1-8b',
    'llama-3.1-70b',
    'deepseek-r1-distill-llama-70b',
    'llama3-70b-8k',
    'llama3-8b-8k'
  ],
  mistral: [
    'open-mistral-nemo',
    'mistral-small-2506',
    'ministral-8b-2512',
    'ministral-3b-2512',
    'mistral-large-2512',
    'codestral-2501',
    'devstral-2512',
    'magistral-medium-2509',
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
    'deepseek/deepseek-v3:free',
    'qwen/qwen3-235b-a22b:free',
    'qwen/qwen3-30b-a3b:free',
    'qwen/qwen3-8b:free',
    'google/gemma-3-27b-it:free',
    'google/gemma-3-12b-it:free',
    'google/gemma-3-4b-it:free',
    'microsoft/phi-4-reasoning-plus:free',
    'microsoft/phi-4-reasoning:free',
    'microsoft/phi-4-mini-reasoning:free',
    'mistralai/mistral-small-3.1-24b-instruct:free',
    'mistralai/mistral-nemo:free',
    'meta-llama/llama-3.1-8b-instruct:free',
    'meta-llama/llama-3.2-3b-instruct:free',
    'nousresearch/hermes-3-llama-3.1-405b:free',
    'thudm/glm-4-32b:free',
    'openchat/openchat-7b:free',
  ],
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

export const VISION_MODELS: Record<string, string[]> = {
  groq: [
    'meta-llama/llama-4-scout-17b-16e-instruct',
    'meta-llama/llama-4-maverick-17b-128e-instruct',
    'llama-3.2-11b-vision-preview',
    'llama-3.2-90b-vision-preview',
  ],
  gemini: [
    'gemini-3.6-flash',
    'gemini-flash-latest',
  ],
  cerebras: [
    'llama-3.2-11b-vision-instruct'
  ],
  mistral: [
    'pixtral-12b-2409',
    'pixtral-large-2411',
    'mistral-small-2506',
    'ministral-8b-2512',
    'ministral-3b-2512',
    'mistral-large-2512',
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
    'meta-llama/llama-3.2-11b-vision-instruct:free',
    'qwen/qwen2.5-vl-72b-instruct:free',
    'qwen/qwen2.5-vl-7b-instruct:free',
    'mistralai/pixtral-12b:free',
    'meta-llama/llama-4-scout:free',
    'meta-llama/llama-4-maverick:free',
    'google/gemma-3-27b-it:free',
    'microsoft/phi-4-multimodal-instruct:free'
  ],
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

export function getModelLabel(provider: string, model: string): string {
  if (model.includes('llama-4-scout')) return `${model} ⭐ (Recommended • 14,400 req/day FREE)`;
  if (model === 'gemini-3.6-flash') return `${model} ⭐ (Recommended • 1,500 req/day FREE)`;
  if (model === 'gemini-flash-latest') return `${model} (Auto-Updating Google Gemini)`;
  if (model === 'llama-3.3-70b-versatile') return `${model} (Fast & Smart • 6,000 req/day FREE)`;
  if (model === 'llama-3.1-8b-instant') return `${model} (Ultra-Fast • 14,400 req/day FREE)`;
  if (model.endsWith(':free')) return `${model} (100% Free)`;
  return model;
}

export const AI_TONES = [
  { id: 'Professional', name: 'Professional & Informative' },
  { id: 'Casual', name: 'Casual & Friendly' },
  { id: 'Bold', name: 'Bold & Persuasive' },
  { id: 'Elegant', name: 'Elegant & Luxury-focused' },
  { id: 'Urgent', name: 'Urgent & Sale-driven' },
];

export const AI_LANGUAGES = [
  { id: 'English', name: 'English' },
  { id: 'Urdu', name: 'Urdu (اردو)' },
  { id: 'Roman Urdu', name: 'Roman Urdu (Urdu written in English alphabets)' },
];

export const PROVIDER_KEY_LINKS: Record<string, string> = {
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

export const AUDIENCE_PRESETS = ['Men', 'Women', 'Kids'];
export const TYPE_PRESETS = ['Clothes', 'Shoes', 'Accessories', 'Jewellery', 'Bags'];

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

export const BUSINESS_PRESETS: BusinessPreset[] = [
  {
    id: 'clothing',
    name: 'Clothing & Fashion',
    emoji: '👗',
    audiences: ['Women', 'Men', 'Kids'],
    productTypes: ['Clothes', 'Dresses', 'Tops', 'Trousers', 'Suits', 'T-shirts', 'Co-ord Sets'],
    tone: 'Professional',
    categoryPrompt: 'Write an engaging category overview. Highlight fabric quality, style variety, and occasion suitability. Mention Pakistani fashion trends.',
    categoryLimit: 250,
    productPrompt: 'Write a persuasive product description. Highlight fabric, stitching, fit, style tips, and care instructions.',
    productLimit: 300,
    shortPrompt: 'Highlight main fabric, fit, and key feature in 2 punchy bullet points.',
    shortLimit: 80,
    categoryTemplate: '### About {category_name}\n\nExplore our latest collection of {category_name}. High quality fabrics and trendy designs.\n\n- Premium quality fabric\n- Available in multiple sizes\n- Fast shipping across Pakistan',
    productTemplate: '### Description\n\n{product_name} crafted with care. Perfect for casual or formal wear.\n\n### Product Details\n- Premium Fabric\n- Comfortable Fit\n- Hand / Machine Washable'
  },
  {
    id: 'shoes',
    name: 'Shoes & Footwear',
    emoji: '👟',
    audiences: ['Men', 'Women'],
    productTypes: ['Shoes', 'Sneakers', 'Sandals', 'Heels', 'Boots', 'Loafers'],
    tone: 'Bold',
    categoryPrompt: 'Focus on comfort, durability, sole quality, and trendy styles for all occasions.',
    categoryLimit: 250,
    productPrompt: 'Focus on material quality, sole cushioning, sizing accuracy, and styling tips.',
    productLimit: 300,
    shortPrompt: 'Highlight sole comfort, material, and occasion suitability.',
    shortLimit: 80,
    categoryTemplate: '### {category_name} Collection\n\nStep out in style with our premium {category_name}. Engineered for maximum comfort.\n\n- Cushioned insole\n- Anti-slip rubber sole\n- Trendy designs',
    productTemplate: '### Product Highlights\n\nUpgrade your footwear game with {product_name}.\n\n- Material: Premium Synthetic / Genuine Leather\n- Sole: Ergonomic & Durable\n- Fit: True to size'
  },
  {
    id: 'jewellery',
    name: 'Jewellery & Accessories',
    emoji: '💍',
    audiences: ['Women', 'Girls'],
    productTypes: ['Jewellery', 'Rings', 'Necklaces', 'Earrings', 'Bracelets'],
    tone: 'Elegant',
    categoryPrompt: 'Focus on craftsmanship, plating quality, anti-tarnish guarantee, and gift-worthiness.',
    categoryLimit: 250,
    productPrompt: 'Describe plating, stone detail, weight, and care to avoid tarnishing.',
    productLimit: 300,
    shortPrompt: 'Mention plating material, anti-tarnish feature, and gift appeal.',
    shortLimit: 80,
    categoryTemplate: '### {category_name} Collection\n\nDiscover exquisite {category_name} crafted to perfection.\n\n- Anti-tarnish gold/silver plating\n- Hypoallergenic material\n- Premium gift packaging',
    productTemplate: '### Description\n\n{product_name} adds elegance to any outfit.\n\n- High-grade cubic zirconia / pearl\n- Long-lasting polish\n- Store in dry pouch'
  }
];
