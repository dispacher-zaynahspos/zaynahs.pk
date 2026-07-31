# Google SMTP Email System — Complete Guide

## Overview

This project uses **Nodemailer** with **Gmail SMTP** (`service: 'gmail'`) to send transactional emails. Email templates are rendered using **@react-email** components or custom HTML strings. All SMTP credentials are stored in the **database** (`store_settings` table), **not** in `.env` files — so admins can change them from the admin panel without redeploying.

## Architecture

```
Trigger (e.g., onOrderPlaced)
       │
       ▼
   triggers.ts  (lib/email/triggers.ts)
       │
       ▼
   sendTemplatedEmail()  (lib/email/sendTemplatedEmail.ts)
       │
       ├── Fetch template from DB (email_templates table)
       ├── Build variables (lib/email/variables.ts)
       ├── Replace {{variables}} in subject/HTML
       └── Call sendEmail()
              │
              ▼
   sendEmail()  (lib/email/sendEmail.ts)
       │
       ├── Read SMTP credentials from store_settings (DB)
       ├── Create Nodemailer Gmail transport
       ├── Render React template or use raw HTML
       └── Send via Gmail SMTP
```

## Files (6 core files)

| File | Purpose |
|------|---------|
| `lib/email/sendEmail.ts` | **Core sender** — creates Nodemailer transport, sends email |
| `lib/email/sendTemplatedEmail.ts` | **Template layer** — fetches DB template, resolves variables, dispatches |
| `lib/email/triggers.ts` | **Triggers** — 11 trigger functions called from services |
| `lib/email/variables.ts` | **Variable engine** — builds `{{variable}}` map, renders order items table |
| `lib/email/defaults/getDefaultTemplate.ts` | **18 built-in HTML templates** (Shopify-style, fallback) |
| `lib/services/emailTemplates.ts` | **CRUD** for `email_templates` table |

## How SMTP Credentials Are Stored & Used

### Database Table: `store_settings`
```
smtp_email           TEXT  →  Gmail address (e.g., store@gmail.com)
smtp_app_password    TEXT  →  16-char Gmail App Password
smtp_from_name       TEXT  →  Sender display name
admin_notification_email  TEXT  →  Separate email for admin alerts (optional)
```

### How They're Read at Runtime (`sendEmail.ts`)

```typescript
const settings = await getSettings();             // reads from DB via supabaseAdmin (service role)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: settings.smtp_email,
    pass: settings.smtp_app_password.replace(/\s+/g, ''), // removes spaces
  },
});
transporter.sendMail({
  from: `"${settings.smtp_from_name || settings.storeName}" <${settings.smtp_email}>`,
  to,
  subject,
  text: htmlToText(htmlContent),   // auto-generated plain text
  html: htmlContent,
});
```

### How They're Set (Admin → DB)

1. **Admin UI:** `/admin/settings` → "Email" tab (`components/admin/settings/EmailTab.tsx`)
2. **API:** `POST /api/settings` → calls `updateSettings()` in `lib/services/settings.ts`
3. **DB Update:** `supabaseAdmin.from('store_settings').update({ smtp_email, smtp_app_password })`
4. **Cache:** revalidated via `revalidateTag('settings')`

## How to Set Up Gmail SMTP

### Step 1: Enable 2FA on your Gmail
- Go to https://myaccount.google.com/security
- Enable **2-Step Verification**

### Step 2: Generate App Password
- Go to https://myaccount.google.com/apppasswords
- Select "Mail" and your device → Generate
- Copy the **16-character password** (e.g., `abcd efgh ijkl mnop`)

### Step 3: Enter in Admin Panel
- Admin → Settings → Email tab
- Fill in:
  - **SMTP Email:** your@gmail.com
  - **SMTP App Password:** the 16-char password (spaces are auto-stripped)
  - **SMTP From Name:** Your Store Name
  - **Admin Notification Email:** (optional) separate email for admin alerts
- Click "Test Email" to verify

## Email Toggle System (Two-Tier)

Each email type can be disabled at **two levels**:

1. **Settings level** — `settings.email_notifications.{type}` (JSONB column)
2. **Template level** — `email_templates.enabled` (boolean)

Both must be `true` for the email to send.

## All 22 Email Templates

### Customer Templates (14)
| Type | Trigger |
|------|---------|
| `welcome` | On user registration |
| `password_reset` | On forgot password request |
| `password_changed` | After password reset |
| `order_placed` | On checkout success |
| `order_confirmed` | Admin marks order as confirmed |
| `order_processing` | Admin marks order as processing |
| `order_shipped` | Admin marks order as shipped |
| `order_out_for_delivery` | Admin marks out for delivery |
| `order_delivered` | Admin marks delivered |
| `order_cancelled` | Admin marks cancelled |
| `order_refunded` | Admin marks refunded |
| `review_request` | Cron: 3 days after delivery |
| `abandoned_cart` | Cron: cart idle > 5 min |
| `postex_shipped` | PostEx integration |

