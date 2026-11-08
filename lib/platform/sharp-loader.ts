/**
 * Lazy Sharp loader — the only place that references the native `sharp` module.
 *
 * The specifier is deliberately non-literal so bundlers (esbuild on Workers)
 * cannot resolve it at build time. Node runtimes load the real module; edge
 * runtimes throw and callers fall back to storing the original bytes.
 */

export type SharpModule = typeof import('sharp');

export async function loadSharp(): Promise<SharpModule | null> {
  try {
    const specifier = 'sharp';
    const mod = (await import(/* webpackIgnore: true */ /* @vite-ignore */ specifier)) as
      | { default?: SharpModule }
      | SharpModule;
    const resolved = ('default' in mod ? mod.default : mod) as SharpModule | undefined;
    return resolved || null;
  } catch {
    return null;
  }
}
