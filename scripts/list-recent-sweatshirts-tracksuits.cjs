#!/usr/bin/env node
/**
 * Dynamic Listing Script for 36 Sweatshirts and Tracksuits from Recent Uploads
 * Reuses scripts/store-list-product.cjs directly (RULE LISTING-REUSE)
 *
 * Rules:
 * - Pure white images (dividers) are skipped
 * - Tracksuits = Rs. 1,799 (compare: Rs. 2,450)
 * - Shirts / Sweatshirts = Rs. 950 (compare: Rs. 1,450)
 * - Sizes: 4-5y, 5-6y, 7-8y, 9-10y, 11-12y (100 stock each)
 * - Separate products per design/color (no merged color swatches)
 * - Gender isolation (Girls categories vs Boys categories)
 * - Size chart attached to gallery and size_guide_id
 */

const fs = require('fs');
const path = require('path');
const { resolveConfig, listProducts } = require('./store-list-product.cjs');

const urlMap = JSON.parse(fs.readFileSync('/tmp/url_map.json', 'utf8'));

const SIZE_CHART_IMAGE = 'https://img.totvogue.pk/product-images/photo-2026-11-01-09-46-43-1793508433015.webp';
const SIZE_GUIDE_ID = '148d729f-ce6b-4169-b13e-476e3602d940';
const SIZES = ['4-5y', '5-6y', '7-8y', '9-10y', '11-12y'];

const CATS = {
  shop: '00000000-0000-4000-8000-000000000099',
  winter: '1adc152a-63e3-45ba-b70c-09bf66e4d7a0',
  tracksuits: '637e5a74-1fbc-4401-97f5-175d3dda8875',
  sweatshirts: 'd14e4746-8546-47cd-b05a-c9070ce8b2ba',
  girls: 'b15adda3-3e09-4647-bacc-433b22ded3e7',
  girlsCoord: '9f5d810c-dada-4e91-9b57-c4aab8197d7d',
  girlsWinter: 'cc52eb0e-1bc3-461a-92ce-2bdce8b28893',
  boys: '57b8c355-0e38-4748-9c42-0c7c760dc759',
  boysCoord: 'adbd5753-20da-457e-a761-8b462cbcc7eb',
  boysWinter: '9cd5c9dd-b194-4d19-8147-9b6a303d3fb4'
};

const GIRLS_TRACKSUIT_CATS = [
  CATS.shop,
  CATS.girls,
  CATS.girlsCoord,
  CATS.tracksuits,
  CATS.girlsWinter,
  CATS.winter
];

const BOYS_TRACKSUIT_CATS = [
  CATS.shop,
  CATS.boys,
  CATS.boysCoord,
  CATS.tracksuits,
  CATS.boysWinter,
  CATS.winter
];

const GIRLS_SWEATSHIRT_CATS = [
  CATS.shop,
  CATS.girls,
  CATS.sweatshirts,
  CATS.girlsWinter,
  CATS.winter
];

const BOYS_SWEATSHIRT_CATS = [
  CATS.shop,
  CATS.boys,
  CATS.sweatshirts,
  CATS.boysWinter,
  CATS.winter
];

const UNISEX_SWEATSHIRT_CATS = [
  CATS.shop,
  CATS.boys,
  CATS.girls,
  CATS.sweatshirts,
  CATS.boysWinter,
  CATS.girlsWinter,
  CATS.winter
];

// Helper to construct item payload
function createItem(num, title, description, price, comparePrice, catIds, categoryId) {
  const imageUrl = urlMap[num];
  if (!imageUrl) {
    throw new Error(`Missing image for number ${num}`);
  }
  return {
    title,
    description,
    short_description: description.slice(0, 150) + '...',
    price,
    compare_price: comparePrice,
    image_url: imageUrl,
    gallery_images: [SIZE_CHART_IMAGE],
    size_guide_id: SIZE_GUIDE_ID,
    category_id: categoryId,
    category_ids: catIds,
    sizes: SIZES
  };
}

