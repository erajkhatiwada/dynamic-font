import { useState, useCallback, useRef, useEffect, createContext, useContext } from 'react';
import { DynamicFontInput, DynamicFontText, HANDWRITTEN_FONTS, DEFAULT_FONTS } from 'dynamic-font/react';
import { loadFonts } from 'dynamic-font/core';

const GITHUB_URL = 'https://github.com/erajkhatiwada/dynamic-font';
const NPM_URL = 'https://www.npmjs.com/package/dynamic-font';
const NPM_INSTALL = 'npm install dynamic-font';
const HERO_DEFAULT = 'Every letter tells its own story.';
const SHOWCASE_CHARS = ['a', 'e', 'g', 'h', 'i', 'j', 'k', 'n', 'r', 's', 't', 'y'];

// ─── Responsive hook ──────────────────────────────────────────────────────────

function useMobile(breakpoint = 768) {
  const [mobile, setMobile] = useState(() => window.innerWidth < breakpoint);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, [breakpoint]);
  return mobile;
}

// ─── Theme ────────────────────────────────────────────────────────────────────

const T = {
  light: {
    bg: '#f5f0eb', surface: '#fff', surfaceAlt: '#fdfaf7',
    text: '#1a1a1a', muted: '#888', faint: '#bbb',
    border: '#e0d8d0', borderStrong: '#c8c0b8',
    navBg: 'rgba(255,255,255,0.92)', navBorder: '#e0d8d0',
    navText: '#1a1a1a', navMuted: '#666',
    navGHbg: '#1a1a1a', navGHcolor: '#fff',
    navToggleBdr: '#e0d8d0', navToggleColor: '#888',
    heroBg: '#fff', heroInput: '#f9f6f2', heroBdr: '#e0d8d0', heroText: '#1a1a1a',
    instBg: '#f5f0eb', instBdr: '#e0d8d0', instText: '#1a1a1a', instPunct: '#aaa',
    cpBg: '#e8e0d8', cpColor: '#666', cpOkBg: '#dcf0dc', cpOkColor: '#2e7d32',
    pilOnBg: '#1a1a1a', pilOnColor: '#fff', pilOnBdr: '#1a1a1a',
    pilOffBg: 'transparent', pilOffColor: '#999', pilOffBdr: '#e0d8d0',
    pilHvColor: '#444', pilHvBdr: '#aaa',
    actBdr: '#e0d8d0', actColor: '#666', actHvBdr: '#aaa', actHvColor: '#1a1a1a',
    chOnBg: '#1a1a1a', chOnColor: '#f5f0eb', chOnBdr: '#1a1a1a',
    chOffBg: '#fff', chOffColor: '#888', chOffBdr: '#e0d8d0',
    chHvColor: '#333', chHvBdr: '#aaa',
    cardBg: '#fff', cardBdr: '#e8e0d8', cardHvBdr: '#c8c0b8',
    ghBdr: '#e0d8d0', ghColor: '#666',
    codeSn: '#f0ebe4',
    scrollColor: '#ccc', scrollHvColor: '#888',
    footBg: '#1a1a1a', footColor: '#888',
    accent: '#1a1a1a',
    verBg: '#f0ebe4', verColor: '#888', verBdr: '#e0d8d0',
    greenBg: 'rgba(22,163,74,0.09)', greenColor: '#16a34a', greenBdr: 'rgba(22,163,74,0.25)',
    amberBg: 'rgba(194,97,2,0.08)',  amberColor: '#c26102', amberBdr: 'rgba(194,97,2,0.22)',
    violetBg: 'rgba(109,40,217,0.08)', violetColor: '#6d28d9', violetBdr: 'rgba(109,40,217,0.22)',
  },
  dark: {
    bg: '#080808', surface: '#0d0d0d', surfaceAlt: '#111',
    text: '#f0ebe4', muted: '#666', faint: '#333',
    border: '#1e1e1e', borderStrong: '#2e2e2e',
    navBg: 'rgba(8,8,8,0.88)', navBorder: '#1e1e1e',
    navText: '#f0ebe4', navMuted: '#666',
    navGHbg: '#f0ebe4', navGHcolor: '#0a0a0a',
    navToggleBdr: '#242424', navToggleColor: '#555',
    heroBg: '#080808', heroInput: '#0d0d0d', heroBdr: '#1c1c1c', heroText: '#f0ebe4',
    instBg: '#0f0f0f', instBdr: '#1e1e1e', instText: '#c8c0b8', instPunct: '#3a3a3a',
    cpBg: '#1a1a1a', cpColor: '#555', cpOkBg: '#1a301a', cpOkColor: '#6db36d',
    pilOnBg: '#f0ebe4', pilOnColor: '#080808', pilOnBdr: '#f0ebe4',
    pilOffBg: 'transparent', pilOffColor: '#3a3a3a', pilOffBdr: '#242424',
    pilHvColor: '#888', pilHvBdr: '#444',
    actBdr: '#242424', actColor: '#666', actHvBdr: '#444', actHvColor: '#f0ebe4',
    chOnBg: '#f0ebe4', chOnColor: '#080808', chOnBdr: '#f0ebe4',
    chOffBg: 'transparent', chOffColor: '#555', chOffBdr: '#2e2e2e',
    chHvColor: '#ccc', chHvBdr: '#555',
    cardBg: '#111', cardBdr: '#1e1e1e', cardHvBdr: '#2e2e2e',
    ghBdr: '#242424', ghColor: '#666',
    codeSn: '#1e1e1e',
    scrollColor: '#2a2a2a', scrollHvColor: '#666',
    footBg: '#040404', footColor: '#3a3a3a',
    accent: '#f0ebe4',
    verBg: '#141414', verColor: '#555', verBdr: '#222',
    greenBg: 'rgba(52,211,153,0.08)', greenColor: '#34d399', greenBdr: 'rgba(52,211,153,0.2)',
    amberBg: 'rgba(251,191,36,0.08)', amberColor: '#fbbf24', amberBdr: 'rgba(251,191,36,0.2)',
    violetBg: 'rgba(167,139,250,0.08)', violetColor: '#a78bfa', violetBdr: 'rgba(167,139,250,0.2)',
  },
};

