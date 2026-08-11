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

const FrameLines: React.FC<{dark?: boolean}> = ({dark = false}) => (
  <>
    <div style={{position: 'absolute', left: 96, right: 96, top: 72, height: 1, background: dark ? 'rgba(255,255,255,.22)' : RULE}} />
    <div style={{position: 'absolute', left: 96, right: 96, bottom: 72, height: 1, background: dark ? 'rgba(255,255,255,.22)' : RULE}} />
  </>
);

const Index: React.FC<{children: React.ReactNode; dark?: boolean}> = ({children, dark = false}) => (
  <div style={{position: 'absolute', left: 96, top: 94, color: dark ? '#a9aaab' : RED, fontFamily: MONO, fontSize: 32, fontWeight: 700, letterSpacing: '0.14em'}}>
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

const BrandOpen: React.FC = () => {
  const frame = useCurrentFrame();
  const mark = ease(frame, [4, 28], [0, 1]);
  const word = ease(frame, [22, 46], [0, 1]);
  const kicker = ease(frame, [38, 58], [0, 1]);
  const out = 1;
  return (
    <AbsoluteFill style={{background: PAPER, color: INK, fontFamily: SANS, opacity: out}}>
      <FrameLines />
      <div style={{position: 'absolute', left: 96, top: 96, color: RED, fontFamily: MONO, fontSize: 28, letterSpacing: '0.14em'}}>FIELD NOTE / 00</div>
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 42, transform: `translateY(${(1 - word) * 14}px)`, opacity: Math.max(mark, word)}}>
          <div style={{width: 114, height: 114, overflow: 'hidden', clipPath: `inset(${(1 - mark) * 50}% 0 ${(1 - mark) * 50}% 0)`}}>
            <Img src={staticFile('galok-symbol.svg')} style={{width: '100%', height: '100%'}} />
          </div>
          <div>
            <div style={{fontSize: 136, fontWeight: 820, lineHeight: 0.82, letterSpacing: '0.12em', opacity: word}}>GALOK</div>
            <div style={{marginTop: 30, color: MUTED, fontFamily: MONO, fontSize: 32, fontWeight: 700, letterSpacing: '0.24em', opacity: kicker}}>FIELD NOTES / LOOK CLOSER</div>
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 96, bottom: 96, color: MUTED, fontFamily: MONO, fontSize: 32, letterSpacing: '0.08em'}}>CITIES · IMAGES · WRITING · DATA</div>
    </AbsoluteFill>
  );
};