// BATCH 1: Girls Tracksuits (19 items, Rs. 1,799)
const batchGirlsTracksuits = [
  createItem(2, 'Girls Minnie Mouse Dancing Graphic White Sweatshirt & Orange Flared Trousers Tracksuit Set (4-12y)',
    'Premium fleece tracksuit set featuring a charming dancing Minnie Mouse graphic on an off-white crewneck sweatshirt paired with vibrant orange flared front-seam fleece trousers. Cozy, stylish, and ultra-comfortable for girls aged 4 to 12 years.',
    1799, 2450, GIRLS_TRACKSUIT_CATS, CATS.girlsCoord),
  createItem(3, 'Girls Minnie Mouse Dancing Graphic White Sweatshirt & Lime Green Flared Trousers Tracksuit Set (4-12y)',
    'Cute and playful two-piece fleece tracksuit featuring a dancing Minnie Mouse graphic sweatshirt paired with eye-catching neon lime green flared fleece trousers.',
    1799, 2450, GIRLS_TRACKSUIT_CATS, CATS.girlsCoord),
  createItem(4, 'Girls Minnie Mouse Dancing Graphic White Sweatshirt & Bold Red Flared Trousers Tracksuit Set (4-12y)',
    'Classic girls two-piece winter loungewear set featuring an off-white Minnie Mouse ballerina graphic sweatshirt paired with bold red front-seam flared fleece trousers.',
    1799, 2450, GIRLS_TRACKSUIT_CATS, CATS.girlsCoord),
  createItem(5, 'Girls Minnie Mouse Dancing Graphic White Sweatshirt & Baby Pink Flared Trousers Tracksuit Set (4-12y)',
    'Sweet and adorable winter loungewear set featuring a dancing Minnie Mouse graphic sweatshirt paired with soft baby pink front-seam flared fleece trousers.',
    1799, 2450, GIRLS_TRACKSUIT_CATS, CATS.girlsCoord),
  createItem(7, 'Girls Red Spider Graphic Off-White Sweatshirt & Black Flared Front-Seam Trousers Tracksuit Set (4-12y)',
    'Trendy streetwear-inspired fleece set featuring an iconic red spider graphic on an off-white crewneck sweatshirt paired with sleek black front-seam flared fleece trousers.',
    1799, 2450, GIRLS_TRACKSUIT_CATS, CATS.girlsCoord),
  createItem(8, 'Girls Hot Pink Spider Graphic Off-White Sweatshirt & Baby Pink Flared Trousers Tracksuit Set (4-12y)',
    'Chic and modern girls tracksuit set featuring an edgy hot pink spider graphic on an off-white crewneck sweatshirt paired with baby pink flared fleece trousers.',
    1799, 2450, GIRLS_TRACKSUIT_CATS, CATS.girlsCoord),
  createItem(9, 'Girls Hot Pink Spider Graphic Off-White Sweatshirt & Black Flared Front-Seam Trousers Tracksuit Set (4-12y)',
    'Stylish girls two-piece winter set featuring a bold hot pink spider motif on an off-white fleece sweatshirt paired with sleek black front-seam flared trousers.',
    1799, 2450, GIRLS_TRACKSUIT_CATS, CATS.girlsCoord),
  createItem(10, 'Girls Red Spider Graphic Off-White Sweatshirt & Red Flared Front-Seam Trousers Tracksuit Set (4-12y)',
    'Vibrant winter lounge tracksuit featuring a striking red spider graphic on an off-white sweatshirt paired with matching red front-seam flared fleece trousers.',
    1799, 2450, GIRLS_TRACKSUIT_CATS, CATS.girlsCoord),
  createItem(12, 'Girls White Spiderweb Graphic Hot Pink Sweatshirt & Warm Ivory Wide-Leg Trousers Tracksuit Set (4-12y)',
    'Eye-catching girls two-piece set featuring a detailed white spiderweb graphic on a vibrant hot pink sweatshirt paired with elegant warm ivory wide-leg fleece trousers.',
    1799, 2450, GIRLS_TRACKSUIT_CATS, CATS.girlsCoord),
  createItem(13, 'Girls White Spiderweb Graphic Hot Pink Sweatshirt & Black Wide-Leg Trousers Tracksuit Set (4-12y)',
    'Bold contrast two-piece fleece loungewear set featuring a white spiderweb graphic on a hot pink sweatshirt paired with comfortable black wide-leg fleece trousers.',
    1799, 2450, GIRLS_TRACKSUIT_CATS, CATS.girlsCoord),
  createItem(14, 'Girls White Spiderweb Graphic Hot Pink Sweatshirt & Off-White Wide-Leg Trousers Tracksuit Set (4-12y)',
    'Stylish girls winter tracksuit set featuring a signature white spiderweb print on a bright hot pink fleece top paired with off-white wide-leg fleece trousers.',
    1799, 2450, GIRLS_TRACKSUIT_CATS, CATS.girlsCoord),
  createItem(16, 'Girls Minnie Mouse Dancing Graphic Red Sweatshirt & Off-White Wide-Leg Trousers Tracksuit Set (4-12y)',
    'Festive and cheerful girls winter set featuring a dancing Minnie Mouse graphic on a vibrant red sweatshirt paired with off-white wide-leg fleece trousers.',
    1799, 2450, GIRLS_TRACKSUIT_CATS, CATS.girlsCoord),
  createItem(17, 'Girls Minnie Mouse Dancing Graphic Red Sweatshirt & Black Wide-Leg Trousers Tracksuit Set (4-12y)',
    'Adorable winter loungewear set featuring a playful Minnie Mouse dancing graphic on a bright red fleece sweatshirt paired with black wide-leg fleece trousers.',
    1799, 2450, GIRLS_TRACKSUIT_CATS, CATS.girlsCoord),
  createItem(19, 'Girls Minnie Mouse Dancing Graphic Hot Pink Sweatshirt & Baby Pink Flared Trousers Tracksuit Set (4-12y)',
    'Gorgeous dual-tone pink winter set featuring a dancing Minnie Mouse graphic on a vibrant hot pink sweatshirt paired with soft baby pink flared fleece trousers.',
    1799, 2450, GIRLS_TRACKSUIT_CATS, CATS.girlsCoord),
  createItem(20, 'Girls Minnie Mouse Dancing Graphic Hot Pink Sweatshirt & Black Flared Trousers Tracksuit Set (4-12y)',
    'High-contrast winter loungewear set featuring a dancing Minnie Mouse graphic on a vivid hot pink sweatshirt paired with black front-seam flared fleece trousers.',
    1799, 2450, GIRLS_TRACKSUIT_CATS, CATS.girlsCoord),
  createItem(21, 'Girls Minnie Mouse Dancing Graphic Hot Pink Sweatshirt & Cream Flared Trousers Tracksuit Set (4-12y)',
    'Ultra-stylish girls fleece tracksuit featuring a dancing Minnie Mouse print on a hot pink crewneck paired with cream front-seam flared trousers.',
    1799, 2450, GIRLS_TRACKSUIT_CATS, CATS.girlsCoord),
  createItem(23, 'Girls Peeking Mickey Mouse Graphic Hot Pink Sweatshirt & Black Wide-Leg Trousers Tracksuit Set (4-12y)',
    'Fun and playful winter set featuring a curious peeking Mickey Mouse graphic on a vibrant hot pink sweatshirt paired with black wide-leg fleece trousers.',
    1799, 2450, GIRLS_TRACKSUIT_CATS, CATS.girlsCoord),
  createItem(24, 'Girls Peeking Mickey Mouse Graphic Hot Pink Sweatshirt & Cream Wide-Leg Trousers Tracksuit Set (4-12y)',
    'Cute cartoon character loungewear set featuring a peeking Mickey Mouse graphic on a hot pink sweatshirt paired with relaxed cream wide-leg fleece trousers.',
    1799, 2450, GIRLS_TRACKSUIT_CATS, CATS.girlsCoord),
  createItem(26, 'Girls Red Spider Graphic Off-White Sweatshirt & Black Wide-Leg Front-Seam Trousers Tracksuit Set (4-12y)',
    'Urban streetwear fleece set for girls featuring a red spider chest graphic on an off-white sweatshirt paired with black wide-leg front-seam fleece trousers.',
    1799, 2450, GIRLS_TRACKSUIT_CATS, CATS.girlsCoord)
];

