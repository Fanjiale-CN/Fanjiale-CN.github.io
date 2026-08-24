import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  Loop,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
const PAPER = '#f2efe5';
const PAPER_BRIGHT = '#fbfaf6';
const INK = '#0d1115';
const MUTED = '#6d6b65';
const RULE = '#cfc9bc';
const RED = '#ee3b32';
const SANS = 'Arial, Helvetica, ui-sans-serif, sans-serif';
const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';
const EASE = Easing.bezier(0.22, 0.74, 0.24, 1);
const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const ease = (frame: number, input: [number, number], output: [number, number]) =>
  interpolate(frame, input, output, {...clamp, easing: EASE});
const smoothstep = (t: number) => t * t * (3 - 2 * t);

// --- Vertical layout constants (1080x1920) ---
const PAD = 54;
const PADY = 104;

const FrameLines: React.FC<{dark?: boolean}> = ({dark = false}) => (
  <>
    <div style={{position: 'absolute', left: PAD, right: PAD, top: PADY, height: 1, background: dark ? 'rgba(255,255,255,.22)' : RULE}} />
    <div style={{position: 'absolute', left: PAD, right: PAD, bottom: PADY - 32, height: 1, background: dark ? 'rgba(255,255,255,.22)' : RULE}} />
  </>
);

const Index: React.FC<{children: React.ReactNode; dark?: boolean}> = ({children, dark = false}) => (
  <div style={{position: 'absolute', left: PAD, top: PADY + 22, color: dark ? '#a9aaab' : RED, fontFamily: MONO, fontSize: 24, fontWeight: 700, letterSpacing: '0.14em'}}>
    {children}
  </div>
);

const enterExit = (frame: number, duration: number, enter = 10, exit = 10) => {
  void frame;
  void duration;
  void enter;
  void exit;
  return 1;
};

// 01 / BRAND OPEN — vertical lockup
const BrandOpen: React.FC = () => {
  const frame = useCurrentFrame();
  const mark = ease(frame, [4, 28], [0, 1]);
  const word = ease(frame, [22, 46], [0, 1]);
  const kicker = ease(frame, [38, 58], [0, 1]);
  return (
    <AbsoluteFill style={{background: PAPER, color: INK, fontFamily: SANS}}>
      <FrameLines />
      <div style={{position: 'absolute', left: PAD, top: PADY + 22, color: RED, fontFamily: MONO, fontSize: 21, letterSpacing: '0.14em'}}>FIELD NOTE / 00</div>
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 44}}>
        <div style={{width: 220, height: 220, overflow: 'hidden', clipPath: `inset(${(1 - mark) * 50}% 0 ${(1 - mark) * 50}% 0)`}}>
          <Img src={staticFile('galok-symbol.svg')} style={{width: '100%', height: '100%'}} />
        </div>
        <div style={{textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
          <div style={{fontSize: 128, fontWeight: 820, lineHeight: 0.82, letterSpacing: '0.12em', opacity: word, transform: `translateY(${(1 - word) * 14}px)`}}>GALOK</div>
          <div style={{color: MUTED, fontFamily: MONO, fontSize: 22, fontWeight: 700, letterSpacing: '0.24em', opacity: kicker}}>FIELD NOTES / LOOK CLOSER</div>
        </div>
      </div>
      <div style={{position: 'absolute', left: PAD, right: PAD, bottom: PADY - 84, textAlign: 'center', color: MUTED, fontFamily: MONO, fontSize: 22, letterSpacing: '0.08em'}}>CITIES · IMAGES · WRITING · DATA</div>
    </AbsoluteFill>
  );
};

