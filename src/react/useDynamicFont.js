import { useRef, useCallback, useEffect } from 'react';
import { assignFonts, getFontNames, buildHTML } from '../core.js';
import { loadFonts } from '../fontLoader.js';

/**
 * Low-level React hook for integrating dynamic-font into any React-based
 * editor — craft.js, Slate.js, Lexical, a plain <textarea>, etc.
 *
 * The hook owns the font-assignment state and exposes two functions:
 *   - `update(newText)` — call whenever text changes; returns the new charFonts array
 *   - `getHTML(text?)` — returns the innerHTML string with per-character font spans
 *
 * Font assignments are stable: existing characters keep their font across
 * calls; only newly inserted characters get a new random font.
 *
 * @param {import('../fonts.js').FontEntry[]} fonts
 * @param {object}        [opts]
 * @param {RegExp|string} [opts.excludePattern]
 *   Text matching this pattern gets one shared font per match instead of
 *   per-character random fonts (e.g. /\{\{.*?\}\}/g for template variables).
 *
 * @returns {{ update: Function, getHTML: Function, charFonts: string[] }}
 *
 * @example — craft.js Text node
 * function CraftText({ fonts, text }) {
 *   const { connectors: { connect } } = useNode();
 *   const { update, getHTML } = useDynamicFont(fonts);
 *
 *   useEffect(() => { update(text); }, [text]);
 *
 *   return (
 *     <span
 *       ref={connect}
 *       dangerouslySetInnerHTML={{ __html: getHTML(text) }}
 *     />
 *   );
 * }
 *
 * @example — Slate.js Leaf renderer
 * function Leaf({ attributes, children, leaf }) {
 *   const { update, charFonts } = useDynamicFont(fonts);
 *   const font = charFonts[leaf.offset] ?? 'inherit';
 *   return <span {...attributes} style={{ fontFamily: font }}>{children}</span>;
 * }
 */
export function useDynamicFont(fonts, { excludePattern = null } = {}) {
  const fontNamesRef = useRef(getFontNames(fonts));
  const charFontsRef = useRef([]);
  const textRef = useRef('');
  const excludePatternRef = useRef(excludePattern);
  excludePatternRef.current = excludePattern;

  useEffect(() => {
    fontNamesRef.current = getFontNames(fonts);
    loadFonts(fonts);
  }, [fonts]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Call with the new full text value after every edit.
   * Returns the updated charFonts array (one font name per character).
   */
  const update = useCallback((newText) => {
    const charFonts = assignFonts(newText, fontNamesRef.current, {
      oldText: textRef.current,
      oldCharFonts: charFontsRef.current,
      excludePattern: excludePatternRef.current,
    });
    charFontsRef.current = charFonts;
    textRef.current = newText;
    return charFonts;
  }, []);

  /**
   * Returns an innerHTML string with each character wrapped in a
   * `<span style="font-family:'...'">` using the current charFonts state.
   * Optionally pass `text` if you want to render a different string than
   * what was last passed to `update()`.
   */
  const getHTML = useCallback((text) => {
    return buildHTML(text ?? textRef.current, charFontsRef.current);
  }, []);

  return {
    update,
    getHTML,
    /** Current charFonts array — one font-family name per character. */
    charFonts: charFontsRef.current,
  };
}
