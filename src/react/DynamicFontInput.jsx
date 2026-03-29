import React, { useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { loadFonts } from '../fontLoader.js';
import { assignFonts, getFontNames, buildHTML } from '../core.js';
import { getCaretOffset, setCaretOffset } from '../utils.js';
import { DEFAULT_FONTS } from '../fonts.js';

/**
 * Contenteditable input that assigns a random handwritten font to each
 * character as the user types. Fonts are stable — re-renders don't
 * re-randomize existing characters.
 *
 * @param {object}        props
 * @param {string}        [props.defaultValue='']
 * @param {function}      [props.onChange]          Called with (plainText) on every edit.
 * @param {string[]}      [props.fonts]             Font list; defaults to DEFAULT_FONTS.
 * @param {boolean}       [props.multiline]         Allow newlines (default false).
 * @param {string}        [props.placeholder]
 * @param {RegExp|string} [props.excludePattern]    Text matching this pattern gets one
 *                                                  shared font instead of per-character
 *                                                  random fonts (e.g. /\{\{.*?\}\}/g).
 * @param {string}        [props.className]
 * @param {object}        [props.style]
 */
export function DynamicFontInput({
  defaultValue = '',
  onChange,
  fonts = DEFAULT_FONTS,
  multiline = false,
  placeholder = '',
  excludePattern = null,
  className,
  style,
}) {
  const editorRef = useRef(null);
  // charFonts is kept in a ref so changes don't trigger re-renders
  const fontNamesRef = useRef(getFontNames(fonts));
  const charFontsRef = useRef(null);
  if (charFontsRef.current === null) {
    charFontsRef.current = assignFonts(defaultValue, fontNamesRef.current, { excludePattern });
  }
  const textRef = useRef(defaultValue);
  const composingRef = useRef(false);

  // Load fonts and keep the names ref in sync whenever the font list changes
  useEffect(() => {
    fontNamesRef.current = getFontNames(fonts);
    loadFonts(fonts);
  }, [fonts]); // eslint-disable-line react-hooks/exhaustive-deps

  // Set initial innerHTML without triggering a React re-render
  useLayoutEffect(() => {
    if (editorRef.current && defaultValue) {
      editorRef.current.innerHTML = buildHTML(defaultValue, charFontsRef.current);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const excludePatternRef = useRef(excludePattern);
  excludePatternRef.current = excludePattern;

  const handleInput = useCallback(() => {
    if (composingRef.current) return; // wait for IME composition end
    const el = editorRef.current;
    if (!el) return;

    const caretPos = getCaretOffset(el);
    // Strip trailing \n browsers add to contenteditable
    const newText = el.innerText.replace(/\n$/, '');
    const oldText = textRef.current;

    charFontsRef.current = assignFonts(newText, fontNamesRef.current, {
      oldText,
      oldCharFonts: charFontsRef.current,
      excludePattern: excludePatternRef.current,
    });
    textRef.current = newText;

    // Rebuild spans then restore caret — all synchronous, no flicker
    el.innerHTML = buildHTML(newText, charFontsRef.current);
    setCaretOffset(el, caretPos);

    onChange?.(newText);
  }, [onChange]);

  const handleKeyDown = useCallback(
    (e) => {
      if (!multiline && e.key === 'Enter') e.preventDefault();
    },
    [multiline]
  );

  return (
    <div
      ref={editorRef}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onCompositionStart={() => { composingRef.current = true; }}
      onCompositionEnd={() => { composingRef.current = false; handleInput(); }}
      className={className}
      style={{
        outline: 'none',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        minHeight: '1.5em',
        ...style,
      }}
    />
  );
}