// BATCH 2: Boys Tracksuits (6 items, Rs. 1,799)
const batchBoysTracksuits = [
  createItem(27, 'Boys Black Spiderweb Graphic Off-White Sweatshirt & Heather Grey Fleece Sweatpants Tracksuit Set (4-12y)',
    'Edgy and comfortable boys winter tracksuit featuring a bold black spiderweb graphic on an off-white fleece sweatshirt paired with premium heather grey straight-leg sweatpants.',
    1799, 2450, BOYS_TRACKSUIT_CATS, CATS.boysCoord),
  createItem(29, 'Boys White Spiderweb Graphic Red Sweatshirt & White Fleece Sweatpants Tracksuit Set (4-12y)',
    'Energetic two-piece winter tracksuit for boys featuring a white spiderweb graphic on a vibrant red sweatshirt paired with matching white straight fleece sweatpants.',
    1799, 2450, BOYS_TRACKSUIT_CATS, CATS.boysCoord),
  createItem(30, 'Boys White Spiderweb Graphic Red Sweatshirt & Heather Grey Fleece Sweatpants Tracksuit Set (4-12y)',
    'Premium boys winter tracksuit set featuring a signature white spiderweb print on a vibrant red crewneck sweatshirt paired with classic heather grey fleece sweatpants.',
    1799, 2450, BOYS_TRACKSUIT_CATS, CATS.boysCoord),
  createItem(32, 'Boys Peeking Mickey Mouse Graphic Red Sweatshirt & White Fleece Sweatpants Tracksuit Set (4-12y)',
    'Cheerful cartoon character winter tracksuit for boys featuring a playful peeking Mickey Mouse graphic on a red fleece top paired with clean white straight sweatpants.',
    1799, 2450, BOYS_TRACKSUIT_CATS, CATS.boysCoord),
  createItem(33, 'Boys Peeking Mickey Mouse Graphic Red Sweatshirt & Heather Grey Fleece Sweatpants Tracksuit Set (4-12y)',
    'Classic boys two-piece winter loungewear featuring a smiling peeking Mickey Mouse graphic on a bright red sweatshirt paired with versatile heather grey fleece sweatpants.',
    1799, 2450, BOYS_TRACKSUIT_CATS, CATS.boysCoord),
  createItem(35, 'Boys Peeking Mickey Mouse Graphic Off-White Sweatshirt & Black Fleece Sweatpants Tracksuit Set (4-12y)',
    'Timeless monochrome winter tracksuit for boys featuring a peeking Mickey Mouse graphic on an off-white fleece sweatshirt paired with solid black straight fleece sweatpants.',
    1799, 2450, BOYS_TRACKSUIT_CATS, CATS.boysCoord)
];

