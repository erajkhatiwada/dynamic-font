const LOADED_FONTS = new Set();

/**
 * Load fonts into the document. Accepts a mixed array of:
 *   - string          → treated as a Google Font name
 *   - { name, url }   → injects `url` as a <link> stylesheet, uses `name` as font-family
 *   - { name }        → font is already loaded by the host app (nothing injected)
 *
 * Safe to call multiple times; already-loaded entries are skipped.
 */
export function loadFonts(fonts) {
  if (typeof document === 'undefined') return; // SSR guard

  const googleFontNames = [];

  for (const font of fonts) {
    if (typeof font === 'string') {
      if (!LOADED_FONTS.has(font)) {
        LOADED_FONTS.add(font);
        googleFontNames.push(font);
      }
    } else {
      // { name, url? }
      const key = font.url ?? `__pre:${font.name}`;
      if (!LOADED_FONTS.has(key)) {
        LOADED_FONTS.add(key);
        if (font.url) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = font.url;
          document.head.appendChild(link);
        }
        // No url → font is assumed pre-loaded by the host app; nothing to inject.
      }
    }
  }

  // Batch all new Google Font names into a single request
  if (googleFontNames.length) {
    const families = googleFontNames
      .map((f) => `family=${encodeURIComponent(f)}:ital,wght@0,400;1,400`)
      .join('&');
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
    document.head.appendChild(link);
  }
}
