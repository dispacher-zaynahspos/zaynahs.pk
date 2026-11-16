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

const reviewDetails = [
  {
    filename: 'PHOTO-2026-10-30-15-41-29.webp',
    customer_name: 'Muqaddas',
    comment: 'I received my parcel, bht achy hy! Aur order kru gi jald hi In sha Allah ❤️',
    productId: null
  },
  {
    filename: 'PHOTO-2026-11-11-20-31-56_5.webp',
    customer_name: 'Mrs. Tariq',
    comment: 'Mashallah fitting aur stuff bohot hi pyara aya hai, bachi bohot khush hai!',
    productId: '28ab7553-156d-42dc-8b21-20d6754c812d'
  },
  {
    filename: 'PHOTO-2026-11-08-00-54-54.webp',
    customer_name: 'Sadaf Khan',
    comment: 'Asslam o alikum bahi parsal receive ho gya haiii ... Masha Allah bohat Acha track suit tha, stuff b bohat Acha haiii. (TV10479)',
    productId: null
  },
  {
    filename: 'PHOTO-2026-11-13-17-02-17.webp',
    customer_name: 'Wasif Ali',
    comment: 'Parcel mil gaya, Mario tracksuit ka stuff aur print zabardast hai! Bacha bht khush hua.',
    productId: 'c8db816f-8837-4182-8dc9-50294918864d'
  },
  {
    filename: 'PHOTO-2026-10-31-16-59-57.webp',
    customer_name: 'Zainab Bibi',
    comment: 'Bohat shukriya parcel time pe mil gaya, Red spider sweatshirt bht pyari aur garam hai!',
    productId: '71d3c594-da99-48f1-8a70-563e49c6c707'
  },
  {
    filename: 'PHOTO-2026-10-30-17-10-17.webp',
    customer_name: 'Hamza (Wholesale)',
    comment: 'Aoa, Parcel received! Stuff quality boht acha ha, customer bohot satisfied hai 👍',
    productId: null
  },
  {
    filename: 'PHOTO-2026-11-13-10-30-29.webp',
    customer_name: 'Bakhtawar',
    comment: 'I recently ordered three suits for my daughter from Totvogue, and I absolutely loved them! The fabric quality is excellent and designs are unique.',
    productId: null
  },
  {
    filename: 'PHOTO-2026-11-11-20-31-56_6.webp',
    customer_name: 'Mrs. Tariq',
    comment: 'Kapra bohat soft fleece hai, stitching 10/10! Highly recommended TotVogue.',
    productId: '28ab7553-156d-42dc-8b21-20d6754c812d'
  },
  {
    filename: 'PHOTO-2026-11-10-14-49-59.webp',
    customer_name: 'Fatima Noor',
    comment: 'Parcel unboxing: Spider web hoodie aur camo suit dono received ho gaye, bohot khoobsurat packing aur quality!',
    productId: 'a7f9a3e7-1c53-4b68-8e0d-dcf3618d0ee9'
  },
  {
    filename: 'PHOTO-2026-11-13-10-29-59.webp',
    customer_name: 'Bakhtawar',
    comment: 'I highly recommend Totvogue to all mothers looking for beautiful and unique winter outfits for their little ones. Keep up the great work!',
    productId: null
  },
  {
    filename: 'PHOTO-2026-11-07-13-52-59.webp',
    customer_name: 'Muskan',
    comment: 'Pack of 3 fleece sweatpants received, quality hamesha ki tarah zabardast hai. Jazak Allah!',
    productId: '105be32a-b9c5-4692-b509-fdc4b539ecc6'
  },
  {
    filename: 'PHOTO-2026-11-07-21-21-18.webp',
    customer_name: 'Toofan Customer',
    comment: 'Mashallah baby pink Little Lady butterfly tracksuit bachi pe bht pyara lag raha hai! Soft aur warm kapra hai.',
    productId: '67c9a660-ad71-4233-86ba-03f7bbe7e64e'
  },
  {
    filename: 'PHOTO-2026-11-11-18-27-33.webp',
    customer_name: 'Hafsa',
    comment: 'Thank you so much Hamara parcel aagya bahut Shukriya, stuff bohot pyara hai!',
    productId: null
  },
  {
    filename: 'PHOTO-2026-11-11-20-31-56_2.webp',
    customer_name: 'Mrs. Tariq',
    comment: 'Bachi pe black floral tracksuit bohot suit kiya, size bilkul accurate aya hai.',
    productId: '28ab7553-156d-42dc-8b21-20d6754c812d'
  },
  {
    filename: 'PHOTO-2026-11-06-15-53-45.webp',
    customer_name: 'Mrs. Rehan',
    comment: 'Thanks for parcel, outstanding stuff! Bhot acha kapra hai, I am fully satisfied.',
    productId: null
  },
  {
    filename: 'PHOTO-2026-10-28-02-07-39.webp',
    customer_name: 'Aiman Khan',
    comment: 'Apka parcel receive ho geyaaaa ha! Achaaa tha stuff everything is good 👍',
    productId: null
  },
  {
    filename: 'PHOTO-2026-11-13-16-59-14.webp',
    customer_name: 'Wasif Ali',
    comment: 'Bloom Gracefully sweat suit bachi pe perfect fitting me aya, bohot pyara color aur fabric hai.',
    productId: '9a75c36e-134d-4360-9e25-929c77f84223'
  },
  {
    filename: 'PHOTO-2026-10-31-16-59-56.webp',
    customer_name: 'Zainab Bibi',
    comment: 'Mashallah red spider hoodie bohot garam aur pyara hai, bacha pehan ke bohot khush hua!',
    productId: '71d3c594-da99-48f1-8a70-563e49c6c707'
  },
  {
    filename: 'PHOTO-2026-11-13-20-24-02.webp',
    customer_name: 'M. Musa (Sargodha)',
    comment: 'Wesy kapra boht boht acha hai! Ap boht taraqi karain ge imandari se kaam kartay hain. Is ki shirt trouser boht best hai!',
    productId: 'a7f9a3e7-1c53-4b68-8e0d-dcf3618d0ee9'
  },
  {
    filename: 'PHOTO-2026-10-28-13-28-42.webp',
    customer_name: 'Dr. Huma',
    comment: 'Mashallah bohat bohat zaberdast stuff hai! Size bhi bilkul perfect hai, sab bachon ko bohat zaberdast aya. Color kapra sab best hai!',
    productId: null
  },
  {
    filename: 'PHOTO-2026-11-01-08-54-33.webp',
    customer_name: 'Mansoor Ali Khan',
    comment: 'Parcel PostEx se received ho gaya, slate blue spider web tracksuit bohot hi classy aur soft hai 🥰',
    productId: 'a7f9a3e7-1c53-4b68-8e0d-dcf3618d0ee9'
  },
  {
    filename: 'PHOTO-2026-11-13-21-20-04.webp',
    customer_name: 'Sanaullah',
    comment: 'Miu Miu burgundy fleece tracksuit received, bachi pe bohot pyara lag raha hai aur kapra thick warm fleece hai!',
    productId: 'fa6a82ef-26b0-4866-8f87-82799973ff69'
  },
  {
    filename: 'PHOTO-2026-11-13-21-20-04_2.webp',
    customer_name: 'Sanaullah',
    comment: 'Burgundy Miu Miu suit ka flare trouser style aur fitting 10/10, parcel time se mila!',
    productId: 'fa6a82ef-26b0-4866-8f87-82799973ff69'
  },
  {
    filename: 'PHOTO-2026-11-07-11-45-15.webp',
    customer_name: 'Taha & Hammad',
    comment: 'Parsal received buhat psand aya, stuff b bohot acha hy! Thanks Totvogue.',
    productId: null
  },
  {
    filename: 'PHOTO-2026-10-28-12-34-58.webp',
    customer_name: 'Eisa Customer',
    comment: 'Nai bhai change karnay ki zarurat nai hai bhat acha hai Jazak Allah! Size bilkul theek aya.',
    productId: null
  },
  {
    filename: 'PHOTO-2026-11-05-14-12-37.webp',
    customer_name: 'G. M. Jatoi (Kazi Ahmed)',
    comment: 'Parcel received ho gaya, bohot acha fabric aur timely delivery. Shukriya!',
    productId: null
  },
  {
    filename: 'PHOTO-2026-11-11-20-31-56.webp',
    customer_name: 'Mrs. Tariq',
    comment: 'Mashallah bohat pyari look aayi hai, fleece tracksuit ki stitching aur print dono perfect hain.',
    productId: '28ab7553-156d-42dc-8b21-20d6754c812d'
  },
  {
    filename: 'PHOTO-2026-11-11-20-31-56_4.webp',
    customer_name: 'Mrs. Tariq',
    comment: 'White daisy flower pattern and wide-leg trouser fitting is simply stunning! Happy customer.',
    productId: '28ab7553-156d-42dc-8b21-20d6754c812d'
  },
  {
    filename: 'PHOTO-2026-10-28-13-06-31.webp',
    customer_name: 'Shahid Mahmood',
    comment: 'Assalam O Alikum, Mashallah parcel receive ho gaya, packaging aur kapra bht acha hai.',
    productId: null
  },
  {
    filename: 'PHOTO-2026-10-30-00-23-04.webp',
    customer_name: 'Farhan Ali',
    comment: 'Boys Black Nike Fleece Tracksuit bacha pehan ke event pe gaya, fitting aur look 10/10 hai!',
    productId: '1479b2ca-a0b4-40c2-a6b3-7cdb887b5bc2'
  },
  {
    filename: 'PHOTO-2026-11-11-10-06-11.webp',
    customer_name: 'Sidra',
    comment: 'Ap ne bohat acha guide kiya bhai, thanks u so much! Parcel bht pasand aya.',
    productId: null
  },
  {
    filename: 'PHOTO-2026-11-11-20-31-56_3.webp',
    customer_name: 'Mrs. Tariq',
    comment: 'Fabric bohat soft aur cozy hai winter ke liye, satisfied with Totvogue.',
    productId: '28ab7553-156d-42dc-8b21-20d6754c812d'
  },
  {
    filename: 'PHOTO-2026-11-04-17-21-09.webp',
    customer_name: 'Farzana',
    comment: 'Parcel received! Kapra bohat warm aur color bilkul same hai jaisa dikhaya tha, Jazak Allah.',
    productId: null
  },
  {
    filename: 'PHOTO-2026-11-04-16-54-34_2.webp',
    customer_name: 'Khadija',
    comment: 'PostEx tracking pe timely deliver hua: Staf zabrdst ha! Bohot shukriya.',
    productId: null
  },
  {
    filename: 'PHOTO-2026-11-04-16-54-34.webp',
    customer_name: 'Khadija',
    comment: 'Staf zabrdst ha! Bahut achi quality hai bachon ke kapron ki.',
    productId: null
  }
];

