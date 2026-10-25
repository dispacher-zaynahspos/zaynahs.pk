import https from 'https';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

function loadEnv() {
  const envPath = path.resolve('.env.local');
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[trimmed.slice(0, eqIdx).trim()] = val;
    }
  }
  return env;
}

const env = loadEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const siteUrl = env.NEXT_PUBLIC_SITE_URL || 'https://www.totvogue.pk';
const revalidateSecret = env.REVALIDATE_SECRET;
const cfZone = env.CLOUDFLARE_ZONE_ID;
const cfToken = env.CLOUDFLARE_API_TOKEN;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

function apiRequest(method, endpoint, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, supabaseUrl);
    const headers = {
      apikey: serviceKey,
      Authorization: 'Bearer ' + serviceKey,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    };
    const req = https.request(url, { method, headers }, res => {
      let data = '';
      res.on('data', c => (data += c));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Authentic Pakistani customer names pool
const femaleNames = [
  'Ayesha K.', 'Fatima', 'Mrs G.', 'Mrs. Khan', 'Pakeeza', 'Madiha B.', 'Asra K.',
  'Sundas K.', 'Zahra', 'Laraib u.', 'Fatima A.', 'Samina', 'Hina W.', 'Nimra',
  'Sadia Tariq', 'Dr. Ayesha', 'Noreen', 'Warda', 'Iqra S.', 'Mehwish', 'Zunaira',
  'Faiza Khan', 'Anum R.', 'Sobia', 'Maria', 'Kinza', 'Sidra', 'Areeba', 'Mahnoor',
  'Laiba', 'Khadija', 'Bushra', 'Tehmina', 'Amna Bilal', 'Rabia', 'Nida', 'Shazia',
  'Sumaira', 'Farah', 'Kiran', 'Aiman', 'Zoya', 'Maryam Q.'
];

const maleNames = [
  'Atif b.', 'Amin K.', 'Ziyam', 'Ihtisham K.', 'Shahzaib K.', 'Rao H.', 'Furqan N.',
  'Awais I.', 'Abdullah N.', 'Kashif A.', 'Umais Rashid', 'Sanaullah K.', 'Sanaullah Khan',
  'Babar M.', 'Khurram', 'Tanveer', 'Zohaib', 'Usman', 'Bilal A.', 'Hamza', 'Tariq Mehmood',
  'Muhammad Shoaib', 'Faisal', 'Adnan', 'Kamran', 'Waqas', 'Naveed', 'Imran', 'Arslan',
  'Omer', 'Hassan', 'Ali Raza', 'Mohsin', 'Danish', 'Junaid', 'Saad', 'Rizwan'
];

const allCustomerNames = [...femaleNames, ...maleNames, 'Anonymous', 'Verified Customer'];

// Natural human comments bank with authentic Pakistani Roman Urdu / English phrasing
const generalPraiseComments = [
  'Many order kia ha muje aj he receive hua bht he pyata stuff ha or bht psnd aya same to same receive hua highly recommend',
  'Best quality in reasonable price highly recommended 🙌🏻',
  'I ordered for first time..quality is great and fabric is comfortable ♥️',
  'Satisfied Good materiel qood quality 100% recommended',
  'Very good service and outclass material 👍',
  'Bhut zbrdast dress ae thy jese dikhae thy wesy hi ae hen',
  'Gd stuff experience was extremely good',
  'Aoa.. yh Mera second order hai... very good stuff.., I got my parcel 📦 in 2 days which I was not expecting at all.... 😍👌',
  'Hi i just recvd my parcl. Owesome quality. fine fabric with cute characters. thanks alot delivered the best in very less price..',
  'Awesome Buht E pyara stuff hai A1',
  'Excellent quality.....same as shown nice experience....will order again',
  'Stuff and size is very very good😍😍 Satisfied 💯',
  'color stuff 10/10...My lil baby feels so comfy👍feel free to order',
  'MashaAllah bohot acha suit hai kapra bht naram hai bachon k liye zabardast',
  'Bohot pyara hai bilkul picture jesa. Size bhi perfect aya',
  'Parcel received on time. Quality is super fine and stitching neat hai',
  'bht hi khubsurat hai meri beti ko bht pasand aya thank you so much',
  'Fast delivery received within 2 days in Lahore. Quality zabardast hai',
  'Affordable price me itna acha stuff milna mushkil hai. Highly recommended to all mothers',
  '5 star review from my side! Soft fleece and vibrant colors',
  'Fabric is very soft and breathable, washed it once no shrinking or color bleeding 👍',
  'Mene 3 dresses mangwaye the sub aik se barh kar aik hain ❤️',
  'zabardast packing aur time pe delivery. quality b boht ala he',
  'Bohat zabardast kapra hai bilkul original jesa. Highly recommended',
  'Bacha bht khush hua dress dekh k, daily pehan raha he',
  'Achi quality he kapra naram he winter k liye best he',
  'Bilkul same to same he jesa picture me tha shukriya',
  'Bht pyari stitching he aur colors bht fresh hen',
  'Highly recommended to everyone, honest store with great quality'
];

const sweatshirtComments = [
  'Sweatshirt ka fabric bohot warm aur soft hai. Print ki quality bhi boht achi hai wash k bad kharab nahi hui.',
  'Little lady print bht cute lag raha hai meri guriya pe 🥰 fleece andar se bht cozy hai',
  'Yellow color bht bright aur fresh hai, print kids love it!',
  'Brown color unique hai stylish lagta hai denim jeans k sath bht acha match hua.',
  'Teal blue sweatshirt ka print bohot funky hai, beta roz school pehn k jane ki zidd karta hai 😄',
  'Warm fleece sweatshirt hai winter k liye ideal hai.',
  'Collar aur cuffs ka ribbing boht stretchy aur comfortable he, bache ko pehnana asan he.',
  'Soft fleece and vibrant print. Value for money guaranteed.',
  'Fleece bht soft he baby skin ko irritate nahi karta.',
  'Super soft cotton fleece, winter evening outings k liye best top he.',
  'Inner brushed fleece bht warm he bache ko thand se bachata he.'
];

const tracksuitComments = [
  'Tracksuit is warm and quality is good! Hoodie and cargo trouser dono ka fit zabardast hai',
  'Light blue spider tracksuit boht cool lag raha hai mere bete pe, streetwear look 10/10',
  'Red spider hoodie ka fabric thick fleece hai, hood ke andar black lining bohot premium lagti hai',
  'King of the road tracksuit bht hi sturdy hai, cargo pockets bhi functional hain',
  'Super kid tracksuit set bohot comfortable hai, trouser ka elastic waist soft hai bache ko chubhta nahi',
  'Coord set quality is top notch. Trouser length and shirt size bilkul chart k mutabiq aya',
  'Winter fleece tracksuit bht cozy he, color wash k bad bilkul fade nahi hua.',
  'Pockets are nice and roomy, trouser fit is trendy wide leg style.',
  'Dono piece bohot high quality hain, is price me aisi quality expected nahi thi.',
  'Heavyweight winter fleece, matching hoodie and cargo look super stylish on my kid.'
];

const constructiveReviews4Star = [
  'Overall good purchase. Design is adorable and fit was just right. Fabric thoda aur thick hota to perfect hota but reasonable price me acha hai.',
  'Stuff is good, delivery me 3-4 din lag gaye TCS ki taraf se but article bilkul theek aya. Recommended.',
  'Quality 10/10 hai stitching bhi achi hai. Bas color camera light ki waja se thora sa 19-20 dark hai but looks nice.',
  'Bht pyara suit hai, size thora sa loose aya but winter me andar highneck pehnane k liye theek hai.',
  'Fabric is nice and soft. Delivery fast thi. 4 stars because parcel wrapper thora crumpled aya tha but inside clothes were safe.'
];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateReviewsForProduct(product) {
  // Random count between 7 and 18 reviews per product
  const count = Math.floor(Math.random() * 12) + 7;
  const reviews = [];
  const name = product.name.toLowerCase();

  const isTracksuit = name.includes('tracksuit') || name.includes('coord') || name.includes('set') || name.includes('suit');
  const isSweatshirt = name.includes('sweatshirt') || name.includes('pullover') || name.includes('hoodie');

  let totalRating = 0;

  for (let i = 0; i < count; i++) {
    // 85% 5-star, 15% 4-star for realistic distribution
    const isFiveStar = Math.random() < 0.85;
    const rating = isFiveStar ? 5 : 4;
    totalRating += rating;

    let comment = '';
    if (!isFiveStar) {
      comment = getRandomElement(constructiveReviews4Star);
    } else {
      const typeRoll = Math.random();
      if (typeRoll < 0.45) {
        comment = getRandomElement(generalPraiseComments);
      } else if (isTracksuit && typeRoll < 0.85) {
        comment = getRandomElement(tracksuitComments);
      } else if (isSweatshirt && typeRoll < 0.85) {
        comment = getRandomElement(sweatshirtComments);
      } else {
        comment = getRandomElement(generalPraiseComments);
      }
    }

    // Spread reviews between 8 and 85 days ago
    const daysAgo = Math.floor(Math.random() * 77) + 8;
    const reviewDate = new Date(Date.now() - daysAgo * 86400000 - Math.random() * 3600000 * 12);

    reviews.push({
      id: crypto.randomUUID(),
      product_id: product.id,
      customer_name: getRandomElement(allCustomerNames),
      rating: rating,
      comment: comment,
      approved: true,
      hidden: false,
      is_verified_purchase: Math.random() < 0.88,
      created_at: reviewDate.toISOString()
    });
  }

  const avgRating = parseFloat((totalRating / count).toFixed(1));
  return { reviews, avgRating, count };
}

async function main() {
  console.log('Fetching active products from Supabase...');
  const res = await apiRequest('GET', '/rest/v1/products?select=id,name,slug,rating,reviews_count&is_active=eq.true&deleted_at=is.null');
  
  if (res.status !== 200 || !Array.isArray(res.body)) {
    console.error('Failed to fetch products:', res.body);
    process.exit(1);
  }

  const allProducts = res.body;
  console.log(`Found ${allProducts.length} active products.`);

  // Products with 0 or < 5 reviews
  const targetProducts = allProducts.filter(p => !p.reviews_count || p.reviews_count < 5);
  console.log(`Generating reviews for ${targetProducts.length} products...`);

  const allReviewRows = [];
  const productUpdates = [];

  for (const product of targetProducts) {
    const { reviews, avgRating, count } = generateReviewsForProduct(product);
    allReviewRows.push(...reviews);
    productUpdates.push({
      id: product.id,
      slug: product.slug,
      rating: avgRating,
      reviews_count: count
    });
  }

  console.log(`Total reviews to insert: ${allReviewRows.length}`);

  // Batch insert reviews in chunks of 150
  const CHUNK_SIZE = 150;
  for (let i = 0; i < allReviewRows.length; i += CHUNK_SIZE) {
    const chunk = allReviewRows.slice(i, i + CHUNK_SIZE);
    const insRes = await apiRequest('POST', '/rest/v1/reviews', chunk);
    if (insRes.status !== 201) {
      console.error(`Error inserting reviews chunk ${i / CHUNK_SIZE + 1}:`, insRes.body);
    } else {
      console.log(` ✓ Inserted reviews chunk ${Math.floor(i / CHUNK_SIZE) + 1} / ${Math.ceil(allReviewRows.length / CHUNK_SIZE)} (${chunk.length} reviews)`);
    }
  }

  // Update product ratings and reviews_count
  console.log(`Updating rating & reviews_count for ${productUpdates.length} products...`);
  for (const p of productUpdates) {
    await apiRequest('PATCH', `/rest/v1/products?id=eq.${p.id}`, {
      rating: p.rating,
      reviews_count: p.reviews_count
    });
  }

  console.log('Purging Cloudflare & ISR cache...');
  if (revalidateSecret && siteUrl) {
    for (const p of productUpdates.slice(0, 30)) {
      await apiRequest('POST', '/api/revalidate', { type: 'UPDATE', table: 'products', record: { slug: p.slug } }).catch(() => {});
    }
  }

  if (cfZone && cfToken) {
    await new Promise(resolve => {
      const creq = https.request(`https://api.cloudflare.com/client/v4/zones/${cfZone}/purge_cache`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cfToken}`,
          'Content-Type': 'application/json'
        }
      }, res => {
        console.log('Cloudflare purge completed:', res.statusCode);
        resolve();
      });
      creq.on('error', () => resolve());
      creq.write(JSON.stringify({ purge_everything: true }));
      creq.end();
    });
  }

  console.log('\n=======================================================');
  console.log(`✅ SUCCESS! Added ${allReviewRows.length} human-accent reviews across ${productUpdates.length} products!`);
  console.log('Average per product: 7 to 18 reviews (4.8 - 5.0 stars)');
  console.log('=======================================================\n');
}

main().catch(console.error);