// BATCH 3: Girls Sweatshirts / Shirts (6 items, Rs. 950)
const batchGirlsSweatshirts = [
  createItem(38, 'Girls Minnie Mouse Dancing Graphic Off-White Crewneck Sweatshirt (4-12y)',
    'Cute and cozy girls winter crewneck sweatshirt featuring a charming dancing ballerina Minnie Mouse graphic on an off-white soft fleece fabric.',
    950, 1450, GIRLS_SWEATSHIRT_CATS, CATS.sweatshirts),
  createItem(40, 'Girls Solid Vibrant Hot Pink Crewneck Fleece Sweatshirt (4-12y)',
    'Minimalist essential winter top for girls crafted from premium warm fleece in a striking solid hot pink hue with ribbed cuffs and collar.',
    950, 1450, GIRLS_SWEATSHIRT_CATS, CATS.sweatshirts),
  createItem(44, 'Girls Minnie Mouse Dancing Graphic Red Crewneck Sweatshirt (4-12y)',
    'Festive and bright red fleece crewneck sweatshirt for girls featuring a dancing Minnie Mouse cartoon graphic. Warm, soft, and easy to style.',
    950, 1450, GIRLS_SWEATSHIRT_CATS, CATS.sweatshirts),
  createItem(48, 'Girls Peeking Mickey Mouse Graphic Hot Pink Crewneck Sweatshirt (4-12y)',
    'Adorable winter fleece crewneck sweatshirt for girls in vibrant hot pink featuring a playful peeking Mickey Mouse chest graphic.',
    950, 1450, GIRLS_SWEATSHIRT_CATS, CATS.sweatshirts),
  createItem(49, 'Girls White Spiderweb Graphic Hot Pink Crewneck Sweatshirt (4-12y)',
    'Eye-catching girls winter fleece sweatshirt in bright hot pink featuring an intricate white spiderweb chest graphic with ribbed hem and cuffs.',
    950, 1450, GIRLS_SWEATSHIRT_CATS, CATS.sweatshirts),
  createItem(50, 'Girls Minnie Mouse Dancing Graphic Hot Pink Crewneck Sweatshirt (4-12y)',
    'Lovely and vibrant girls hot pink crewneck fleece sweatshirt featuring a classic dancing Minnie Mouse illustration.',
    950, 1450, GIRLS_SWEATSHIRT_CATS, CATS.sweatshirts)
];