const ThemeCtx = createContext(T.light);
const useT = () => useContext(ThemeCtx);

// ─── Nav ──────────────────────────────────────────────────────────────────────

function Nav({ dark, onToggle }) {
  const t = useT();
  const mobile = useMobile();

  return (
    <nav
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: t.navBg,
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${t.navBorder}`,
        padding: mobile ? '0 20px' : '0 48px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}
    >
      <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.3px', color: t.navText }}>
        dynamic-font
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: mobile ? 10 : 24 }}>
        {/* Hide nav links on mobile — too cramped */}
        {!mobile && <NavLink href="#showcase">How it works</NavLink>}
        {!mobile && <NavLink href="#demo">Demo</NavLink>}
        {!mobile && <NavLink href="#quickstart">Docs</NavLink>}
        <button
          onClick={onToggle}
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            background: 'none', border: `1px solid ${t.navToggleBdr}`,
            borderRadius: 6, padding: '5px 12px', fontSize: 14,
            color: t.navToggleColor, cursor: 'pointer', transition: 'all 0.15s', lineHeight: 1,
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = t.actHvBdr; e.currentTarget.style.color = t.text; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = t.navToggleBdr; e.currentTarget.style.color = t.navToggleColor; }}
        >
          {dark ? '○ Light' : '● Dark'}
        </button>
        <a
          href={NPM_URL} target="_blank" rel="noopener noreferrer"
          style={{
            fontSize: 15, fontWeight: 600, color: t.navGHcolor, background: '#cc3534',
            textDecoration: 'none', padding: '7px 16px', borderRadius: 6, transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          npm
        </a>
        <a
          href={GITHUB_URL} target="_blank" rel="noopener noreferrer"
          style={{
            fontSize: 15, fontWeight: 600, color: t.navGHcolor, background: t.navGHbg,
            textDecoration: 'none', padding: '7px 16px', borderRadius: 6, transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          GitHub
        </a>
      </div>
    </nav>
  );
}

function NavLink({ href, children }) {
  const t = useT();
  return (
    <a
      href={href}
      style={{ fontSize: 15, color: t.navMuted, textDecoration: 'none', transition: 'color 0.15s' }}
      onMouseEnter={e => (e.currentTarget.style.color = t.text)}
      onMouseLeave={e => (e.currentTarget.style.color = t.navMuted)}
    >
      {children}
    </a>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  const t = useT();
  const mobile = useMobile();
  const [heroFonts, setHeroFonts] = useState(new Set(DEFAULT_FONTS));
  const [heroFontSize, setHeroFontSize] = useState(mobile ? 32 : 52);
  const [heroKey, setHeroKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const inputWrapRef = useRef(null);

  // Auto-focus the contenteditable and place caret at end on mount
  useEffect(() => {
    const el = inputWrapRef.current?.querySelector('[contenteditable]');
    if (!el) return;
    el.focus();
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(el);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  }, [heroKey]); // re-run when shuffled (heroKey changes remounts the input)

  const toggleFont = (font) => {
    setHeroFonts((prev) => {
      if (prev.has(font) && prev.size === 1) return prev;
      const next = new Set(prev);
      next.has(font) ? next.delete(font) : next.add(font);
      return next;
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(NPM_INSTALL).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      style={{
        background: t.heroBg,
        minHeight: '100vh',
        paddingTop: 60,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        borderBottom: `1px solid ${t.border}`,
      }}
    >
      <div style={{ padding: mobile ? '36px 20px 48px' : '56px 56px 72px', maxWidth: 1120, margin: '0 auto', width: '100%' }}>

        {/* Identity + badges */}
        <div style={{ marginBottom: mobile ? 28 : 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px', color: t.text }}>
              dynamic-font
            </span>
            <span style={{
              fontSize: 13, fontFamily: "'SF Mono','Cascadia Code',monospace",
              background: t.verBg, color: t.verColor, border: `1px solid ${t.verBdr}`,
              padding: '3px 9px', borderRadius: 4,
            }}>
              v0.1.0
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Badge bg={t.greenBg} color={t.greenColor} border={t.greenBdr}>No AI backend needed</Badge>
            <Badge bg={t.amberBg} color={t.amberColor} border={t.amberBdr}>Instant rendering</Badge>
            <Badge bg={t.violetBg} color={t.violetColor} border={t.violetBdr}>Client-side only</Badge>
          </div>
        </div>

        {/* Editable display text */}
        <div
          ref={inputWrapRef}
          style={{
            background: t.heroInput,
            border: `2px solid ${inputFocused ? t.text : t.heroBdr}`,
            borderRadius: 14, padding: mobile ? '18px 20px' : '28px 36px',
            marginBottom: 18, cursor: 'text',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            boxShadow: inputFocused
              ? `0 0 0 4px ${t.text}14`  // 14 = ~8% opacity
              : 'none',
            position: 'relative',
          }}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
        >
          {/* "click to edit" badge — fades out once focused */}
          {!inputFocused && (
            <span style={{
              position: 'absolute', top: 12, right: 14,
              fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: t.muted, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 5,
              pointerEvents: 'none',
            }}>
              <span style={{ fontSize: 13 }}>✎</span> Click to edit
            </span>
          )}
          <DynamicFontInput
            key={heroKey}
            fonts={[...heroFonts]}
            multiline
            defaultValue={HERO_DEFAULT}
            placeholder="Type something…"
            style={{ fontSize: heroFontSize, lineHeight: 1.4, color: t.heroText, width: '100%' }}
          />
        </div>

        {/* Controls row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22, flexWrap: 'wrap' }}>
          {/* Size slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 14, color: t.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Size</span>
            <input
              type="range" min={mobile ? 20 : 24} max={mobile ? 56 : 80} step={4} value={heroFontSize}
              onChange={e => setHeroFontSize(Number(e.target.value))}
              style={{ width: mobile ? 90 : 110, accentColor: t.accent, cursor: 'pointer' }}
            />
            <span style={{ fontSize: 14, color: t.muted, width: 36, fontFamily: 'monospace' }}>
              {heroFontSize}px
            </span>
          </div>

          <span style={{ width: 1, height: 16, background: t.border, flexShrink: 0 }} />
          <ActionButton onClick={() => setHeroKey(k => k + 1)}>↻ Shuffle</ActionButton>
        </div>

        {/* npm install — full width on mobile */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          flexWrap: 'wrap', marginBottom: 24,
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: t.instBg, border: `1px solid ${t.instBdr}`,
            padding: '8px 14px', borderRadius: 8,
            fontSize: 15, fontFamily: "'SF Mono','Cascadia Code','Fira Code',monospace",
            flex: mobile ? '1 1 auto' : '0 0 auto',
            minWidth: 0, overflow: 'hidden',
          }}>
            <span style={{ color: t.instPunct, flexShrink: 0 }}>$</span>
            <span style={{ color: t.instText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {NPM_INSTALL}
            </span>
            <button
              onClick={handleCopy}
              style={{
                background: copied ? t.cpOkBg : t.cpBg,
                color: copied ? t.cpOkColor : t.cpColor,
                border: 'none', borderRadius: 4, padding: '3px 9px',
                fontSize: 13, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
                flexShrink: 0,
              }}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <a
            href={NPM_URL} target="_blank" rel="noopener noreferrer"
            style={{
              fontSize: 15, color: t.actColor, textDecoration: 'none',
              padding: '8px 16px', border: `1px solid ${t.actBdr}`,
              borderRadius: 8, transition: 'all 0.15s', whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = t.actHvBdr; e.currentTarget.style.color = t.actHvColor; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = t.actBdr; e.currentTarget.style.color = t.actColor; }}
          >
            npm →
          </a>
          <a
            href={GITHUB_URL} target="_blank" rel="noopener noreferrer"
            style={{
              fontSize: 15, color: t.actColor, textDecoration: 'none',
              padding: '8px 16px', border: `1px solid ${t.actBdr}`,
              borderRadius: 8, transition: 'all 0.15s', whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = t.actHvBdr; e.currentTarget.style.color = t.actHvColor; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = t.actBdr; e.currentTarget.style.color = t.actColor; }}
          >
            GitHub →
          </a>
        </div>

        {/* Font pills */}
        <div>
          <p style={{ fontSize: 14, color: t.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12, fontWeight: 600 }}>
            Fonts — {heroFonts.size}/{HANDWRITTEN_FONTS.length} active
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {HANDWRITTEN_FONTS.map(font => {
              const on = heroFonts.has(font);
              return (
                <button
                  key={font}
                  onClick={() => toggleFont(font)}
                  style={{
                    fontFamily: `'${font}', cursive`, fontSize: 20,
                    background: on ? t.pilOnBg : t.pilOffBg,
                    color: on ? t.pilOnColor : t.pilOffColor,
                    border: `1px solid ${on ? t.pilOnBdr : t.pilOffBdr}`,
                    borderRadius: 8, padding: '6px 14px',
                    cursor: 'pointer', transition: 'all 0.15s', lineHeight: 1.3,
                  }}
                  onMouseEnter={e => { if (!on) { e.currentTarget.style.borderColor = t.pilHvBdr; e.currentTarget.style.color = t.pilHvColor; } }}
                  onMouseLeave={e => { if (!on) { e.currentTarget.style.borderColor = t.pilOffBdr; e.currentTarget.style.color = t.pilOffColor; } }}
                >
                  {font}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scroll hint */}
        <div style={{ marginTop: mobile ? 40 : 60, textAlign: 'center' }}>
          <a
            href="#showcase"
            style={{ fontSize: 15, color: t.scrollColor, textDecoration: 'none', letterSpacing: '0.05em', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = t.scrollHvColor)}
            onMouseLeave={e => (e.currentTarget.style.color = t.scrollColor)}
          >
            ↓ See how it works
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Letter Showcase ──────────────────────────────────────────────────────────

function LetterShowcase() {
  const t = useT();
  const mobile = useMobile();
  const [char, setChar] = useState('r');

  return (
    <section
      id="showcase"
      style={{
        background: t.bg,
        padding: mobile ? '56px 20px' : '80px 56px',
        borderBottom: `1px solid ${t.border}`,
        scrollMarginTop: 60,
      }}
    >
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <div style={{ marginBottom: mobile ? 28 : 44 }}>
          <SectionLabel>How it works</SectionLabel>
          <h2 style={{
            fontSize: mobile ? 28 : 43, fontWeight: 700,
            letterSpacing: '-0.8px', marginTop: 10, marginBottom: 14, color: t.text,
          }}>
            The same letter, {HANDWRITTEN_FONTS.length} different voices
          </h2>
          <p style={{ fontSize: mobile ? 16 : 18, color: t.muted, lineHeight: 1.7, maxWidth: 580 }}>
            Pick any character below. Each card shows that letter in one of the {HANDWRITTEN_FONTS.length} curated
            handwritten fonts. When you type, each character randomly picks from your active
            pool — so <em>rrr</em> or <em>aaa</em> never looks the same twice.
            No AI backend. No delay. Just fonts.
          </p>
        </div>

        {/* Character selector */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 28, flexWrap: 'wrap' }}>
          {SHOWCASE_CHARS.map(c => (
            <button
              key={c}
              onClick={() => setChar(c)}
              style={{
                fontSize: 17, fontWeight: char === c ? 700 : 400,
                background: char === c ? t.chOnBg : t.chOffBg,
                color: char === c ? t.chOnColor : t.chOffColor,
                border: `1px solid ${char === c ? t.chOnBdr : t.chOffBdr}`,
                borderRadius: 7, padding: '5px 14px', cursor: 'pointer',
                transition: 'all 0.15s', fontFamily: 'inherit',
              }}
              onMouseEnter={e => { if (char !== c) { e.currentTarget.style.borderColor = t.chHvBdr; e.currentTarget.style.color = t.chHvColor; } }}
              onMouseLeave={e => { if (char !== c) { e.currentTarget.style.borderColor = t.chOffBdr; e.currentTarget.style.color = t.chOffColor; } }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Font grid — 2 cols on mobile, 5 on desktop */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: mobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)',
          gap: mobile ? 8 : 12,
        }}>
          {HANDWRITTEN_FONTS.map(font => (
            <div
              key={font}
              style={{
                background: t.cardBg, border: `1px solid ${t.cardBdr}`,
                borderRadius: 12, padding: mobile ? '16px 12px 10px' : '20px 16px 14px', textAlign: 'center',
                transition: 'border-color 0.15s, transform 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = t.cardHvBdr; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = t.cardBdr; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <span style={{ fontFamily: `'${font}', cursive`, fontSize: mobile ? 48 : 65, display: 'block', lineHeight: 1.2, color: t.text }}>
                {char}
              </span>
              <span style={{ fontSize: mobile ? 10 : 13, color: t.faint, marginTop: 6, display: 'block', letterSpacing: '0.02em' }}>
                {font}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Demo ─────────────────────────────────────────────────────────────────────

function FontCard({ font, active, onClick }) {
  const t = useT();
  return (
    <button
      onClick={onClick}
      title={font}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2,
        padding: '10px 14px',
        background: active ? t.text : t.surface,
        color: active ? t.bg : t.text,
        border: `2px solid ${active ? t.text : t.border}`,
        borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s ease',
        minWidth: 0, textAlign: 'left',
      }}
    >
      <span style={{ fontSize: 13, opacity: 0.55, fontFamily: 'inherit', letterSpacing: '0.03em' }}>
        {font}
      </span>
      <span style={{ fontFamily: `'${font}', cursive`, fontSize: 25, lineHeight: 1.2 }}>
        Aa Bb Cc
      </span>
    </button>
  );
}

function Demo() {
  const t = useT();
  const mobile = useMobile();
  const [text, setText] = useState('');
  const [selectedFonts, setSelectedFonts] = useState(new Set(DEFAULT_FONTS));
  const [customFonts, setCustomFonts] = useState([]);
  const [customName, setCustomName] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [fontSize, setFontSize] = useState(28);
  const [editorKey, setEditorKey] = useState(0);
  const [previewKey, setPreviewKey] = useState(0);
  const [excludePatternEnabled, setExcludePatternEnabled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const latestTextRef = useRef('');

  const activeFonts = [...selectedFonts, ...customFonts];
  const excludePattern = excludePatternEnabled ? /\{\{.*?\}\}/g : null;

  const toggleFont = useCallback((font) => {
    setSelectedFonts(prev => {
      if (prev.has(font) && prev.size === 1) return prev;
      const next = new Set(prev);
      next.has(font) ? next.delete(font) : next.add(font);
      return next;
    });
  }, []);

  const handleChange = useCallback((tx) => { setText(tx); latestTextRef.current = tx; }, []);

  const handleClear = () => {
    setEditorKey(k => k + 1); setPreviewKey(k => k + 1);
    setText(''); latestTextRef.current = '';
  };

  const handleReroll = () => setPreviewKey(k => k + 1);

  const handleAddCustomFont = () => {
    const name = customName.trim();
    if (!name) return;
    const entry = customUrl.trim() ? { name, url: customUrl.trim() } : { name };
    setCustomFonts(prev => [...prev, entry]);
    setCustomName(''); setCustomUrl('');
  };

  const handleRemoveCustomFont = name => setCustomFonts(prev => prev.filter(f => f.name !== name));

  const inputSt = {
    width: '100%', padding: '8px 11px', fontSize: 15,
    border: `1px solid ${t.border}`, borderRadius: 7, outline: 'none',
    fontFamily: 'inherit', background: t.surface, color: t.text,
  };
  const ghostBt = {
    background: 'none', border: `1px solid ${t.ghBdr}`,
    borderRadius: 6, padding: '5px 11px', fontSize: 14,
    cursor: 'pointer', color: t.ghColor,
  };

  const sidebar = (
    <aside
      style={{
        padding: mobile ? '24px 20px' : '32px 24px',
        display: 'flex', flexDirection: 'column',
        gap: 32, overflowY: 'auto', background: t.bg,
        ...(mobile ? {} : { width: 320, flexShrink: 0 }),
      }}
    >
      <section>
        <DemoLabel t={t} style={{ marginBottom: 12 }}>Font size — {fontSize}px</DemoLabel>
        <input
          type="range" min={16} max={64} step={2} value={fontSize}
          onChange={e => setFontSize(Number(e.target.value))}
          style={{ width: '100%', accentColor: t.accent }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: t.faint, marginTop: 4 }}>
          <span>16</span><span>64</span>
        </div>
      </section>

      <section>
        <DemoLabel t={t} style={{ marginBottom: 12 }}>Exclude pattern</DemoLabel>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 16, color: t.muted }}>
          <input
            type="checkbox" checked={excludePatternEnabled}
            onChange={e => { setExcludePatternEnabled(e.target.checked); setPreviewKey(k => k + 1); }}
            style={{ accentColor: t.accent, width: 15, height: 15 }}
          />
          Unify font inside{' '}
          <code style={{ background: t.codeSn, color: t.text, padding: '1px 5px', borderRadius: 4 }}>
            {'{{variable}}'}
          </code>
        </label>
        <p style={{ marginTop: 8, fontSize: 14, color: t.faint, lineHeight: 1.6 }}>
          Text matching{' '}
          <code style={{ background: t.codeSn, color: t.text, padding: '1px 4px', borderRadius: 3 }}>{'{{'}</code>…
          <code style={{ background: t.codeSn, color: t.text, padding: '1px 4px', borderRadius: 3 }}>{'}}'}</code>
          {' '}gets one shared font.
        </p>
      </section>

      <section>
        <DemoLabel t={t} style={{ marginBottom: 12 }}>Custom font</DemoLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <input value={customName} onChange={e => setCustomName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddCustomFont()}
            placeholder="Font name (e.g. Lobster)" style={inputSt} />
          <input value={customUrl} onChange={e => setCustomUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddCustomFont()}
            placeholder="Stylesheet URL (optional)" style={inputSt} />
          <button onClick={handleAddCustomFont} disabled={!customName.trim()}
            style={{ ...ghostBt, opacity: customName.trim() ? 1 : 0.4, alignSelf: 'flex-start' }}>
            + Add font
          </button>
        </div>
        {customFonts.length > 0 && (
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {customFonts.map(f => (
              <div key={f.name} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, padding: '6px 10px',
              }}>
                <span style={{ fontFamily: `'${f.name}', cursive`, fontSize: 21, color: t.text }}>{f.name}</span>
                <button onClick={() => handleRemoveCustomFont(f.name)}
                  style={{ ...ghostBt, padding: '2px 7px', border: 'none' }}>×</button>
              </div>
            ))}
          </div>
        )}
        <p style={{ marginTop: 8, fontSize: 14, color: t.faint, lineHeight: 1.6 }}>
          Name only → loaded from Google Fonts.<br />
          Name + URL → your stylesheet is injected.<br />
          Pre-loaded font → provide name only, leave URL blank.
        </p>
      </section>

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <DemoLabel t={t}>Active fonts — {selectedFonts.size}/{HANDWRITTEN_FONTS.length}</DemoLabel>
          <button style={ghostBt}
            onClick={() => setSelectedFonts(
              selectedFonts.size === HANDWRITTEN_FONTS.length ? new Set(DEFAULT_FONTS) : new Set(HANDWRITTEN_FONTS)
            )}>
            {selectedFonts.size === HANDWRITTEN_FONTS.length ? 'Reset' : 'All'}
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {HANDWRITTEN_FONTS.map(font => (
            <FontCard key={font} font={font} active={selectedFonts.has(font)} onClick={() => toggleFont(font)} />
          ))}
        </div>
      </section>
    </aside>
  );

  return (
    <div style={{
      flex: 1,
      display: mobile ? 'flex' : 'grid',
      flexDirection: mobile ? 'column' : undefined,
      gridTemplateColumns: mobile ? undefined : '1fr 320px',
      gap: 0,
    }}>
      {/* Writing area */}
      <div
        style={{
          gridColumn: mobile ? undefined : 1,
          padding: mobile ? 20 : 40,
          display: 'flex', flexDirection: 'column', gap: 24,
          borderRight: mobile ? 'none' : `1px solid ${t.border}`,
          borderBottom: mobile ? `1px solid ${t.border}` : 'none',
        }}
      >
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <DemoLabel t={t}>Write something</DemoLabel>
            <div style={{ display: 'flex', gap: 8 }}>
              {mobile && (
                <button
                  onClick={() => setSidebarOpen(o => !o)}
                  style={{ ...ghostBt, fontSize: 13 }}
                >
                  {sidebarOpen ? 'Hide options ↑' : 'Options ↓'}
                </button>
              )}
              <button onClick={handleClear} style={ghostBt}>Clear</button>
            </div>
          </div>
          <div
            style={{
              background: t.surface, border: `2px solid ${t.border}`,
              borderRadius: 14, padding: mobile ? '14px 16px' : '20px 24px',
              minHeight: mobile ? 140 : 180, cursor: 'text', transition: 'border-color 0.15s',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = t.text)}
            onBlur={e => (e.currentTarget.style.borderColor = t.border)}
          >
            <DynamicFontInput
              key={editorKey} fonts={activeFonts} multiline
              placeholder="Start writing…" onChange={handleChange}
              excludePattern={excludePattern}
              style={{ fontSize, lineHeight: 1.65, width: '100%', color: t.text }}
            />
          </div>
        </section>

        {text && (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <DemoLabel t={t}>Read-only render</DemoLabel>
              <button onClick={handleReroll} style={ghostBt}>Re-roll fonts ↻</button>
            </div>
            <div style={{ background: t.surfaceAlt, border: `2px solid ${t.border}`, borderRadius: 14, padding: mobile ? '14px 16px' : '20px 24px' }}>
              <DynamicFontText
                key={previewKey} text={text} fonts={activeFonts}
                excludePattern={excludePattern}
                style={{ fontSize, lineHeight: 1.65, color: t.text }}
              />
            </div>
            <p style={{ marginTop: 8, fontSize: 14, color: t.faint }}>
              Font assignments are stable — re-renders won't re-randomize unless you click Re-roll.
            </p>
          </section>
        )}
      </div>

      {/* Sidebar — always visible on desktop, toggle on mobile */}
      {(!mobile || sidebarOpen) && sidebar}
    </div>
  );
}

// ─── Quick Start ──────────────────────────────────────────────────────────────

const REACT_SNIPPET = `import { DynamicFontInput } from 'dynamic-font/react';

function App() {
  return (
    <DynamicFontInput
      placeholder="Start writing…"
      multiline
      onChange={(text) => console.log(text)}
      style={{ fontSize: 24 }}
    />
  );
}`;

const VANILLA_SNIPPET = `import DynamicFont from 'dynamic-font';

const editor = new DynamicFont(
  document.querySelector('#editor'),
  {
    placeholder: 'Start writing…',
    multiline: true,
    onChange: (text) => console.log(text),
  }
);`;

function CodeBlock({ label, code }) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: t.muted }}>
          {label}
        </span>
        <button
          onClick={handleCopy}
          style={{ background: 'none', border: `1px solid ${t.ghBdr}`, borderRadius: 6, padding: '5px 11px', fontSize: 14, cursor: 'pointer', color: t.ghColor }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre style={{
        background: '#0d0d0d', color: '#c8c0b8',
        padding: '20px 24px', borderRadius: 12, fontSize: 15, lineHeight: 1.8,
        overflowX: 'auto', fontFamily: "'SF Mono','Cascadia Code','Fira Code',monospace",
        margin: 0, border: '1px solid #1e1e1e',
      }}>
        {code}
      </pre>
    </div>
  );
}

function QuickStart() {
  const t = useT();
  const mobile = useMobile();
  return (
    <section id="quickstart" style={{
      background: t.surface,
      padding: mobile ? '48px 20px' : '72px 56px',
      borderTop: `1px solid ${t.border}`, scrollMarginTop: 60,
    }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <SectionLabel>Quick Start</SectionLabel>
        <h2 style={{ fontSize: mobile ? 26 : 37, fontWeight: 700, letterSpacing: '-0.6px', marginTop: 10, marginBottom: 8, color: t.text }}>
          Drop it in your project
        </h2>
        <p style={{ fontSize: mobile ? 15 : 17, color: t.muted, marginBottom: 36, lineHeight: 1.6 }}>
          Full API docs and integration guides (React, Vue, Vanilla JS, Slate, Lexical, craft.js) on{' '}
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" style={{ color: t.text }}>GitHub</a>.
        </p>
        {/* Stack vertically on mobile */}
        <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', gap: 24 }}>
          <CodeBlock label="React" code={REACT_SNIPPET} />
          <CodeBlock label="Vanilla JS" code={VANILLA_SNIPPET} />
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  const t = useT();
  const mobile = useMobile();
  return (
    <footer style={{
      background: t.footBg, color: t.footColor,
      padding: mobile ? '20px' : '24px 56px',
      display: 'flex',
      flexDirection: mobile ? 'column' : 'row',
      justifyContent: 'space-between', alignItems: mobile ? 'flex-start' : 'center',
      gap: mobile ? 8 : 0,
      fontSize: 15, borderTop: `1px solid ${t.border}`,
    }}>
      <span>dynamic-font v0.1.3 · MIT License</span>
      <div style={{ display: 'flex', gap: 20 }}>
        <a
          href={NPM_URL} target="_blank" rel="noopener noreferrer"
          style={{ color: t.footColor, textDecoration: 'none', transition: 'color 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.color = t.text)}
          onMouseLeave={e => (e.currentTarget.style.color = t.footColor)}
        >
          npm →
        </a>
        <a
          href={GITHUB_URL} target="_blank" rel="noopener noreferrer"
          style={{ color: t.footColor, textDecoration: 'none', transition: 'color 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.color = t.text)}
          onMouseLeave={e => (e.currentTarget.style.color = t.footColor)}
        >
          GitHub →
        </a>
      </div>
    </footer>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [dark, setDark] = useState(false);
  const t = dark ? T.dark : T.light;
  const mobile = useMobile();

  useEffect(() => { document.body.style.background = t.bg; }, [dark, t.bg]);
  useEffect(() => { loadFonts(HANDWRITTEN_FONTS); }, []);

  return (
    <ThemeCtx.Provider value={t}>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: t.bg, color: t.text }}>
        <Nav dark={dark} onToggle={() => setDark(d => !d)} />
        <Hero />
        <LetterShowcase />

        <div id="demo" style={{ flex: 1, display: 'flex', flexDirection: 'column', scrollMarginTop: 60 }}>
          <div style={{ padding: mobile ? '20px 20px 16px' : '28px 40px 20px', background: t.bg, borderBottom: `1px solid ${t.border}` }}>
            <SectionLabel>Interactive Demo</SectionLabel>
            <h2 style={{ fontSize: mobile ? 20 : 27, fontWeight: 700, letterSpacing: '-0.5px', marginTop: 8, color: t.text }}>
              Full feature explorer
            </h2>
            <p style={{ fontSize: mobile ? 14 : 17, color: t.muted, marginTop: 6 }}>
              Type, pick fonts, add custom typefaces, and explore all options live.
            </p>
          </div>
          <Demo />
        </div>

        <QuickStart />
        <Footer />
      </div>
    </ThemeCtx.Provider>
  );
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function Badge({ bg, color, border, children }) {
  return (
    <span style={{
      background: bg, color, border: `1px solid ${border}`,
      borderRadius: 6, padding: '5px 12px',
      fontSize: 14, fontWeight: 500, letterSpacing: '0.01em',
    }}>
      {children}
    </span>
  );
}

function ActionButton({ onClick, children }) {
  const t = useT();
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none', border: `1px solid ${t.actBdr}`,
        borderRadius: 6, padding: '7px 16px', fontSize: 15,
        color: t.actColor, cursor: 'pointer', transition: 'all 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = t.actHvBdr; e.currentTarget.style.color = t.actHvColor; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = t.actBdr; e.currentTarget.style.color = t.actColor; }}
    >
      {children}
    </button>
  );
}

function SectionLabel({ children }) {
  const t = useT();
  return (
    <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: t.muted }}>
      {children}
    </p>
  );
}

function DemoLabel({ children, style, t }) {
  return (
    <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: t.muted, ...style }}>
      {children}
    </p>
  );
}
