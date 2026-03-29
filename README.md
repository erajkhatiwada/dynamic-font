# dynamic-font

Assigns a random handwritten font to each character as the user types, creating a realistic mixed-handwriting effect. Works with React components, any vanilla-JS framework, and can be integrated into third-party editors (craft.js, Slate.js, TipTap, Lexical, etc.) via the core engine.

```
H  e  l  l  o  !
↑  ↑  ↑  ↑  ↑  ↑
Caveat  Kalam  Dancing Script  Satisfy  Indie Flower  Patrick Hand
```

---

## How it works

Every time a new character is typed, a random font is picked from your active list and pinned to that character position. The assignment is **stable** — existing characters keep their font across re-renders. Only newly typed characters get a new random font.

---

## Installation

```bash
npm install dynamic-font
```

Google Fonts are loaded automatically at runtime — no manual `<link>` tags needed.

---

## Quick start

### React

```jsx
import { DynamicFontInput } from 'dynamic-font/react';

function App() {
  return (
    <DynamicFontInput
      multiline
      placeholder="Start writing…"
      onChange={(text) => console.log(text)}
      style={{ fontSize: 28, lineHeight: 1.6 }}
    />
  );
}
```

### Vanilla JS (AngularJS, Vue, plain HTML)

```js
import { DynamicFont } from 'dynamic-font';

const df = new DynamicFont('#my-container', {
  multiline: true,
  placeholder: 'Start writing…',
  onChange: (text) => console.log(text),
});
```

---

## React API

### `<DynamicFontInput>`

An editable field where each typed character gets a random handwritten font.

```jsx
import { DynamicFontInput } from 'dynamic-font/react';

<DynamicFontInput
  defaultValue=""
  fonts={['Caveat', 'Kalam', 'Dancing Script']}
  multiline={false}
  placeholder="Start writing…"
  excludePattern={/\{\{.*?\}\}/g}
  onChange={(text) => setValue(text)}
  className="my-input"
  style={{ fontSize: 24 }}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultValue` | `string` | `''` | Initial text content |
