import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envContent = fs.readFileSync('env-backups/totvogue.env.local', 'utf8');
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(l => l && !l.startsWith('#'))
    .map(l => {
      const i = l.indexOf('=');
      let v = l.slice(i + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      return [l.slice(0, i).trim(), v];
    })
);

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const proofItems = [
  {
    filename: 'PHOTO-2026-10-30-15-41-29.webp',
    caption: 'I received my parcel, bht achy hy! Aur order kru gi jald hi In sha Allah ❤️',
    productId: null
  },
  {
    filename: 'PHOTO-2026-11-11-20-31-56_5.webp',
    caption: 'Mashallah fitting aur stuff bohot hi pyara aya hai, bachi bohot khush hai!',
    productId: '28ab7553-156d-42dc-8b21-20d6754c812d'
  },
  {
    filename: 'PHOTO-2026-11-08-00-54-54.webp',
    caption: 'Asslam o alikum bahi parsal receive ho gya haiii ... Masha Allah bohat Acha track suit tha, stuff b bohat Acha haiii.',
    productId: null
  },
  {
    filename: 'PHOTO-2026-11-13-17-02-17.webp',
    caption: 'Parcel mil gaya, Mario tracksuit ka stuff aur print zabardast hai! Bacha bht khush hua.',
    productId: 'c8db816f-8837-4182-8dc9-50294918864d'
  },
  {
    filename: 'PHOTO-2026-10-31-16-59-57.webp',
    caption: 'Bohat shukriya parcel time pe mil gaya, Red spider sweatshirt bht pyari aur garam hai!',
    productId: '71d3c594-da99-48f1-8a70-563e49c6c707'
  },
  {
    filename: 'PHOTO-2026-10-30-17-10-17.webp',
    caption: 'Aoa, Parcel received! Stuff quality boht acha ha, customer bohot satisfied hai 👍',
    productId: null
  },
  {
    filename: 'PHOTO-2026-11-13-10-30-29.webp',
    caption: 'I recently ordered three suits for my daughter from Totvogue, and I absolutely loved them! The fabric quality is excellent and designs are unique.',
    productId: null
  },
  {
    filename: 'PHOTO-2026-11-04-17-21-09.webp',
    caption: 'Aoa bhai parcel mil gya hy bht acha hy Mashallah ❤️',
    productId: null
  },
  {
    filename: 'PHOTO-2026-11-11-20-31-56_2.webp',
    caption: 'Little Lady Butterfly tracksuit quality is superb! Thank you so much TotVogue.',
    productId: '67c9a660-ad71-4233-86ba-03f7bbe7e64e'
  },
  {
    filename: 'PHOTO-2026-11-13-21-20-04_2.webp',
    caption: 'Alhamdulillah parcel received ho gya. Fitting bilkul accurate hai aur kapra bht soft fleece hai.',
    productId: '1479b2ca-a0b4-40c2-a6b3-7cdb887b5bc2'
  },
  {
    filename: 'PHOTO-2026-11-07-21-21-18.webp',
    caption: 'G brother parcel mil gya hy bht he zbrdst ha quality bhi bht achi hy ❤️',
    productId: null
  },
  {
    filename: 'PHOTO-2026-11-11-20-31-56_6.webp',
    caption: 'Bloom Gracefully set is gorgeous, colors and fleece stitching are top notch!',
    productId: '9a75c36e-134d-4360-9e25-929c77f84223'
  },
  {
    filename: 'PHOTO-2026-11-06-15-53-45.webp',
    caption: 'Assalam o alaikum, parcel received. Same as shown, bohot shukriya!',
    productId: null
  },
  {
    filename: 'PHOTO-2026-11-13-20-24-02.webp',
    caption: 'AoA Bhai Salam, Tracksuit mil gaya hai boht hi achi quality ka hai. Highly recommended! (TV10531)',
    productId: '1479b2ca-a0b4-40c2-a6b3-7cdb887b5bc2'
  },
  {
    filename: 'PHOTO-2026-11-13-16-59-14.webp',
    caption: 'Mario Red Tracksuit customer unboxing photo. Perfect fit and bright colors.',
    productId: 'c8db816f-8837-4182-8dc9-50294918864d'
  },
  {
    filename: 'PHOTO-2026-11-11-10-06-11.webp',
    caption: 'Parcel mil gaya hai, dresses bohot pyare hain. Same jesa picture mein tha bilkul wesa!',
    productId: null
  },
  {
    filename: 'PHOTO-2026-10-31-16-59-56.webp',
    caption: 'Customer parcel received with satisfaction. Very fast delivery and excellent packing.',
    productId: '71d3c594-da99-48f1-8a70-563e49c6c707'
  },
  {
    filename: 'PHOTO-2026-11-11-20-31-56_3.webp',
    caption: 'Customer wear review - Tracksuit fitting is 10/10.',
    productId: '28ab7553-156d-42dc-8b21-20d6754c812d'
  },
  {
    filename: 'PHOTO-2026-11-04-16-54-34_2.webp',
    caption: 'G g Bhai mil gya aj parcel .. satisfied inshallah again shopping krungi ap se ❤️',
    productId: null
  },
  {
    filename: 'PHOTO-2026-11-13-21-20-04.webp',
    caption: 'Nike fleece tracksuit wear review by cute baby customer. Looking handsome!',
    productId: '1479b2ca-a0b4-40c2-a6b3-7cdb887b5bc2'
  },
  {
    filename: 'PHOTO-2026-11-04-16-54-34.webp',
    caption: 'Customer WhatsApp parcel unboxing photo proof.',
    productId: null
  },
  {
    filename: 'PHOTO-2026-10-28-13-06-31.webp',
    caption: 'Aoa sir parcel received, bhot achi quality hy kapry ki aur size bhi bilkul theek hai.',
    productId: null
  },
  {
    filename: 'PHOTO-2026-11-11-20-31-56_4.webp',
    caption: 'Little Lady Butterfly suit child photo review. Adorable fit!',
    productId: '67c9a660-ad71-4233-86ba-03f7bbe7e64e'
  },
  {
    filename: 'PHOTO-2026-11-11-18-27-33.webp',
    caption: 'Bohat pyara suit hai, kapra bohot soft aur garam hai. Shukriya TotVogue! (TV10502)',
    productId: null
  },
  {
    filename: 'PHOTO-2026-11-07-13-52-59.webp',
    caption: 'Bhai parcel mil gya. Bohot pasand aya bacho ko. Definitely ordering again!',
    productId: null
  },
  {
    filename: 'PHOTO-2026-11-11-20-31-56.webp',
    caption: 'Miu Miu Burgundy Two-Piece suit wear review. Customer loved the warmth and fit.',
    productId: 'fa6a82ef-26b0-4866-8f87-82799973ff69'
  },
  {
    filename: 'PHOTO-2026-10-28-12-34-58.webp',
    caption: 'AOA bhai parcel mil gya bohat acha hy kapra bht shukriya ❤️',
    productId: null
  },
  {
    filename: 'PHOTO-2026-11-07-11-45-15.webp',
    caption: 'Bhai parcel received ho gaya hai. Quality is truly premium!',
    productId: null
  },
  {
    filename: 'PHOTO-2026-10-28-02-07-39.webp',
    caption: 'Aoa, parcel received ho gya ha stuff bhot acha ha thanks! (TV10309)',
    productId: null
  },
  {
    filename: 'PHOTO-2026-10-28-13-28-42.webp',
    caption: 'Salam, got the parcel. Excellent fabric, perfect stitching. Highly satisfied!',
    productId: null
  },
  {
    filename: 'PHOTO-2026-11-05-14-12-37.webp',
    caption: 'AoA sir, parcel recive ho gia hy. Kapra bohat zabardast hy or printing bht achi hy.',
    productId: null
  },
  {
    filename: 'PHOTO-2026-11-10-14-49-59.webp',
    caption: 'Slate Blue Spider web graphic review. Super cozy for winter!',
    productId: 'a7f9a3e7-1c53-4b68-8e0d-dcf3618d0ee9'
  },
  {
    filename: 'PHOTO-2026-10-30-00-23-04.webp',
    caption: 'Assalam o alaikum brother parcel mil gya hai, bht acha stuff hai jesa socha tha wesa hi nikla.',
    productId: null
  },
  {
    filename: 'PHOTO-2026-11-01-08-54-33.webp',
    caption: 'Aoa, parcel receive ho gaya ha, stuff boht acha ha, inshallah dobara bhi order kron ga.',
    productId: null
  },
  {
    filename: 'PHOTO-2026-11-13-10-29-59.webp',
    caption: 'Trousers package delivered safely. Fabric is soft fleece and sizes are perfect.',
    productId: '105be32a-b9c5-4692-b509-fdc4b539ecc6'
  }
];