// 02 / HOME HERO — full-bleed vertical home evidence
const HomeHero: React.FC = () => {
  const frame = useCurrentFrame();
  const vis = enterExit(frame, 120, 12, 12);
  const push = ease(frame, [0, 100], [1.018, 1.07]);
  const caption = ease(frame, [18, 40], [0, 1]);
  return (
    <AbsoluteFill style={{background: INK, overflow: 'hidden', opacity: vis, fontFamily: SANS}}>
      <Img src={staticFile('captures/home-v916.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${push})`}} />
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(5,8,11,.52) 0%,rgba(5,8,11,.1) 38%,rgba(5,8,11,.05) 58%,rgba(5,8,11,.8) 100%)'}} />
      <Index dark>01 / THE ARCHIVE</Index>
      <div style={{position: 'absolute', left: PAD, right: PAD, bottom: 188, color: '#fff', opacity: caption, transform: `translateY(${(1 - caption) * 26}px)`}}>
        <h2 style={{margin: 0, fontSize: 86, lineHeight: 0.94, letterSpacing: '-0.06em'}}>An independent<br />visual archive.</h2>
        <p style={{margin: '26px 0 0', color: '#c9c8c3', fontSize: 30, lineHeight: 1.4}}>Cities, prices, platforms and ordinary life — held in the same frame.</p>
      </div>
    </AbsoluteFill>
  );
};

const citySources = [
  {name: 'BEIJING', src: 'city-render/beijing.mp4', delay: 0},
  {name: 'SHANGHAI', src: 'city-render/shanghai.mp4', delay: 4},
  {name: "XI'AN", src: 'city-render/xian.mp4', delay: 8},
  {name: 'XIAMEN', src: 'city-render/xiamen.mp4', delay: 12},
];

// 03 / CITY MONTAGE — 2x2 grid (cells are 540x960 portrait)
const CityMontage: React.FC = () => {
  const frame = useCurrentFrame();
  const vis = enterExit(frame, 180, 10, 10);
  return (
    <AbsoluteFill style={{background: INK, color: '#fff', fontFamily: SANS, opacity: vis}}>
      {citySources.map((city, index) => {
        const reveal = ease(frame, [city.delay, city.delay + 14], [0, 1]);
        const secondBeat = ease(frame, [70 + index * 4, 96 + index * 4], [0, 1]);
        return (
          <div key={city.name} style={{position: 'absolute', left: `${(index % 2) * 50}%`, top: `${Math.floor(index / 2) * 50}%`, width: '50%', height: '50%', overflow: 'hidden', borderRight: index % 2 === 0 ? `1px solid ${PAPER}` : 0, borderBottom: index < 2 ? `1px solid ${PAPER}` : 0, opacity: reveal}}>
            <Loop durationInFrames={130}>
              <OffthreadVideo muted src={staticFile(city.src)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.055 + index * 0.004 + secondBeat * 0.055})`, transformOrigin: `${42 + index * 5}% ${48 + index * 3}%`}} />
            </Loop>
            <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg,transparent 45%,rgba(2,4,6,.78))'}} />
            <span style={{position: 'absolute', left: 36, bottom: 28, fontSize: 52, fontWeight: 760, letterSpacing: '-0.045em'}}>{city.name}</span>
            <span style={{position: 'absolute', right: 36, bottom: 34, color: '#d6d4cf', fontFamily: MONO, fontSize: 24, letterSpacing: '0.08em'}}>0{index + 1} / CITY</span>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 48, top: 40, padding: '12px 16px', color: INK, background: PAPER, fontFamily: MONO, fontSize: 22, fontWeight: 700, letterSpacing: '0.09em'}}>FOUR CITIES / FOUR OPEN FIELD NOTES</div>
    </AbsoluteFill>
  );
};

// 04 / WORKS + NOTES — stacked vertical panels
const WorksNotes: React.FC = () => {
  const frame = useCurrentFrame();
  const vis = enterExit(frame, 180, 10, 10);
  const move = smoothstep(Math.min(1, Math.max(0, (frame - 48) / 72)));
  const worksH = 46 + move * 8;
  return (
    <AbsoluteFill style={{background: PAPER, color: INK, fontFamily: SANS, opacity: vis, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', gap: 18, padding: PAD}}>
        <div style={{position: 'relative', width: '100%', height: `${worksH}%`, overflow: 'hidden', border: `1px solid ${INK}`}}>
          <Img src={staticFile('captures/works-panel-v916.png')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 60%', transform: `scale(${1.01 + move * 0.03})`}} />
        </div>
        <div style={{position: 'relative', flex: 1, width: '100%', overflow: 'hidden', border: `1px solid ${INK}`}}>
          <Img src={staticFile('captures/notes-panel-v916.png')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', transform: `scale(${1.035 - move * 0.015})`}} />
          <div style={{position: 'absolute', left: 26, bottom: 24, padding: '10px 14px', color: '#fff', background: RED, fontFamily: MONO, fontSize: 24, letterSpacing: '0.08em'}}>NOTES / OBSERVATIONS</div>
        </div>
      </div>
      <div style={{position: 'absolute', left: PAD, right: PAD, bottom: 26, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 24}}>
        <strong style={{fontSize: 38, letterSpacing: '-0.04em', lineHeight: 1, transform: `translateY(${(1 - ease(frame, [18, 42], [0, 1])) * 16}px)`}}>Work keeps looking. Notes keep the trace.</strong>
        <span style={{fontFamily: MONO, fontSize: 20, letterSpacing: '0.08em', color: RED}}>WORKS / NOTES</span>
      </div>
    </AbsoluteFill>
  );
};

// 05 / DATA — CPI trace over vertical data evidence
const CPI = [0.4, 0.7, -0.8, 1.2, 3.9, 1.8, 1.5, 4.8, 5.9, -0.7, 3.3, 5.4, 2.6, 2.6, 2.0, 1.4, 2.0, 1.6, 2.1, 2.9, 2.5, 0.9, 2.0, 0.2, 0.2, 0.0];
const cpiX = (index: number) => (index / (CPI.length - 1)) * 972;
const cpiY = (value: number) => 268 - ((value + 1) / 7) * 238;
const DataScene: React.FC = () => {
  const frame = useCurrentFrame();
  const vis = enterExit(frame, 150, 10, 10);
  const trace = ease(frame, [14, 98], [0, 1]);
  const pts = CPI.map((value, index) => `${cpiX(index).toFixed(1)},${cpiY(value).toFixed(1)}`).join(' ');
  const currentIndex = Math.min(CPI.length - 1, Math.floor(trace * (CPI.length - 1)));
  return (
    <AbsoluteFill style={{background: PAPER_BRIGHT, color: INK, fontFamily: SANS, opacity: vis}}>
      <Img src={staticFile('captures/data-v916.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.16, filter: 'grayscale(1)'}} />
      <FrameLines />
      <Index>04 / DATA</Index>
      <div style={{position: 'absolute', left: PAD, top: 300, width: 972}}>
        <h2 style={{margin: 0, fontSize: 74, lineHeight: 0.96, letterSpacing: '-0.06em'}}>Data follows<br />the longer line.</h2>
        <p style={{margin: '26px 0 0', color: MUTED, fontSize: 28, lineHeight: 1.45}}>Prices, platforms and comparison lines behind the essays.</p>
      </div>
      <div style={{position: 'absolute', left: PAD, top: 690, width: 972, padding: '58px 38px 46px 40px', background: PAPER_BRIGHT, border: `1px solid ${INK}`, boxShadow: '14px 16px 0 rgba(13,17,21,.08)'}}>
        <div style={{position: 'absolute', left: 40, top: 22, fontFamily: MONO, fontSize: 22, letterSpacing: '.06em'}}>CPI, YOY / NBS · COMPLETE</div>
        <svg width="972" height="316" viewBox="0 0 972 316" style={{overflow: 'visible'}}>
          {[0, 1, 2, 3, 4].map((i) => <line key={i} x1="0" y1={i * 79} x2="972" y2={i * 79} stroke={RULE} strokeWidth="1" />)}
          {[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1={i * 194.4} y1="0" x2={i * 194.4} y2="316" stroke={RULE} strokeWidth="1" />)}
          <rect x={cpiX(20)} y="0" width={cpiX(23) - cpiX(20)} height="316" fill={RED} opacity="0.08" />
          <polyline points={pts} fill="none" stroke={RED} strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - trace} />
          <circle cx={cpiX(currentIndex)} cy={cpiY(CPI[currentIndex])} r="9" fill={RED} opacity={trace > 0.02 ? 1 : 0} />
        </svg>
        <div style={{display: 'flex', justifyContent: 'space-between', color: MUTED, fontFamily: MONO, fontSize: 26}}><span>2000</span><span>2005</span><span>2010</span><span>2015</span><span>2020</span><span>2025</span></div>
      </div>
      <div style={{position: 'absolute', left: PAD, right: PAD, bottom: 130}}>
        <p style={{margin: 0, color: MUTED, fontFamily: MONO, fontSize: 21, letterSpacing: '.06em'}}>THE DATA DESK SITS UNDER ALL THREE LENSES — <span style={{color: RED}}>26 YEARS, ONE LINE</span></p>
      </div>
    </AbsoluteFill>
  );
};

// 06 / ARCHIVE — full-bleed vertical archive evidence
const ArchiveScene: React.FC = () => {
  const frame = useCurrentFrame();
  const vis = enterExit(frame, 120, 10, 10);
  const push = ease(frame, [0, 100], [1.012, 1.05]);
  const caption = ease(frame, [16, 38], [0, 1]);
  return (
    <AbsoluteFill style={{background: PAPER, color: INK, fontFamily: SANS, overflow: 'hidden', opacity: vis}}>
      <Img src={staticFile('captures/archive-v916.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${push})`}} />
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(242,239,229,.88) 0%,rgba(242,239,229,.3) 36%,rgba(242,239,229,.06) 58%,rgba(242,239,229,.76) 100%)'}} />
      <Index>05 / ARCHIVE</Index>
      <div style={{position: 'absolute', left: PAD, right: PAD, bottom: 172, opacity: caption, transform: `translateY(${(1 - caption) * 26}px)`}}>
        <h2 style={{margin: 0, fontSize: 82, lineHeight: 0.94, letterSpacing: '-0.06em'}}>Everything<br />remains findable.</h2>
        <p style={{margin: '26px 0 0', color: MUTED, fontFamily: MONO, fontSize: 26, letterSpacing: '.08em'}}>CITIES · IMAGES · WRITING · DATA</p>
      </div>
    </AbsoluteFill>
  );
};

// 07 / ABOUT · METHOD — three lenses, poster at lower right
const AboutScene: React.FC = () => {
  const frame = useCurrentFrame();
  const vis = enterExit(frame, 120, 10, 10);
  const poster = ease(frame, [10, 32], [0, 1]);
  const labels = ['VIEW THE PRESSURE.', 'FRAME THE EVIDENCE.', 'OBSERVE THE SCENE.'];
  return (
    <AbsoluteFill style={{background: PAPER, color: INK, fontFamily: SANS, opacity: vis}}>
      <FrameLines />
      <Index>06 / ABOUT · METHOD</Index>
      <div style={{position: 'absolute', left: PAD, right: PAD, top: 244}}>
        <h2 style={{margin: 0, fontSize: 70, lineHeight: 0.96, letterSpacing: '-0.06em'}}>Three working<br />distances.</h2>
        <div style={{marginTop: 48, borderTop: `1px solid ${INK}`}}>
          {labels.map((label, i) => {
            const k = ease(frame, [24 + i * 8, 46 + i * 8], [0, 1]);
            return <div key={label} style={{display: 'grid', gridTemplateColumns: '68px 1fr', padding: '18px 0', borderBottom: `1px solid ${INK}`, opacity: k, transform: `translateX(${(1 - k) * 18}px)`}}><span style={{color: RED, fontFamily: MONO, fontSize: 26}}>0{i + 1}</span><strong style={{fontSize: 46, letterSpacing: '-0.035em', lineHeight: 1.15}}>{label}</strong></div>;
          })}
        </div>
      </div>
      <div style={{position: 'absolute', right: PAD, top: 1150, width: 380, height: 600, opacity: poster, transform: `translateY(${(1 - poster) * 22}px) rotate(${(1 - poster) * 1.2}deg)`, boxShadow: '18px 20px 0 rgba(13,17,21,.09)'}}>
        <Img src={staticFile('field-note-poster.webp')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </div>
      <div style={{position: 'absolute', left: PAD, right: PAD, bottom: 122, color: MUTED, fontFamily: MONO, fontSize: 21, letterSpacing: '.06em'}}>GALOKVIEW@OUTLOOK.COM · X / @GALOKVIEW</div>
    </AbsoluteFill>
  );
};

// 08 / OUTRO — vertical brand lockup
const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const mark = ease(frame, [0, 22], [4.8, 1]);
  const shift = ease(frame, [22, 42], [0, -100]);
  const word = ease(frame, [38, 58], [0, 1]);
  const line = ease(frame, [36, 50], [0, 1]);
  return (
    <AbsoluteFill style={{background: INK, color: '#fff', fontFamily: SANS}}>
      <FrameLines dark />
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40}}>
        <div style={{position: 'relative', width: 600, height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <div style={{position: 'relative', width: 120, height: 120, transform: `translateY(${shift}px) scale(${mark})`, transformOrigin: 'center'}}>
            <Img src={staticFile('galok-symbol.svg')} style={{width: '100%', height: '100%'}} />
          </div>
          <div style={{marginTop: 36, fontSize: 112, fontWeight: 820, letterSpacing: '.1em', opacity: word, transform: `translateY(${(1 - word) * 18}px)`}}>GALOK</div>
          <div style={{marginTop: 26, color: RED, fontFamily: MONO, fontSize: 42, fontWeight: 700, letterSpacing: '.08em', opacity: line}}>LOOK CLOSER. / GALOK.ME</div>
        </div>
      </div>
      <div style={{position: 'absolute', left: PAD, bottom: PADY - 84, color: '#9b9c9d', fontFamily: MONO, fontSize: 21, letterSpacing: '.08em'}}>VISUAL ARCHIVE / FIELD NOTES</div>
      <div style={{position: 'absolute', right: PAD, bottom: PADY - 84, color: '#9b9c9d', fontFamily: MONO, fontSize: 21, letterSpacing: '.08em'}}>GALOK.ME</div>
    </AbsoluteFill>
  );
};

export const GalokBrandFilm: React.FC = () => (
  <AbsoluteFill style={{background: PAPER}}>
    <Sequence from={0} durationInFrames={90}><BrandOpen /></Sequence>
    <Sequence from={90} durationInFrames={90}><HomeHero /></Sequence>
    <Sequence from={180} durationInFrames={130}><CityMontage /></Sequence>
    <Sequence from={310} durationInFrames={130}><WorksNotes /></Sequence>
    <Sequence from={440} durationInFrames={110}><DataScene /></Sequence>
    <Sequence from={550} durationInFrames={80}><ArchiveScene /></Sequence>
    <Sequence from={630} durationInFrames={80}><AboutScene /></Sequence>
    <Sequence from={710} durationInFrames={70}><Outro /></Sequence>
  </AbsoluteFill>
);