| `fonts` | `FontEntry[]` | `DEFAULT_FONTS` | Font list to randomize from — see [Font formats](#font-formats) |
| `multiline` | `boolean` | `false` | Allow newlines (Enter key) |
| `placeholder` | `string` | `''` | Placeholder text shown when empty |
| `excludePattern` | `RegExp \| string` | `null` | Text matching this pattern gets one shared font per match instead of per-character random fonts — see [excludePattern](#excludepattern) |
| `onChange` | `(text: string) => void` | — | Called with plain text on every edit |
| `className` | `string` | — | CSS class on the root element |
| `style` | `object` | — | Inline styles merged onto the root element |

> **Note:** The component is uncontrolled internally (backed by a `contenteditable` div). Use `defaultValue` to set the initial value and `onChange` to read changes. If you need to reset the field, change its `key` prop.

---

### `<DynamicFontText>`

Read-only. Renders existing text with stable per-character font assignments.

```jsx
import { DynamicFontText } from 'dynamic-font/react';

<DynamicFontText
  text="Hello world"
  fonts={['Caveat', 'Kalam']}
  excludePattern={/\{\{.*?\}\}/g}
  style={{ fontSize: 32 }}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | `''` | Text to display |
| `fonts` | `FontEntry[]` | `DEFAULT_FONTS` | Font list to randomize from |
| `excludePattern` | `RegExp \| string` | `null` | Same as `DynamicFontInput` |
| `className` | `string` | — | CSS class |
| `style` | `object` | — | Inline styles |

Font assignments are stable across re-renders. To re-randomize, change the `key` prop.

---

### `useDynamicFont` hook

Low-level React hook for integrating dynamic-font into **any React-based editor** — craft.js, Slate.js, Lexical, a plain `<textarea>`, etc. The hook owns the font-assignment state and returns two functions you call yourself.

```js
import { useDynamicFont } from 'dynamic-font/react';

const { update, getHTML, charFonts } = useDynamicFont(fonts, { excludePattern });
```

**Returns**

| Key | Type | Description |
|-----|------|-------------|
| `update(newText)` | `(string) => string[]` | Call whenever text changes. Returns the new `charFonts` array. |
| `getHTML(text?)` | `(string?) => string` | Returns an innerHTML string with per-character `<span>` font wrappers. Uses the last text passed to `update()` if no argument given. |
| `charFonts` | `string[]` | Current font array — one font-family name per character. |

**Parameters**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `fonts` | `FontEntry[]` | — | Font list |
| `opts.excludePattern` | `RegExp \| string` | `null` | Same as the component prop |

---

## Vanilla JS API

### `new DynamicFont(container, options)`

Mounts a `contenteditable` editor inside `container`.

```js
import { DynamicFont } from 'dynamic-font';

const df = new DynamicFont('#my-container', {
  fonts: ['Caveat', 'Kalam', 'Dancing Script'],
  defaultValue: '',
  multiline: true,
  placeholder: 'Start writing…',
  excludePattern: /\{\{.*?\}\}/g,
  onChange: (text) => console.log(text),
});
```

**Options**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `fonts` | `FontEntry[]` | `DEFAULT_FONTS` | Font list — see [Font formats](#font-formats) |
| `defaultValue` | `string` | `''` | Initial text |
| `multiline` | `boolean` | `true` | Allow newlines |
| `placeholder` | `string` | `''` | Placeholder text |
| `excludePattern` | `RegExp \| string` | `null` | Same as the component prop |
| `onChange` | `(text: string) => void` | — | Called on every edit |

**Methods**

```js
df.getText()          // → current plain-text string
df.setText('Hello')   // programmatically update text
df.setFonts([...])    // swap the active font list
df.destroy()          // remove editor from DOM and clean up listeners
```

---

## Core engine API

For integrating into editors that own their own rendering pipeline (AST-based editors, custom components, SSR).

```js
import { assignFonts, buildHTML, getFontNames } from 'dynamic-font/core';
```

### `assignFonts(newText, fontNames, opts?)`

Pure function — no DOM, no React. Computes the updated per-character font array after a text change.

```js
import { assignFonts } from 'dynamic-font/core';

// Initial assignment
const charFonts = assignFonts('Hello', ['Caveat', 'Kalam']);
// → ['Caveat', 'Kalam', 'Caveat', 'Caveat', 'Kalam']

// Incremental update — existing characters keep their font
const next = assignFonts('Hello!', ['Caveat', 'Kalam'], {
  oldText: 'Hello',
  oldCharFonts: charFonts,
});
// → ['Caveat', 'Kalam', 'Caveat', 'Caveat', 'Kalam', 'Caveat']  (only last char is new)

// With excludePattern — entire {{name}} token gets one font
const withVars = assignFonts('Hi {{name}}', fontNames, {
  excludePattern: /\{\{.*?\}\}/g,
});
```

| Param | Type | Description |
|-------|------|-------------|
| `newText` | `string` | The full new text |
| `fontNames` | `string[]` | Plain font-family name strings (use `getFontNames(fonts)` to convert a mixed font array) |
| `opts.oldText` | `string` | Previous text value (default `''`) |
| `opts.oldCharFonts` | `string[]` | Previous charFonts array (default `[]`) |
| `opts.excludePattern` | `RegExp \| string` | Pattern for unified-font tokens (default `null`) |

### `buildHTML(text, charFonts)`

Converts a text string + charFonts array into an innerHTML string of `<span style="font-family:'...'">` elements. Newlines become `<br>`.

```js
import { buildHTML } from 'dynamic-font/core';

el.innerHTML = buildHTML('Hi', ['Caveat', 'Kalam']);
// → <span style="font-family:'Caveat'">H</span><span style="font-family:'Kalam'">i</span>
```

### `getFontNames(fonts)`

Normalizes a mixed font array (strings and `{ name, url? }` objects) to plain name strings.

```js
import { getFontNames } from 'dynamic-font/core';

getFontNames(['Caveat', { name: 'MyFont', url: '...' }]);
// → ['Caveat', 'MyFont']
```

---

## `excludePattern`

When set, any text matching the pattern is treated as an atomic token: all characters in the match share a single randomly-assigned font instead of getting one each. The font is stable across re-renders — only re-randomized if the token itself changes.

**Primary use case — template variables:** if your text contains `{{firstName}}` placeholders that will later be substituted, enabling `excludePattern` makes each `{{…}}` token visually uniform, making it easy to scan and find-and-replace.

```jsx
// All characters inside {{ }} share one font
<DynamicFontInput excludePattern={/\{\{.*?\}\}/g} />

// Custom pattern — wrap anything in [brackets]
<DynamicFontInput excludePattern={/\[.*?\]/g} />
```

The pattern is applied after every keystroke. When you toggle it on for existing text, it takes effect on the next keystroke (for the input) or immediately (for `DynamicFontText` and `useDynamicFont`).

---

## Integration guide

### craft.js

craft.js components are plain React components. Replace their Text node with one that uses `DynamicFontInput` directly, or use `useDynamicFont` for read-only rendering inside an existing node.

#### Option A — Replace the Text component

```jsx
import { useNode } from '@craftjs/core';
import { DynamicFontInput } from 'dynamic-font/react';

export function CraftDynamicText({ fonts, excludePattern, fontSize, text }) {
  const { connectors: { connect, drag }, actions: { setProp } } = useNode();

  return (
    <div ref={(ref) => connect(drag(ref))}>
      <DynamicFontInput
        defaultValue={text}
        fonts={fonts}
        excludePattern={excludePattern}
        multiline
        onChange={(newText) => setProp((props) => { props.text = newText; })}
        style={{ fontSize }}
      />
    </div>
  );
}

CraftDynamicText.craft = {
  props: { text: '', fontSize: 24, fonts: DEFAULT_FONTS, excludePattern: null },
  displayName: 'Dynamic Text',
};
```

#### Option B — Read-only display inside a craft.js node

```jsx
import { useNode } from '@craftjs/core';
import { useDynamicFont } from 'dynamic-font/react';
import { loadFonts } from 'dynamic-font/core';

export function CraftDynamicDisplay({ text, fonts }) {
  const { connectors: { connect } } = useNode();
  const { update, getHTML } = useDynamicFont(fonts);

  // Re-compute font assignments whenever text or fonts change
  update(text);

  return (
    <span
      ref={connect}
      dangerouslySetInnerHTML={{ __html: getHTML(text) }}
    />
  );
}
```

---

### Slate.js

Slate uses a virtual document tree and renders characters through its own `Leaf` component. Use `assignFonts` from the core to build a per-character font map, then read it in the leaf renderer.

```jsx
import { useState, useCallback, useMemo } from 'react';
import { createEditor, Text } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { assignFonts, getFontNames, loadFonts } from 'dynamic-font/core';
import { DEFAULT_FONTS } from 'dynamic-font/core';

const fontNames = getFontNames(DEFAULT_FONTS);
loadFonts(DEFAULT_FONTS);

export function SlateHandwriting() {
  const editor = useMemo(() => withReact(createEditor()), []);
  const [charFonts, setCharFonts] = useState([]);
  const [prevText, setPrevText] = useState('');

  const handleChange = useCallback((value) => {
    const text = value.flatMap((n) => n.children.map((c) => c.text)).join('\n');
    const next = assignFonts(text, fontNames, { oldText: prevText, oldCharFonts: charFonts });
    setCharFonts(next);
    setPrevText(text);
  }, [charFonts, prevText]);

  // Decorate each text leaf with its character offset so the Leaf knows which font to use
  const decorate = useCallback(([node, path]) => {
    if (!Text.isText(node)) return [];
    // Build ranges — one per character with a `fontOffset` value
    return node.text.split('').map((_, i) => ({
      anchor: { path, offset: i },
      focus: { path, offset: i + 1 },
      fontOffset: i,
    }));
  }, []);

  const renderLeaf = useCallback(({ attributes, children, leaf }) => {
    const font = charFonts[leaf.fontOffset] ?? 'inherit';
    return <span {...attributes} style={{ fontFamily: `'${font}'` }}>{children}</span>;
  }, [charFonts]);

  return (
    <Slate editor={editor} initialValue={[{ children: [{ text: '' }] }]} onChange={handleChange}>
      <Editable decorate={decorate} renderLeaf={renderLeaf} />
    </Slate>
  );
}
```

> **Note:** The `decorate` approach assigns fonts by character index within each leaf. For multi-node documents, accumulate the offset across nodes when building the font map.

---

### TipTap / ProseMirror

TipTap uses ProseMirror under the hood. The cleanest integration is a custom `Mark` that stores a font name, combined with an input rule or transaction plugin that assigns fonts on every change.

```js
import { Mark } from '@tiptap/core';
import { assignFonts, getFontNames } from 'dynamic-font/core';
import { DEFAULT_FONTS } from 'dynamic-font/core';

const fontNames = getFontNames(DEFAULT_FONTS);

// 1. Define a mark that applies a font-family
export const DynamicFontMark = Mark.create({
  name: 'dynamicFont',
  addAttributes() {
    return { fontFamily: { default: null, renderHTML: (a) => ({ style: `font-family:'${a.fontFamily}'` }) } };
  },
  parseHTML() { return [{ tag: 'span[style*=font-family]' }]; },
  renderHTML({ HTMLAttributes }) { return ['span', HTMLAttributes, 0]; },
});

// 2. Plugin: after every transaction, re-assign fonts and apply marks
import { Plugin } from 'prosemirror-state';

export function dynamicFontPlugin() {
  let charFonts = [];
  let prevText = '';

  return new Plugin({
    appendTransaction(transactions, _oldState, newState) {
      if (!transactions.some((tr) => tr.docChanged)) return null;

      const text = newState.doc.textContent;
      charFonts = assignFonts(text, fontNames, { oldText: prevText, oldCharFonts: charFonts });
      prevText = text;

      const tr = newState.tr;
      let pos = 1; // ProseMirror positions start at 1
      [...text].forEach((char, i) => {
        tr.addMark(pos, pos + 1, newState.schema.marks.dynamicFont.create({ fontFamily: charFonts[i] }));
        pos++;
      });
      return tr;
    },
  });
}
```

---

### Lexical

Lexical uses a custom node model. Subclass `TextNode` to store and render per-character fonts.

```js
import { TextNode } from 'lexical';
import { assignFonts, getFontNames } from 'dynamic-font/core';
import { DEFAULT_FONTS } from 'dynamic-font/core';

const fontNames = getFontNames(DEFAULT_FONTS);
let charFonts = [];
let prevText = '';

export class DynamicFontNode extends TextNode {
  static getType() { return 'dynamic-font'; }
  static clone(node) { return new DynamicFontNode(node.__text, node.__key); }

  createDOM(config) {
    const dom = super.createDOM(config);
    const text = this.__text;
    charFonts = assignFonts(text, fontNames, { oldText: prevText, oldCharFonts: charFonts });
    prevText = text;
    // Wrap each character in a span
    dom.innerHTML = [...text].map((ch, i) =>
      `<span style="font-family:'${charFonts[i]}'">${ch}</span>`
    ).join('');
    return dom;
  }
}
```

Register the node in your Lexical config:

```js
const editor = createEditor({
  nodes: [DynamicFontNode],
});
```

---

### Vue 3

```vue
<template>
  <div ref="container" />
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { DynamicFont } from 'dynamic-font';

const props = defineProps({
  fonts: Array,
  excludePattern: [RegExp, String, null],
});
const emit = defineEmits(['update:modelValue']);
const container = ref(null);
let df;

onMounted(() => {
  df = new DynamicFont(container.value, {
    fonts: props.fonts,
    excludePattern: props.excludePattern,
    multiline: true,
    onChange: (text) => emit('update:modelValue', text),
  });
});

onUnmounted(() => df?.destroy());
</script>
```

---

### AngularJS (1.x)

```js
angular.module('myApp').directive('dynamicFont', function () {
  return {
    restrict: 'E',
    template: '<div></div>',
    scope: { fonts: '=', onChange: '&', excludePattern: '=' },
    link(scope, element) {
      const df = new DynamicFont(element[0], {
        fonts: scope.fonts,
        excludePattern: scope.excludePattern,
        multiline: true,
        onChange: (text) => scope.$apply(() => scope.onChange({ text })),
      });
      scope.$on('$destroy', () => df.destroy());
    },
  };
});
```

```html
<dynamic-font fonts="vm.fonts" exclude-pattern="vm.pattern" on-change="vm.handleChange(text)">
</dynamic-font>
```

---

### Plain HTML (no bundler)

```html
<div id="editor"></div>

<script type="module">
  import { DynamicFont } from 'https://cdn.jsdelivr.net/npm/dynamic-font/dist/index.esm.js';

  new DynamicFont('#editor', {
    fonts: ['Caveat', 'Kalam', 'Dancing Script'],
    multiline: true,
    placeholder: 'Start writing…',
    onChange: (text) => console.log(text),
  });
</script>
```

---

## Font formats

The `fonts` option/prop accepts a mixed array of three entry types:

### 1. String — Google Font name

```js
fonts: ['Caveat', 'Dancing Script', 'Kalam']
```

### 2. Object with `url` — custom stylesheet

```js
fonts: [
  'Caveat',
  { name: 'MyBrandFont', url: 'https://use.typekit.net/abc1234.css' },
]
```

### 3. Object without `url` — pre-loaded font

```js
// In your CSS: @font-face { font-family: 'MyLocalFont'; src: url('/fonts/MyLocalFont.woff2'); }
fonts: ['Caveat', { name: 'MyLocalFont' }]
```

---

## Built-in font list

```js
import { DEFAULT_FONTS, HANDWRITTEN_FONTS } from 'dynamic-font/react';
// or
import { DEFAULT_FONTS, HANDWRITTEN_FONTS } from 'dynamic-font/core';
```

| Export | Contents |
|--------|----------|
| `DEFAULT_FONTS` | 7 legible, naturally mixing fonts (used when no `fonts` prop is set) |
| `HANDWRITTEN_FONTS` | All 15 curated handwritten fonts |

**Full list (`HANDWRITTEN_FONTS`):**

| Font | Style |
|------|-------|
| Caveat | Casual, natural |
| Dancing Script | Elegant cursive |
| Kalam | Informal, readable |
| Indie Flower | Bubbly, friendly |
| Patrick Hand | Clean, even |
| Shadows Into Light | Thin, airy |
| Satisfy | Flowing script |
| Sacramento | Thin calligraphy |
| Pacifico | Retro round |
| Permanent Marker | Bold marker |
| Covered By Your Grace | Casual brush |
| Reenie Beanie | Loose, casual |
| Just Me Again Down Here | Scratchy |
| Rock Salt | Rough, textured |
| Homemade Apple | Heavy decorative |

---

## Styling the editor

The `contenteditable` root div only has the minimum required styles applied (`outline: none`, `white-space: pre-wrap`). Everything else is yours to control.

```jsx
<DynamicFontInput
  style={{
    fontSize: 28,
    lineHeight: 1.7,
    color: '#1a1a1a',
    padding: '16px 20px',
    border: '2px solid #e0d8d0',
    borderRadius: 12,
    minHeight: 160,
  }}
/>
```

```css
/* Or with a className */
.handwriting-input {
  font-size: 28px;
  line-height: 1.7;
  padding: 16px 20px;
  border: 2px solid #e0d8d0;
  border-radius: 12px;
}
```

**Vanilla JS** — placeholder is rendered automatically via a CSS `::before` rule injected by the library:

```css
[data-dynamic-font]:empty::before {
  content: attr(data-placeholder);
  color: #aaa;
  pointer-events: none;
}
```

**React (`DynamicFontInput`)** — the component sets a `data-placeholder` attribute but does not inject the CSS itself. Add this rule once in your stylesheet to enable placeholder rendering:

```css
[data-placeholder]:empty::before {
  content: attr(data-placeholder);
  color: #aaa;
  pointer-events: none;
}
```

---

## Development

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Setup

```bash
git clone https://github.com/erajkhatiwada/dynamic-font.git
cd dynamic-font

# Install library dev dependencies
npm install

# Build the library (outputs to dist/)
npm run build

# Watch mode (rebuilds on every source change)
npm run dev
```

### Running the examples / landing page

```bash
cd examples
npm install
npm run dev
# → http://localhost:5173
```

This serves the landing page — an interactive showcase with a live editable hero, per-character font showcase, full feature demo, and quick start code snippets. The Vite config aliases `dynamic-font` and `dynamic-font/react` directly to `../src/`, so changes to the library source are reflected instantly without rebuilding.

### Project structure

```
dynamic-font/
├── src/
│   ├── core.js               Pure engine: assignFonts, buildHTML, getFontNames (no DOM)
│   ├── fonts.js              Built-in font lists
│   ├── fontLoader.js         Google Fonts / custom URL injector
│   ├── utils.js              computeEdit, caret helpers, applyExcludePattern
│   ├── DynamicFont.js        Vanilla JS class
│   ├── react/
│   │   ├── DynamicFontInput.jsx
│   │   ├── DynamicFontText.jsx
│   │   ├── useDynamicFont.js  Low-level hook for custom editor integrations
│   │   └── index.js
│   └── index.js              Main exports
├── dist/                     Built output
├── examples/                 Vite demo app
└── rollup.config.mjs
```

### Built output

| File | Entry point | Format | Use |
|------|-------------|--------|-----|
| `dist/core.esm.js` | `dynamic-font/core` | ESM | Bundlers — pure engine, no DOM |
| `dist/core.cjs.js` | `dynamic-font/core` | CJS | Node / require() |
| `dist/index.esm.js` | `dynamic-font` | ESM | Bundlers — vanilla JS class |
| `dist/index.cjs.js` | `dynamic-font` | CJS | Node / require() |
| `dist/react.esm.js` | `dynamic-font/react` | ESM | React — bundlers |
| `dist/react.cjs.js` | `dynamic-font/react` | CJS | React — Node / require() |

---

## Browser support

Any browser that supports:
- `contenteditable`
- `window.getSelection()` / `Range`
- ES2017+ (async/await not used; target can be lowered via your bundler's Babel config)

---

## License

MIT
