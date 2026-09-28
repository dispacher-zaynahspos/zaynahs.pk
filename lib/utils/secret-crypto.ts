import crypto from 'crypto';

/**
 * SERVER-ONLY symmetric encryption for at-rest secrets (SMTP password, courier
 * tokens, AI provider keys) stored in `store_settings` / `ai_settings`.
 *
 * Design goals (why it is safe for the 4 live stores):
 *  - **Backward compatible**: legacy plaintext values are returned as-is by
 *    `decryptSecret` (they are only encrypted the next time they are saved).
 *    So enabling this changes NOTHING for existing rows until a re-save.
 *  - **Stable key**: derived from `SETTINGS_ENCRYPTION_KEY` if set, else falls
 *    back to `SUPABASE_SERVICE_ROLE_KEY` (which every store already has and does
 *    not normally rotate). This mirrors the existing `customer-auth.ts` pattern.
 *  - **Fail-open on read**: if decryption ever fails, the raw stored value is
 *    returned and the error logged, rather than throwing and taking down email/
 *    courier/AI. Encryption failures fall back to storing plaintext.
 *
 * AES-256-GCM. Envelope: `enc:v1:` + base64( iv[12] | authTag[16] | ciphertext ).
 *
 * Never import this from a `'use client'` component.
 */

const ENC_PREFIX = 'enc:v1:';
const IV_LEN = 12;
const TAG_LEN = 16;

let cachedKey: Buffer | null = null;

function getKey(): Buffer {
  if (cachedKey) return cachedKey;
  const raw =
    process.env.SETTINGS_ENCRYPTION_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.CUSTOMER_AUTH_SECRET ||
    '';
  if (!raw) {
    // No key material available. Encryption becomes a no-op (values stay plain),
    // which is still functional. Logged once for visibility.
    console.warn('[secret-crypto] No SETTINGS_ENCRYPTION_KEY / service role key found — secrets stored in plaintext.');
  }
  cachedKey = crypto.createHash('sha256').update(String(raw)).digest();
  return cachedKey;
}

function hasKeyMaterial(): boolean {
  return !!(
    process.env.SETTINGS_ENCRYPTION_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.CUSTOMER_AUTH_SECRET
  );
}

/** True if the value is an encrypted envelope produced by this module. */
export function isEncrypted(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith(ENC_PREFIX);
}

/**
 * Encrypt a plaintext string secret. Empty/undefined → returned unchanged.
 * Already-encrypted values are returned as-is (idempotent).
 * If no key material or on failure, returns the plaintext (never throws).
 */
export function encryptSecret(plain: string | null | undefined): string {
  if (plain === null || plain === undefined || plain === '') return plain ?? '';
  if (isEncrypted(plain)) return plain;
  if (!hasKeyMaterial()) return plain;
  try {
    const iv = crypto.randomBytes(IV_LEN);
    const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv);
    const enc = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return ENC_PREFIX + Buffer.concat([iv, tag, enc]).toString('base64');
  } catch (e) {
    console.error('[secret-crypto] encrypt failed — storing plaintext fallback', e);
    return plain;
  }
}

/**
 * Decrypt an encrypted envelope. Legacy plaintext (no envelope) is returned
 * unchanged. On failure, the raw value is returned (fail-open) and logged.
 */
export function decryptSecret(value: string | null | undefined): string {
  if (value === null || value === undefined || value === '') return value ?? '';
  if (!isEncrypted(value)) return value; // legacy plaintext
  try {
    const buf = Buffer.from(value.slice(ENC_PREFIX.length), 'base64');
    const iv = buf.subarray(0, IV_LEN);
    const tag = buf.subarray(IV_LEN, IV_LEN + TAG_LEN);
    const data = buf.subarray(IV_LEN + TAG_LEN);
    const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
  } catch (e) {
    console.error('[secret-crypto] decrypt failed — returning raw value', e);
    return value;
  }
}

/**
 * Encrypt a JSON-serializable object (e.g. `ai_model_credentials`). Returns an
 * encrypted string suitable for storage in a JSONB column (stored as a JSON
 * string). Empty objects are returned unchanged so nothing is written.
 */
export function encryptSecretObject(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return encryptSecret(obj);
  if (typeof obj === 'object' && Object.keys(obj as object).length === 0) return obj;
  try {
    return encryptSecret(JSON.stringify(obj));
  } catch (e) {
    console.error('[secret-crypto] encryptSecretObject failed', e);
    return obj;
  }
}

/**
 * Decrypt a value that may be an encrypted JSON object, a plain JSON string, or
 * an already-parsed object. Always returns a parsed object ({} on failure).
 */
export function decryptSecretObject<T = Record<string, unknown>>(value: unknown): T {
  if (value === null || value === undefined) return {} as T;
  if (typeof value === 'object') return value as T;
  if (typeof value === 'string') {
    const raw = isEncrypted(value) ? decryptSecret(value) : value;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return {} as T;
    }
  }
  return {} as T;
}