async function main() {
  console.log('🗑️ Step 1: Deleting the 35 recently inserted reviews from "reviews" table...');
  const { error: delErr } = await sb
    .from('reviews')
    .delete()
    .eq('created_at', '2026-11-16T01:00:50.823357+00:00');

  if (delErr) {
    console.error('Delete error:', delErr.message);
  } else {
    console.log('✅ Successfully removed the 35 reviews from reviews table!');
  }

  console.log('🔍 Step 2: Fetching media library URLs for the 35 files...');
  const { data: mediaRows, error: mediaErr } = await sb
    .from('media_library')
    .select('original_filename, file_url')
    .ilike('original_filename', 'PHOTO-2026%');

  if (mediaErr) {
    console.error('Media fetch error:', mediaErr.message);
    return;
  }

  const mediaMap = new Map();
  mediaRows.forEach(m => {
    mediaMap.set(m.original_filename.toLowerCase(), m.file_url);
  });

  console.log(`Found ${mediaMap.size} media records.`);

  console.log('🚀 Step 3: Inserting into "social_proof" table as WhatsApp Wall Proof...');
  let sortOrder = 10;
  for (const item of proofItems) {
    const fileUrl = mediaMap.get(item.filename.toLowerCase());
    if (!fileUrl) {
      console.warn('⚠️ File URL not found for:', item.filename);
      continue;
    }

    const { data: proofData, error: proofErr } = await sb
      .from('social_proof')
      .insert({
        image_url: fileUrl,
        caption: item.caption,
        source_type: 'whatsapp',
        active: true,
        sort_order: sortOrder++,
        created_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (proofErr) {
      console.error(`Error inserting proof for ${item.filename}:`, proofErr.message);
      continue;
    }

    if (item.productId && proofData?.id) {
      const { error: linkErr } = await sb
        .from('social_proof_products')
        .insert({
          social_proof_id: proofData.id,
          product_id: item.productId
        });
      if (linkErr) {
        console.error(`Error linking product ${item.productId}:`, linkErr.message);
      }
    }
  }

  console.log('✅ All 35 WhatsApp Wall Proof cards inserted successfully!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