### Admin Templates (8)
| Type | Trigger |
|------|---------|
| `admin_new_order` | On new order placed |
| `admin_order_cancelled` | On order cancelled |
| `admin_low_stock` | Stock below threshold |
| `admin_new_customer` | On new registration |
| `admin_new_review` | On new review submitted |
| `admin_contact_form` | On contact form submission |
| `admin_abandoned_cart` | On cart abandonment detected |
| `admin_postex_shipped` | PostEx integration |

## Available Template Variables (`{{variable}}`)

```
{{brand_name}}               Settings store name
{{site_url}}                 Dynamic site URL
{{customer_name}}            Customer's name
{{customer_email}}           Customer's email
{{contact_email}}            Store contact email
{{currency}}                 Currency symbol
{{current_year}}             Current year

{{order_id}}                 Order number
{{order_date}}               Order date
{{order_total}}              Order total with currency
{{order_subtotal}}           Order subtotal
{{order_discount_fee}}       Discount amount
{{order_shipping_fee}}       Shipping fee
{{order_status}}             Order status
{{order_payment_method}}     Payment method

{{shipping_address.name}}    Customer name from address
{{shipping_address.phone}}   Phone number
{{shipping_address.street}}  Street address
{{shipping_address.city}}    City
{{shipping_address.postal_code}}  Postal code
{{shipping_address.full}}    Full address comma-separated

{{tracking_number}}          Courier tracking number
{{courier_name}}             Courier name
{{tracking_url}}             Tracking link URL
{{estimated_delivery}}       Estimated delivery date

{{reset_link}}               Password reset URL
{{admin_panel_url}}          Admin login URL
{{product_name}}             Product name (low stock)
{{product_stock}}            Stock count

{{review_rating}}            Star rating (★★★★★)
{{review_text}}              Review comment
{{review_author}}            Reviewer name

{{contact_name}}             Name from contact form
{{contact_subject}}          Subject from contact form
{{contact_message}}          Message from contact form

{{order_items_html}}         Auto-generated order items table
```

## How to Add This System to Another Project

### Step 1: Install Dependencies
```bash
npm install nodemailer @react-email/components @react-email/render
npm install -D @types/nodemailer
```

### Step 2: Copy These Files (exact copy)
```
lib/email/
├── sendEmail.ts              # Core SMTP sender
├── sendTemplatedEmail.ts     # Template dispatcher
├── triggers.ts               # All trigger functions
├── variables.ts              # Variable builder + replaceVariables()
└── defaults/
    └── getDefaultTemplate.ts # 18 built-in templates (407 lines)
```

### Step 3: Create Database Tables
```sql
-- store_settings table (add these columns to your settings table)
ALTER TABLE your_settings_table ADD COLUMN smtp_email TEXT;
ALTER TABLE your_settings_table ADD COLUMN smtp_app_password TEXT;
ALTER TABLE your_settings_table ADD COLUMN smtp_from_name TEXT;
ALTER TABLE your_settings_table ADD COLUMN admin_notification_email TEXT;
ALTER TABLE your_settings_table ADD COLUMN email_notifications JSONB DEFAULT '{}'::jsonb;

-- email_templates table
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_type TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT true,
  subject TEXT NOT NULL,
  custom_html TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Step 4: Create Email Templates Seed Data
Create 22 records (14 customer + 8 admin) in `email_templates` with appropriate default subjects and empty `custom_html` (null → uses built-in defaults).

### Step 5: Set Up Trigger Calls
In your service files, import and call triggers:
```typescript
import { onOrderPlaced, onOrderStatusChange, onUserRegister } from '@/lib/email/triggers';

// After order creation:
await onOrderPlaced(order, customer);

// On status change:
await onOrderStatusChange(order, customer, 'shipped');

// On registration:
await onUserRegister(user);
```

### Step 6: Admin UI (Optional)
Create a settings tab where admin can:
- Enter SMTP email + app password
- Toggle email notifications per type
- Send test email via `POST /api/settings/test-email`
- Edit email templates with variable picker + preview

### Step 7: Test
Use the test endpoint:
```typescript
POST /api/settings/test-email
// → sends to admin_notification_email
```

## Key Notes

1. **App Password required** — regular Gmail password won't work. Must enable 2FA and generate 16-char app password.
2. **Spaces stripped** — App password has spaces removed via `.replace(/\s+/g, '')`
3. **Never blocks** — All email failures are caught; returns `{ success, error }`, never throws
4. **Dynamic Message-ID** — Generates unique `Message-ID` from store domain to prevent spam filtering
5. **Two-tier disable** — Each template can be disabled at DB template level OR settings level
6. **Custom HTML override** — If `custom_html` is set in DB, it's used; otherwise built-in fallback renders