// BATCH 4: Boys & Unisex Sweatshirts / Shirts (5 items, Rs. 950)
const batchBoysSweatshirts = [
  createItem(37, 'Boys Peeking Mickey Mouse Graphic Off-White Crewneck Sweatshirt (4-12y)',
    'Versatile boys winter crewneck sweatshirt crafted from cozy off-white fleece featuring a playful peeking Mickey Mouse chest graphic.',
    950, 1450, BOYS_SWEATSHIRT_CATS, CATS.sweatshirts),
  createItem(41, 'Kids Minimalist Plain Off-White Crewneck Fleece Sweatshirt (4-12y)',
    'Everyday winter essential unisex crewneck sweatshirt in a clean solid off-white fleece tone. Perfect for layering and winter warmth.',
    950, 1450, UNISEX_SWEATSHIRT_CATS, CATS.sweatshirts),
  createItem(42, 'Kids Classic Solid Red Crewneck Fleece Sweatshirt (4-12y)',
    'Bold and warm unisex fleece crewneck sweatshirt in vibrant solid red. Features durable ribbed cuffs and cozy fleece lining.',
    950, 1450, UNISEX_SWEATSHIRT_CATS, CATS.sweatshirts),
  createItem(45, 'Boys Peeking Mickey Mouse Graphic Red Crewneck Sweatshirt (4-12y)',
    'Cheerful winter fleece crewneck sweatshirt for boys in bold red featuring an iconic peeking Mickey Mouse graphic.',
    950, 1450, BOYS_SWEATSHIRT_CATS, CATS.sweatshirts),
  createItem(46, 'Boys White Spiderweb Graphic Red Crewneck Sweatshirt (4-12y)',
    'Bold boys winter crewneck sweatshirt in bright red fleece featuring a statement white spiderweb graphic on the chest.',
    950, 1450, BOYS_SWEATSHIRT_CATS, CATS.sweatshirts)
];

async function run() {
  const envPath = path.resolve('env-backups/totvogue.env.local');
  const config = resolveConfig({ envFile: envPath });

  console.log('🚀 Starting batch listing for TotVogue...');
  console.log(`- Girls Tracksuits: ${batchGirlsTracksuits.length} products`);
  console.log(`- Boys Tracksuits: ${batchBoysTracksuits.length} products`);
  console.log(`- Girls Sweatshirts: ${batchGirlsSweatshirts.length} products`);
  console.log(`- Boys/Unisex Sweatshirts: ${batchBoysSweatshirts.length} products`);
  console.log(`Total to list: ${batchGirlsTracksuits.length + batchBoysTracksuits.length + batchGirlsSweatshirts.length + batchBoysSweatshirts.length} products`);

  // 1. Girls Tracksuits
  console.log('\n--- 1/4 Listing Girls Tracksuits (Sample: f5329acb-a098-4908-90e5-1438fcb87c77) ---');
  await listProducts(config, {
    sample: 'f5329acb-a098-4908-90e5-1438fcb87c77',
    items: batchGirlsTracksuits,
    linkTogether: true
  });

  // 2. Boys Tracksuits
  console.log('\n--- 2/4 Listing Boys Tracksuits (Sample: 87b6e9d8-b71b-44eb-bf60-f25e9cda7113) ---');
  await listProducts(config, {
    sample: '87b6e9d8-b71b-44eb-bf60-f25e9cda7113',
    items: batchBoysTracksuits,
    linkTogether: true
  });

  // 3. Girls Sweatshirts
  console.log('\n--- 3/4 Listing Girls Sweatshirts (Sample: 0c96ee79-548f-453a-80b1-b9d6d2670a0e) ---');
  await listProducts(config, {
    sample: '0c96ee79-548f-453a-80b1-b9d6d2670a0e',
    items: batchGirlsSweatshirts,
    linkTogether: true
  });

  // 4. Boys/Unisex Sweatshirts
  console.log('\n--- 4/4 Listing Boys/Unisex Sweatshirts (Sample: 5b502a8c-9430-40f0-a411-20eeaf5512bf) ---');
  await listProducts(config, {
    sample: '5b502a8c-9430-40f0-a411-20eeaf5512bf',
    items: batchBoysSweatshirts,
    linkTogether: true
  });

  console.log('\n🎉 ALL 36 PRODUCTS SUCCESSFULLY LISTED!');
}

run().catch(err => {
  console.error('❌ Listing failed:', err);
  process.exit(1);
});
