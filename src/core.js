import { randomItem, computeEdit, applyExcludePattern } from './utils.js';

export { getFontNames, buildHTML, applyExcludePattern } from './utils.js';
export { HANDWRITTEN_FONTS, DEFAULT_FONTS } from './fonts.js';
export { loadFonts } from './fontLoader.js';

/**
 * Pure function — no DOM, no React. Computes the updated per-character font
 * array after a text change, preserving existing assignments for unchanged
 * characters and picking random fonts for newly inserted ones.
 *
 * This is the engine used internally by DynamicFont, DynamicFontInput,
 * DynamicFontText, and useDynamicFont. Use it directly when integrating into
 * editors that own their own DOM (Slate.js, ProseMirror, Lexical, craft.js).
 *
 * @param {string}        newText               The full new text value
 * @param {string[]}      fontNames             Plain font-family name strings
 * @param {object}        [opts]
 * @param {string}        [opts.oldText='']     Previous text value
 * @param {string[]}      [opts.oldCharFonts=[]] Previous charFonts array
 * @param {RegExp|string} [opts.excludePattern=null]
 *   Text matching this pattern gets one shared font across the whole match
 *   instead of a random font per character (e.g. /\{\{.*?\}\}/g).
 * @returns {string[]} charFonts — one font-family name per character in newText
 *
 * @example
 * // Initial assignment
 * const fonts = assignFonts('Hello', ['Caveat', 'Kalam']);
 *
 * // Incremental update — existing characters keep their font
 * const next = assignFonts('Hello!', ['Caveat', 'Kalam'], {
 *   oldText: 'Hello',
 *   oldCharFonts: fonts,
 * });
 *
 * // With excludePattern — {{name}} gets one font across all its characters
 * const withPattern = assignFonts('Hi {{name}}', fontNames, {
 *   excludePattern: /\{\{.*?\}\}/g,
 * });
 */
export function assignFonts(newText, fontNames, { oldText = '', oldCharFonts = [], excludePattern = null } = {}) {
  const edit = computeEdit(oldText, newText);
  const charFonts = [...oldCharFonts];
  charFonts.splice(edit.start, edit.deleted);
  const inserted = Array.from({ length: edit.inserted }, () => randomItem(fontNames));
  charFonts.splice(edit.start, 0, ...inserted);
  applyExcludePattern(newText, charFonts, excludePattern);
  return charFonts;
}
