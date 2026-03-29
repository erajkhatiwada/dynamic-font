/**
 * After fonts have been assigned per-character, re-scan the text for
 * excludePattern matches and unify every character in each match to a
 * single font (the font already assigned to the first character of the
 * match). This makes the whole token visually consistent and easy to
 * find-and-replace later.
 *
 * Mutates charFonts in place.
 *
 * @param {string}        text
 * @param {string[]}      charFonts   parallel array, one entry per char
 * @param {RegExp|string} pattern
 */
export function applyExcludePattern(text, charFonts, pattern) {
  if (!pattern) return;
  const re = pattern instanceof RegExp
    ? new RegExp(pattern.source, 'g')
    : new RegExp(pattern, 'g');
  let match;
  while ((match = re.exec(text)) !== null) {
    const start = match.index;
    const end = start + match[0].length;
    const font = charFonts[start];
    for (let i = start + 1; i < end; i++) {
      charFonts[i] = font;
    }
  }
}

/** Pick a random item from an array. */
export function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Normalize a mixed font array to plain font-family name strings.
 * Accepts strings and { name, url? } objects (see fontLoader).
 */
export function getFontNames(fonts) {
  return fonts.map((f) => (typeof f === 'string' ? f : f.name));
}

/**
 * Given old and new text, find the single contiguous edit region.
 * Returns { start, deleted, inserted } character counts.
 * Works for typing, deletion, paste, cut.
 */
export function computeEdit(oldText, newText) {
  let start = 0;
  const minLen = Math.min(oldText.length, newText.length);

  while (start < minLen && oldText[start] === newText[start]) start++;

  let oldEnd = oldText.length;
  let newEnd = newText.length;

  while (
    oldEnd > start &&
    newEnd > start &&
    oldText[oldEnd - 1] === newText[newEnd - 1]
  ) {
    oldEnd--;
    newEnd--;
  }

  return {
    start,
    deleted: oldEnd - start,
    inserted: newEnd - start,
  };
}

/**
 * Build innerHTML from plain text + parallel charFonts array.
 * Newlines become <br> so multiline contenteditable works correctly.
 */
export function buildHTML(text, charFonts) {
  let html = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '\n') {
      html += '<br>';
      continue;
    }
    const font = charFonts[i] || 'inherit';
    const escaped =
      char === '&' ? '&amp;' : char === '<' ? '&lt;' : char === '>' ? '&gt;' : char;
    html += `<span style="font-family:'${font}'">${escaped}</span>`;
  }
  return html;
}

/**
 * Returns the character offset of the end of the current selection
 * inside a contenteditable element, counting <br> as one character.
 */
export function getCaretOffset(el) {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return 0;

  const range = sel.getRangeAt(0);
  const preRange = document.createRange();
  preRange.selectNodeContents(el);
  preRange.setEnd(range.endContainer, range.endOffset);

  const frag = preRange.cloneContents();
  return countChars(frag);
}

function countChars(node) {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent.length;
  if (node.nodeName === 'BR') return 1;
  let count = 0;
  for (const child of node.childNodes) count += countChars(child);
  return count;
}

/**
 * Moves the caret to a given character offset inside a contenteditable,
 * treating <br> as one character.
 */
export function setCaretOffset(el, targetOffset) {
  const range = document.createRange();
  const sel = window.getSelection();
  let current = 0;
  let placed = false;

  const walk = (node) => {
    if (placed) return;

    if (node.nodeType === Node.TEXT_NODE) {
      const len = node.textContent.length;
      if (current + len >= targetOffset) {
        range.setStart(node, targetOffset - current);
        range.collapse(true);
        placed = true;
      } else {
        current += len;
      }
      return;
    }

    if (node.nodeName === 'BR') {
      if (current + 1 >= targetOffset) {
        // Place cursor right after the <br>
        const parent = node.parentNode;
        const idx = Array.from(parent.childNodes).indexOf(node);
        range.setStart(parent, idx + 1);
        range.collapse(true);
        placed = true;
      } else {
        current += 1;
      }
      return;
    }

    for (const child of node.childNodes) {
      walk(child);
      if (placed) return;
    }
  };

  walk(el);

  if (!placed) {
    range.selectNodeContents(el);
    range.collapse(false);
  }

  sel.removeAllRanges();
  sel.addRange(range);
}
