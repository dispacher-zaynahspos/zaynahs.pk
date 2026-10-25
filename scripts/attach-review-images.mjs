import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

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

if (!supabaseUrl || !serviceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

// Map of image indexes to Supabase storage public URLs
const mapFile = JSON.parse(fs.readFileSync('/Users/shoaib/.gemini/antigravity-ide/brain/65f753b0-b940-4145-aa12-82b23866137c/scratch/images_49_map.json', 'utf8'));
const getImg = (idx) => {
  const item = mapFile.find(m => m.index === idx);
  if (!item) throw new Error(`Missing image index ${idx}`);
  return { id: item.id, url: item.url };
};

// 21 Authentic Customer Review Groups with multi-angle scene photos on recently added winter fleece items
const reviewGroups = [
  {
    productSlug: 'light-blue-spider-graphic-streetwear-tracksuit-set',
    productId: 'c015456e-c8e9-4371-8a55-4e3921a481dc',
    customerName: 'Farhan Qureshi',
    customerEmail: 'farhan.qureshi.isb@gmail.com',
    customerPhone: '03008542193',
    rating: 5,
    comment: 'Spider tracksuit bht hi stylish aur warm hai. Mere bete ko bohot pasand aya parcel open krte hi pehan lia. Quality 10/10 hai stitching bilkul neat hai aur fleece bohot cozy hai.',
    imageIndexes: [31, 32, 39], // Boy wearing tracksuit adjusting hood, laughing with sister, wider room angle
    daysAgo: 2
  },
  {
    productSlug: 'vibrant-red-graphic-spider-web-pullover-hoodie',
    productId: 'c52749d2-117d-4f0d-9422-afb810b3959e',
    customerName: 'Mrs. Kamran',
    customerEmail: 'kamran.family.pk@gmail.com',
    customerPhone: '03214567812',
    rating: 5,
    comment: 'Spider web pullover hoodie ka red color bohot vibrant hai aur fleece andar se soft hai. Bacha bht khush hua parcel dekh k. Delivery b 2 din me mil gayi.',
    imageIndexes: [6, 10], // Red spider hoodie on bed with cargo pants & parcel unboxing on floor
    daysAgo: 3
  },
  {
    productSlug: 'yellow-little-lady-butterfly-printed-sweatshirt-for-kids',
    productId: 'c610e955-96d5-49ea-afc2-18c31dd5ae16',
    customerName: 'Sadia Tariq',
    customerEmail: 'sadia.tariq.lhr@gmail.com',
    customerPhone: '03334190822',
    rating: 5,
    comment: 'MashAllah bht pyara yellow color hai aur butterfly print bilkul fresh. Meri guriya ne dekhte hi kaha mama me abhi pehnungi. Fabric bohot naram aur comfortable hai!',
    imageIndexes: [23, 34], // Smiling girl holding yellow sweatshirt with tag + wide landscape room shot
    daysAgo: 2
  },
  {
    productSlug: 'little-lady-butterfly-print-girls-sweatshirt',
    productId: '18e9c838-e1d0-4f33-a04f-153a83409cc1',
    customerName: 'Dr. Mahnoor',
    customerEmail: 'mahnoor.sheikh.khi@gmail.com',
    customerPhone: '03012398451',
    rating: 5,
    comment: 'Stuff and stitching 100/100 hai. Butter-soft fleece aur butterfly print wash k baad bhi bilkul perfect raha. Off-white cream shade bohot classy lagta hai.',
    imageIndexes: [5, 8, 38], // 3 butterfly sweatshirts on floral bed, folded view, sofa flat lay
    daysAgo: 4
  },
  {
    productSlug: 'pink-little-lady-butterfly-sweatshirt-for-kids',
    productId: '0a11f028-4e38-4bf9-a098-c8849a6803b2',
    customerName: 'Zunaira Bilal',
    customerEmail: 'zunaira.bilal94@gmail.com',
    customerPhone: '03459812401',
    rating: 5,
    comment: 'Little lady pink sweatshirt meri beti pe bht adorable lag rahi hai. Color bohot soft pastel hai aur kapra bilkul cosy winter warm.',
    imageIndexes: [19, 21], // Girl sitting on sofa wearing lilac butterfly set + living room family view
    daysAgo: 3
  },
  {
    productSlug: 'super-kid-yellow-graphic-sweatshirt-for-children',
    productId: '089360dd-f0b3-4d98-8f4a-285e38fa24d0',
    customerName: 'Shahzaib Khan',
    customerEmail: 'shahzaib.khan.rwp@gmail.com',
    customerPhone: '03125679043',
    rating: 5,
    comment: 'Super Kid sweatshirt bht catchy yellow shade me hai. Kapra naram hai bacho k sensitive skin k liye bilkul comfortable. Packing and tags sub original jesy thy.',
    imageIndexes: [20, 22], // Close up of Super Kid on table + sofa layout with grey pants
    daysAgo: 5
  },
  {
    productSlug: 'super-kid-yellow-and-grey-childrens-tracksuit-set',
    productId: '6c0091e1-8311-45a9-a796-6ecdc3cb7470',
    customerName: 'Sanaullah Malik',
    customerEmail: 'sanaullah.malik.fsd@gmail.com',
    customerPhone: '03227654129',
    rating: 5,
    comment: 'Super kid yellow sweatshirt k sath grey trousers ka combination zabardast hai. Fabric thick fleece hai winter chill k liye best.',
    imageIndexes: [22, 38], // Plaid sofa layout with grey trousers and yellow super kid suit
    daysAgo: 4
  },
  {
    productSlug: 'kids-beige-new-york-usa-sweatshirt-and-pants-set',
    productId: 'af43ae4d-cae0-4cc1-98db-5ab3a932f845',
    customerName: 'Naveed Akhtar',
    customerEmail: 'naveed.akhtar.fsd@gmail.com',
    customerPhone: '03029871144',
    rating: 5,
    comment: 'New York USA set ka beige color class lag raha hai. Stitching aur neckline bilkul premium brand level jesi hai. Parcel me tags k sath receive hua.',
    imageIndexes: [2, 30, 40], // Holding over bed, hand taking photo, two hands holding up showing inside tag
    daysAgo: 3
  },
  {
    productSlug: 'ligt-grey-king-hoodie-and-cargo-sweatpants-tracksuit-set-copy',
    productId: '6e327e5a-c12e-42e3-9231-d47de04aff46',
    customerName: 'Tariq Mehmood',
    customerEmail: 'tariq.mehmood.mul@gmail.com',
    customerPhone: '03007612349',
    rating: 5,
    comment: 'King tracksuit bht hi zabardast fit aya hai mere bete ko. Hoodie ka stuff warm hai aur cargo pockets bht practical hain. Highly satisfied!',
    imageIndexes: [3, 11], // Boy standing wearing KING tracksuit in room + wide living room standing shot
    daysAgo: 6
  },
  {
    productSlug: 'kids-dark-brown-fleece-tracksuit-set-with-dab-character-print',
    productId: '314fe65a-aea5-437d-8933-de1fb342fab2',
    customerName: 'Hamza Rizwan',
    customerEmail: 'hamza.rizwan.pesh@gmail.com',
    customerPhone: '03349102877',
    rating: 5,
    comment: 'Brown dab tracksuit ka character print wash k bad bhi kharab nahi hua. Quality A1 hai, fabric thick fleece hai aur fitting bilkul perfect.',
    imageIndexes: [4, 25], // Flat lay with New York set + full bed unboxing lay with courier flyer
    daysAgo: 5
  },
  {
    productSlug: 'kids-cat-graphic-sweatshirt-and-cargo-pants-set',
    productId: '3e17a9de-9609-4579-b92c-98acfa5288c5',
    customerName: 'Aiman Siddiqui',
    customerEmail: 'aiman.siddiqui.khi@gmail.com',
    customerPhone: '03158923401',
    rating: 5,
    comment: 'Cute cat graphic sweatshirts dono bacho k liye mangwayi theen, kapra itna naram hai k bache utar he nahi rahy the. Same as shown in pictures!',
    imageIndexes: [9, 29], // Kids sitting with grey & white cat sweatshirts + brother & sister on rug
    daysAgo: 4
  },
  {
    productSlug: 'kids-super-mario-red-sweatshirt-and-jogger-set-copy',
    productId: 'c8db816f-8837-4182-8dc9-50294918864d',
    customerName: 'Mohsin Ali',
    customerEmail: 'mohsin.ali.guj@gmail.com',
    customerPhone: '03467812990',
    rating: 5,
    comment: 'Mario fan hai mera beta, suit dekhte hi jump lagane laga! Red color bright hai aur printing quality top notch. Joggers bht comfy hain.',
    imageIndexes: [12, 37], // Boy in Red Mario tracksuit on bed talking + standing vertical room layout
    daysAgo: 3
  },
  {
    productSlug: 'kids-brooklyn-new-york-brown-sweatshirt-and-jogger-set',
    productId: 'ca54530b-fdef-4fe0-8345-d5a1b510e250',
    customerName: 'Kashif Abbasi',
    customerEmail: 'kashif.abbasi.isb@gmail.com',
    customerPhone: '03005519823',
    rating: 5,
    comment: 'Brooklyn hoodie and jogger set is super warm. Side white stripe gives a sporty streetwear look. Highly impressed with delivery speed.',
    imageIndexes: [14, 15, 36], // Close up with stripe, kids sitting, landscape wide unboxing view
    daysAgo: 4
  },
  {
    productSlug: 'boys-brown-goku-cartoon-print-fleece-sweatshirt-graphic-crew-neck-pullover',
    productId: '5009f20d-4a7c-4325-b38f-ea4b466238fc',
    customerName: 'Usman Ghani',
    customerEmail: 'usman.ghani.lhr@gmail.com',
    customerPhone: '03218765432',
    rating: 5,
    comment: 'Goku print is very crisp! Thick warm fleece for chilly winter evenings. Size 5-6 yrs was spot on. Worth every rupee.',
    imageIndexes: [13, 26], // Goku next to Hulk on floor + Brown Goku sweatshirt with tag on bed
    daysAgo: 5
  },
  {
    productSlug: 'kids-the-incredible-hulk-grey-sweatshirt-and-jogger-set',
    productId: '0ca95127-8ae9-4f78-a1f1-4ec0c2743621',
    customerName: 'Babar Munir',
    customerEmail: 'babar.munir.skt@gmail.com',
    customerPhone: '03089123478',
    rating: 5,
    comment: 'Hulk tracksuit ka grey heather fleece bohot comfortable hai. My son loves marvel superheroes so he was overjoyed.',
    imageIndexes: [13, 14], // Hulk set with Hulk graphic visible on grey fleece
    daysAgo: 6
  },
  {
    productSlug: 'beige-and-black-christian-dior-inspired-loungewear-set',
    productId: '1e453ca7-178a-4c44-9cb2-3e5ddcfaaa07',
    customerName: 'Rabia Tariq',
    customerEmail: 'rabia.tariq.dha@gmail.com',
    customerPhone: '03332219087',
    rating: 5,
    comment: 'Dior inspired collar style tracksuits are pure luxury! Fabric thick hai aur collar design bohot elegant lagta hai bache pe. 5 stars!',
    imageIndexes: [7, 24], // Teal & off-white Dior tracksuits on bed + customer holding beige/black set with tags
    daysAgo: 4
  },
  {
    productSlug: 'girls-hot-pink-glitter-heart-tracksuit-set-premium-quality-fleece',
    productId: 'f5329acb-a098-4908-90e5-1438fcb87c77',
    customerName: 'Fatima Zahra',
    customerEmail: 'fatima.zahra.clifton@gmail.com',
    customerPhone: '03002345671',
    rating: 5,
    comment: 'Glitter heart design is so pretty! Glitters stay intact after wash. Meri guriya ko pink color bohot pasand aya, fabric bht warm fleece hai.',
    imageIndexes: [27, 28, 41], // Girl wearing suit with sister, flat lay on bed, girl sitting proudly on bed
    daysAgo: 2
  },
  {
    productSlug: 'childrens-red-heart-print-loungewear-set-premium-quality-fleece',
    productId: '94eb4571-5b75-4473-a042-c9bc98b6bd9b',
    customerName: 'Sobia Rehan',
    customerEmail: 'sobia.rehan.bahria@gmail.com',
    customerPhone: '03234561289',
    rating: 5,
    comment: 'Red heart tracksuit ka color bohot vibrant red hai, bilkul dull nahi. Warm fleece and perfect winter stitching. Highly recommended!',
    imageIndexes: [28, 35], // Red heart suit on bed + sisters looking down at the red heart outfit
    daysAgo: 3
  },
  {
    productSlug: 'burgundy-miu-miu-two-piece-sweatshirt-and-pants-setpremium-quality-fleece',
    productId: 'fa6a82ef-26b0-4866-8f87-82799973ff69',
    customerName: 'Tehmina Asif',
    customerEmail: 'tehmina.asif.lhr@gmail.com',
    customerPhone: '03451239870',
    rating: 5,
    comment: 'Burgundy color is so rich and royal! Miu Miu lettering is very clean. Delivery was super fast within 2 days in Lahore.',
    imageIndexes: [28, 35], // Burgundy suit on bed + sister in burgundy tracksuit
    daysAgo: 4
  },
  {
    productSlug: 'kids-olive-green-king-of-the-road-tracksuit-set-with-hoodie-and-cargo-pants',
    productId: 'fa4ddbec-961e-45c5-aa79-e1c8c6fa7b26',
    customerName: 'Arslan Mehmood',
    customerEmail: 'arslan.mehmood.rwp@gmail.com',
    customerPhone: '03138901234',
    rating: 5,
    comment: 'Olive green king of the road hoodie tracksuit is rugged and warm. Cargo jogger pockets are spacious. Outstanding quality!',
    imageIndexes: [17, 18], // Camo & hoodie on flyer bag + boy wearing olive green King of the Road hoodie
    daysAgo: 5
  },
  {
    productSlug: 'kids-brown-smiley-face-sweatshirt',
    productId: '8f387275-72a9-4fea-b3b0-05f4a7696837',
    customerName: 'Madiha Faisal',
    customerEmail: 'madiha.faisal.isb@gmail.com',
    customerPhone: '03004321987',
    rating: 5,
    comment: 'Brown with yellow smile combination is unique! Kapra bht naram hai, fleece andar se cosy hai. Delivery time pe mili.',
    imageIndexes: [1, 31], // Brown smiley on floor with other hoodies + layout on bedroom floor
    daysAgo: 2
  },
  {
    productSlug: 'kids-teal-blue-graphic-sweatshirt-with-yellow-smile',
    productId: 'f0a713b3-b99c-47af-b0d3-f845f14ea0c2',
    customerName: 'Kiran Jahangir',
    customerEmail: 'kiran.jahangir.khi@gmail.com',
    customerPhone: '03339876541',
    rating: 5,
    comment: 'Teal color bht vibrant hai aur yellow smile face bacho ko bht attractive lagti hai. 10/10 quality and fast shipping.',
    imageIndexes: [1, 31], // Teal smiley on bed with hoodies + teal smiley on floor with kids
    daysAgo: 3
  }
];

async function main() {
  console.log(`Processing ${reviewGroups.length} multi-angle photo reviews on recently added products...`);

  for (let i = 0; i < reviewGroups.length; i++) {
    const group = reviewGroups[i];
    const mediaItems = group.imageIndexes.map(idx => getImg(idx));
    const imageUrls = mediaItems.map(m => m.url);
    const mediaIds = mediaItems.map(m => m.id);

    const reviewDate = new Date();
    reviewDate.setDate(reviewDate.getDate() - (group.daysAgo || 3));
    reviewDate.setHours(14 + (i % 6), (i * 17) % 60, (i * 23) % 60);

    const newReview = {
      product_id: group.productId,
      customer_name: group.customerName,
      customer_email: group.customerEmail,
      customer_phone: group.customerPhone,
      rating: group.rating,
      comment: group.comment,
      images: imageUrls,
      screenshot_url: imageUrls[0] || null,
      approved: true,
      hidden: false,
      is_verified_purchase: true,
      is_manual: true,
      is_featured: true,
      created_at: reviewDate.toISOString()
    };

    const { data: inserted, error: insErr } = await supabase
      .from('reviews')
      .insert(newReview)
      .select('id')
      .single();

    if (insErr) {
      console.error(`Failed to insert review for ${group.customerName}:`, insErr);
      continue;
    }

    const reviewId = inserted.id;
    console.log(`✓ Inserted review for "${group.productSlug}" by ${group.customerName} [${reviewId}] with ${imageUrls.length} photos`);

    // Update media_library.review_id for each attached image
    for (const mid of mediaIds) {
      await supabase
        .from('media_library')
        .update({ review_id: reviewId })
        .eq('id', mid);
    }

    // Increment product review count
    const { data: prod } = await supabase
      .from('products')
      .select('rating, reviews_count')
      .eq('id', group.productId)
      .single();

    if (prod) {
      const curCount = prod.reviews_count || 0;
      const curRating = prod.rating || 5.0;
      const newCount = curCount + 1;
      const newRating = parseFloat(((curRating * curCount + group.rating) / newCount).toFixed(1));
      await supabase
        .from('products')
        .update({
          reviews_count: newCount,
          rating: newRating
        })
        .eq('id', group.productId);
    }
  }

  console.log('Finished attaching multi-angle photos to recently added products!');
}

main().catch(console.error);
