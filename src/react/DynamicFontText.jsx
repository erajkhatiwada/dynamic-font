import React, { useRef, useEffect } from 'react';
import { loadFonts } from '../fontLoader.js';
import { assignFonts, getFontNames, buildHTML } from '../core.js';
import { DEFAULT_FONTS } from '../fonts.js';

/**
 * Read-only display component. Renders text with a random handwritten font
 * per character. Font assignments are stable across re-renders — only
 * newly added characters at the end get a new font.
 *
 * @param {object}        props
 * @param {string}        props.text
 * @param {string[]}      [props.fonts]
 * @param {RegExp|string} [props.excludePattern]  Text matching this pattern gets one
 *                                                shared font instead of per-character
 *                                                random fonts (e.g. /\{\{.*?\}\}/g).
 * @param {string}        [props.className]
 * @param {object}        [props.style]
 */
export function DynamicFontText({ text = '', fonts = DEFAULT_FONTS, excludePattern = null, className, style }) {
  const fontMapRef = useRef([]);
  const textRef = useRef('');

  useEffect(() => {
    loadFonts(fonts);
  }, [fonts]); // eslint-disable-line react-hooks/exhaustive-deps

  const fontNames = getFontNames(fonts);

  // Incrementally update font assignments, preserving stable positions
  const charFonts = assignFonts(text, fontNames, {
    oldText: textRef.current,
    oldCharFonts: fontMapRef.current,
    excludePattern,
  });
  fontMapRef.current = charFonts;
  textRef.current = text;

  return (
    <span
      className={className}
      style={{ whiteSpace: 'pre-wrap', ...style }}
      dangerouslySetInnerHTML={{ __html: buildHTML(text, charFonts) }}
    />
  );
}
