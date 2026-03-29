import { loadFonts } from './fontLoader.js';
import { assignFonts, getFontNames, buildHTML } from './core.js';
import { getCaretOffset, setCaretOffset } from './utils.js';
import { DEFAULT_FONTS } from './fonts.js';

/**
 * Vanilla-JS class. Works with any framework (AngularJS directive,
 * Vue custom element, plain HTML, etc.).
 *
 * @example
 * const df = new DynamicFont('#my-container', {
 *   fonts: ['Caveat', 'Kalam', 'Dancing Script'],
 *   multiline: true,
 *   placeholder: 'Start writing…',
 *   onChange: (text) => console.log(text),
 * });
 */
export class DynamicFont {
  constructor(container, options = {}) {
    this._el =
      typeof container === 'string' ? document.querySelector(container) : container;

    this._fonts = options.fonts || DEFAULT_FONTS;
    this._fontNames = getFontNames(this._fonts);
    this._multiline = options.multiline !== false;
    this._onChange = options.onChange || null;
    this._excludePattern = options.excludePattern || null;

    const initial = options.defaultValue || '';
    this._text = initial;
    this._charFonts = assignFonts(initial, this._fontNames, { excludePattern: this._excludePattern });

    loadFonts(this._fonts);
    this._mount();
  }

  // ─── private ────────────────────────────────────────────────────────────────

  _mount() {
    this._editor = document.createElement('div');
    this._editor.contentEditable = 'true';
    this._editor.setAttribute('data-dynamic-font', '');
    Object.assign(this._editor.style, {
      outline: 'none',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      minHeight: '1.5em',
    });

    if (this._text) {
      this._editor.innerHTML = buildHTML(this._text, this._charFonts);
    }

    this._editor.addEventListener('input', this._onInput.bind(this));
    this._editor.addEventListener('keydown', this._onKeyDown.bind(this));

    // Placeholder via CSS attr()
    if (!this._editor.closest) {
      // minimal environments
    } else {
      const style = document.createElement('style');
      style.textContent = `
        [data-dynamic-font]:empty::before {
          content: attr(data-placeholder);
          color: #aaa;
          pointer-events: none;
        }
      `;
      document.head.appendChild(style);
    }

    this._el.appendChild(this._editor);
  }

  _onInput() {
    const caretPos = getCaretOffset(this._editor);

    // innerText adds a trailing \n in many browsers; strip it.
    const newText = this._editor.innerText.replace(/\n$/, '');

    this._charFonts = assignFonts(newText, this._fontNames, {
      oldText: this._text,
      oldCharFonts: this._charFonts,
      excludePattern: this._excludePattern,
    });
    this._text = newText;

    // Rebuild DOM with styled spans then restore caret
    this._editor.innerHTML = buildHTML(newText, this._charFonts);
    setCaretOffset(this._editor, caretPos);

    this._onChange?.(newText);
  }

  _onKeyDown(e) {
    if (!this._multiline && e.key === 'Enter') e.preventDefault();
  }

  // ─── public API ─────────────────────────────────────────────────────────────

  /** Returns current plain-text value. */
  getText() {
    return this._text;
  }

  /**
   * Programmatically set the text. Existing character-font assignments are
   * preserved for unchanged positions; new characters get random fonts.
   */
  setText(text) {
    this._charFonts = assignFonts(text, this._fontNames, {
      oldText: this._text,
      oldCharFonts: this._charFonts,
      excludePattern: this._excludePattern,
    });
    this._text = text;
    this._editor.innerHTML = buildHTML(text, this._charFonts);
  }

  /** Update the active font list. New characters will use the new list. */
  setFonts(fonts) {
    this._fonts = fonts;
    this._fontNames = getFontNames(fonts);
    loadFonts(fonts);
  }

  /** Remove the editor from the DOM and clean up listeners. */
  destroy() {
    this._editor.removeEventListener('input', this._onInput.bind(this));
    this._editor.removeEventListener('keydown', this._onKeyDown.bind(this));
    this._el.removeChild(this._editor);
  }
}