const HomeHero: React.FC = () => {
  const frame = useCurrentFrame();
  const vis = enterExit(frame, 120, 12, 12);
  const push = ease(frame, [0, 88], [1.018, 1.07]);
  const caption = ease(frame, [18, 40], [0, 1]);
  return (
    <AbsoluteFill style={{background: INK, overflow: 'hidden', opacity: vis, fontFamily: SANS}}>
      <Img src={staticFile('captures/home.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${push})`}} />
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(5,8,11,.78) 0%,rgba(5,8,11,.22) 54%,rgba(5,8,11,.08) 100%)'}} />
      <Index dark>01 / THE ARCHIVE</Index>
      <div style={{position: 'absolute', left: 96, bottom: 124, width: 1100, color: '#fff', opacity: caption, transform: `translateY(${(1 - caption) * 26}px)`}}>
        <h2 style={{margin: 0, fontSize: 98, lineHeight: 0.92, letterSpacing: '-0.06em'}}>An independent<br />visual archive.</h2>
        <p style={{margin: '28px 0 0', color: '#c9c8c3', fontSize: 34, lineHeight: 1.35}}>Cities, prices, platforms and ordinary life — held in the same frame.</p>
      </div>
    </AbsoluteFill>
  );
};

const citySources = [
  {name: 'BEIJING', src: 'city-render/beijing.mp4', delay: 0},
  {name: 'SHANGHAI', src: 'city-render/shanghai.mp4', delay: 5},
  {name: "XI'AN", src: 'city-render/xian.mp4', delay: 9},
  {name: 'XIAMEN', src: 'city-render/xiamen.mp4', delay: 14},
];

const CityMontage: React.FC = () => {
  const frame = useCurrentFrame();
  const vis = enterExit(frame, 180, 10, 10);
  return (
    <AbsoluteFill style={{background: INK, color: '#fff', fontFamily: SANS, opacity: vis}}>
      {citySources.map((city, index) => {
        const reveal = ease(frame, [city.delay, city.delay + 16], [0, 1]);
        const secondBeat = ease(frame, [76 + index * 4, 106 + index * 4], [0, 1]);
        return (
          <div key={city.name} style={{position: 'absolute', left: `${(index % 2) * 50}%`, top: `${Math.floor(index / 2) * 50}%`, width: '50%', height: '50%', overflow: 'hidden', borderRight: index % 2 === 0 ? `1px solid ${PAPER}` : 0, borderBottom: index < 2 ? `1px solid ${PAPER}` : 0, opacity: reveal}}>
            <Loop durationInFrames={140}>
              <OffthreadVideo muted src={staticFile(city.src)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.055 + index * 0.004 + secondBeat * 0.055})`, transformOrigin: `${42 + index * 5}% ${48 + index * 3}%`}} />
            </Loop>
            <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg,transparent 45%,rgba(2,4,6,.78))'}} />
            <span style={{position: 'absolute', left: 44, bottom: 34, fontSize: 62, fontWeight: 760, letterSpacing: '-0.045em'}}>{city.name}</span>
            <span style={{position: 'absolute', right: 44, bottom: 42, color: '#d6d4cf', fontFamily: MONO, fontSize: 32, letterSpacing: '0.08em'}}>0{index + 1} / CITY</span>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 72, top: 52, padding: '16px 20px', color: INK, background: PAPER, fontFamily: MONO, fontSize: 32, fontWeight: 700, letterSpacing: '0.09em'}}>FOUR CITIES / FOUR OPEN FIELD NOTES</div>
    </AbsoluteFill>
  );
};

const WorksNotes: React.FC = () => {
  const frame = useCurrentFrame();
  const vis = enterExit(frame, 180, 10, 10);
  const move = smoothstep(Math.min(1, Math.max(0, (frame - 48) / 72)));
  const worksW = 52 + move * 8;
  return (
    <AbsoluteFill style={{background: PAPER, color: INK, fontFamily: SANS, opacity: vis, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, display: 'flex', gap: 18, padding: 72}}>
        <div style={{position: 'relative', width: `${worksW}%`, height: '100%', overflow: 'hidden', border: `1px solid ${INK}`}}>
          <Img src={staticFile('captures/works-panel.png')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', transform: `scale(${1.01 + move * 0.03})`}} />
          <div style={{position: 'absolute', left: 30, bottom: 28, padding: '12px 16px', color: '#fff', background: INK, fontFamily: MONO, fontSize: 32, letterSpacing: '0.08em'}}>WORKS / EXPERIMENTS</div>
        </div>
        <div style={{position: 'relative', flex: 1, height: '100%', overflow: 'hidden', border: `1px solid ${INK}`}}>
          <Img src={staticFile('captures/notes-panel.png')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', transform: `scale(${1.035 - move * 0.015})`}} />
          <div style={{position: 'absolute', left: 30, bottom: 28, padding: '12px 16px', color: '#fff', background: RED, fontFamily: MONO, fontSize: 32, letterSpacing: '0.08em'}}>NOTES / OBSERVATIONS</div>
        </div>
      </div>
      <div style={{position: 'absolute', right: 110, bottom: 142, width: 640, padding: '26px 30px', color: PAPER, background: INK, transform: `translateY(${(1 - ease(frame, [18, 42], [0, 1])) * 30}px)`}}>
        <strong style={{fontSize: 60, letterSpacing: '-0.04em'}}>Work keeps looking.<br />Notes keep the trace.</strong>
      </div>
    </AbsoluteFill>
  );
};

const CPI = [0.4, 0.7, -0.8, 1.2, 3.9, 1.8, 1.5, 4.8, 5.9, -0.7, 3.3, 5.4, 2.6, 2.6, 2.0, 1.4, 2.0, 1.6, 2.1, 2.9, 2.5, 0.9, 2.0, 0.2, 0.2, 0.0];
const cpiX = (index: number) => (index / (CPI.length - 1)) * 820;
const cpiY = (value: number) => 330 - ((value + 1) / 7) * 310;

const DataScene: React.FC = () => {
  const frame = useCurrentFrame();
  const vis = enterExit(frame, 150, 10, 10);
  const trace = ease(frame, [14, 98], [0, 1]);
  const pts = CPI.map((value, index) => `${cpiX(index).toFixed(1)},${cpiY(value).toFixed(1)}`).join(' ');
  const currentIndex = Math.min(CPI.length - 1, Math.floor(trace * (CPI.length - 1)));
  return (
    <AbsoluteFill style={{background: PAPER_BRIGHT, color: INK, fontFamily: SANS, opacity: vis}}>
      <Img src={staticFile('captures/data.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.2, filter: 'grayscale(1)'}} />
      <FrameLines />
      <Index>04 / DATA</Index>
      <div style={{position: 'absolute', left: 96, top: 176, width: 650}}>
        <h2 style={{margin: 0, fontSize: 86, lineHeight: 0.94, letterSpacing: '-0.06em'}}>Data follows<br />the longer line.</h2>
        <p style={{margin: '30px 0 0', color: MUTED, fontSize: 32, lineHeight: 1.4}}>Prices, platforms and comparison lines behind the essays.</p>
      </div>
      <div style={{position: 'absolute', left: 868, top: 202, width: 910, height: 506, padding: '72px 44px 54px 46px', background: PAPER_BRIGHT, border: `1px solid ${INK}`, boxShadow: '16px 18px 0 rgba(13,17,21,.08)'}}>
        <div style={{position: 'absolute', left: 46, top: 28, fontFamily: MONO, fontSize: 32, letterSpacing: '.06em'}}>CPI, YOY / NBS · COMPLETE</div>
        <svg width="820" height="370" viewBox="0 0 820 370" style={{overflow: 'visible'}}>
          {[0, 1, 2, 3, 4].map((i) => <line key={i} x1="0" y1={i * 92.5} x2="820" y2={i * 92.5} stroke={RULE} strokeWidth="1" />)}
          {[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1={i * 164} y1="0" x2={i * 164} y2="370" stroke={RULE} strokeWidth="1" />)}
          <rect x={cpiX(20)} y="0" width={cpiX(23) - cpiX(20)} height="370" fill={RED} opacity="0.08" />
          <polyline points={pts} fill="none" stroke={RED} strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - trace} />
          <circle cx={cpiX(currentIndex)} cy={cpiY(CPI[currentIndex])} r="10" fill={RED} opacity={trace > 0.02 ? 1 : 0} />
        </svg>
        <div style={{display: 'flex', justifyContent: 'space-between', color: MUTED, fontFamily: MONO, fontSize: 32}}><span>2000</span><span>2005</span><span>2010</span><span>2015</span><span>2020</span><span>2025</span></div>
      </div>
    </AbsoluteFill>
  );
};

const ArchiveScene: React.FC = () => {
  const frame = useCurrentFrame();
  const vis = enterExit(frame, 120, 10, 10);
  const push = ease(frame, [0, 88], [1.03, 1.075]);
  return (
    <AbsoluteFill style={{background: PAPER, color: INK, fontFamily: SANS, overflow: 'hidden', opacity: vis}}>
      <Img src={staticFile('captures/archive.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${push})`}} />
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(242,239,229,.92),rgba(242,239,229,.18) 68%)'}} />
      <Index>05 / ARCHIVE</Index>
      <div style={{position: 'absolute', left: 96, bottom: 122}}>
        <h2 style={{margin: 0, fontSize: 92, lineHeight: .94, letterSpacing: '-0.06em'}}>Everything<br />remains findable.</h2>
        <p style={{margin: '28px 0 0', color: MUTED, fontFamily: MONO, fontSize: 32, letterSpacing: '.08em'}}>CITIES · IMAGES · WRITING · DATA</p>
      </div>
    </AbsoluteFill>
  );
};

const AboutScene: React.FC = () => {
  const frame = useCurrentFrame();
  const vis = enterExit(frame, 120, 10, 10);
  const poster = ease(frame, [8, 30], [0, 1]);
  const labels = ['VIEW THE PRESSURE.', 'FRAME THE EVIDENCE.', 'OBSERVE THE SCENE.'];
  return (
    <AbsoluteFill style={{background: PAPER, color: INK, fontFamily: SANS, opacity: vis}}>
      <FrameLines />
      <Index>06 / ABOUT · METHOD</Index>
      <div style={{position: 'absolute', left: 96, top: 200, width: 1040}}>
        <h2 style={{margin: 0, fontSize: 86, lineHeight: .95, letterSpacing: '-0.06em'}}>Three working<br />distances.</h2>
        <div style={{marginTop: 62, borderTop: `1px solid ${INK}`}}>
          {labels.map((label, i) => {
            const k = ease(frame, [24 + i * 8, 46 + i * 8], [0, 1]);
            return <div key={label} style={{display: 'grid', gridTemplateColumns: '80px 1fr', padding: '20px 0', borderBottom: `1px solid ${INK}`, opacity: k, transform: `translateX(${(1 - k) * 18}px)`}}><span style={{color: RED, fontFamily: MONO, fontSize: 32}}>0{i + 1}</span><strong style={{fontSize: 56, letterSpacing: '-0.035em'}}>{label}</strong></div>;
          })}
        </div>
      </div>
      <div style={{position: 'absolute', right: 120, top: 108, width: 430, height: 716, opacity: poster, transform: `translateY(${(1 - poster) * 22}px) rotate(${(1 - poster) * 1.2}deg)`, boxShadow: '20px 22px 0 rgba(13,17,21,.09)'}}>
        <Img src={staticFile('field-note-poster.webp')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </div>
      <div style={{position: 'absolute', left: 96, bottom: 92, color: MUTED, fontFamily: MONO, fontSize: 32, letterSpacing: '.06em'}}>GALOKVIEW@OUTLOOK.COM · X / @GALOKVIEW</div>
    </AbsoluteFill>
  );
};

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const mark = ease(frame, [0, 22], [4.8, 1]);
  const shift = ease(frame, [22, 42], [0, -114]);
  const word = ease(frame, [38, 58], [0, 1]);
  const line = ease(frame, [36, 50], [0, 1]);
  return (
    <AbsoluteFill style={{background: INK, color: '#fff', fontFamily: SANS}}>
      <FrameLines dark />
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{position: 'relative', width: 700, height: 180}}>
          <div style={{position: 'absolute', left: '50%', top: 0, width: 130, height: 130, marginLeft: -65, transform: `translateX(${shift}px) scale(${mark})`, transformOrigin: 'center'}}>
            <Img src={staticFile('galok-symbol.svg')} style={{width: '100%', height: '100%'}} />
          </div>
          <div style={{position: 'absolute', left: 330, top: 12, fontSize: 108, fontWeight: 820, letterSpacing: '.1em', opacity: word, transform: `translateX(${(1 - word) * 18}px)`}}>GALOK</div>
          <div style={{position: 'absolute', left: 108, right: -96, top: 162, textAlign: 'center', color: RED, fontFamily: MONO, fontSize: 64, fontWeight: 700, letterSpacing: '.08em', opacity: line}}>LOOK CLOSER. / GALOK.ME</div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 96, bottom: 96, color: '#9b9c9d', fontFamily: MONO, fontSize: 32, letterSpacing: '.08em'}}>VISUAL ARCHIVE / FIELD NOTES</div>
      <div style={{position: 'absolute', right: 96, bottom: 96, color: '#9b9c9d', fontFamily: MONO, fontSize: 32, letterSpacing: '.08em'}}>GALOK.ME</div>
    </AbsoluteFill>
  );
};

export const GalokBrandFilm: React.FC = () => (
  <AbsoluteFill style={{background: PAPER}}>
    <Sequence from={0} durationInFrames={120}><BrandOpen /></Sequence>
    <Sequence from={120} durationInFrames={120}><HomeHero /></Sequence>
    <Sequence from={240} durationInFrames={180}><CityMontage /></Sequence>
    <Sequence from={420} durationInFrames={180}><WorksNotes /></Sequence>
    <Sequence from={600} durationInFrames={150}><DataScene /></Sequence>
    <Sequence from={750} durationInFrames={120}><ArchiveScene /></Sequence>
    <Sequence from={870} durationInFrames={120}><AboutScene /></Sequence>
    <Sequence from={990} durationInFrames={90}><Outro /></Sequence>
  </AbsoluteFill>
);