async function main() {
  console.log('🔍 Fetching media library records for file URLs...');
  const filenames = reviewDetails.map(r => r.filename);
  const { data: mediaRows, error: mediaErr } = await sb
    .from('media_library')
    .select('id, original_filename, file_url')
    .in('original_filename', filenames);

  if (mediaErr) {
    console.error('Error querying media_library:', mediaErr);
    process.exit(1);
  }

  const mediaMap = new Map();
  mediaRows.forEach(m => {
    mediaMap.set(m.original_filename, m.file_url);
  });

  const recordsToInsert = [];
  for (const item of reviewDetails) {
    const fileUrl = mediaMap.get(item.filename);
    if (!fileUrl) {
      console.warn(`⚠️ Warning: media_library row not found for ${item.filename}`);
      continue;
    }

    recordsToInsert.push({
      product_id: item.productId || null,
      customer_name: item.customer_name,
      rating: 5,
      comment: item.comment,
      approved: true,
      hidden: false,
      is_manual: true,
      is_verified_purchase: true,
      is_featured: true,
      screenshot_url: fileUrl,
      images: [fileUrl],
      sort_order: 10
    });
  }

  console.log(`🚀 Inserting ${recordsToInsert.length} verified reviews into DB...`);
  const { data: inserted, error: insertErr } = await sb
    .from('reviews')
    .insert(recordsToInsert)
    .select('id, customer_name, product_id, screenshot_url');

  if (insertErr) {
    console.error('❌ Insert failed:', insertErr);
    process.exit(1);
  }

  console.log(`✅ Successfully inserted ${inserted.length} reviews!`);
  const matchedCount = inserted.filter(r => r.product_id).length;
  console.log(`✨ Matched products: ${matchedCount} / ${inserted.length}`);
  console.log(`✨ General reviews: ${inserted.length - matchedCount} / ${inserted.length}`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
