"use client";

import { Pause, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAgri } from "./copy";

/**
 * Movimiento del hero de agricultura (la foto no cambia de encuadre).
 *
 * - Si se entrega `video` (WebM/MP4), se reproduce ese video en bucle (silenciado, inline, foto como poster).
 * - Si no, la MISMA foto se anima con dos capas ligeras, sin librerías:
 *   1) un shader WebGL hace que el rocío de la foto viaje a lo largo de cada chorro (flujo radial desde cada
 *      aspersor) y que la neblina se desplace, solo dentro de la zona de rocío;
 *   2) un lienzo 2D dibuja gotas con trayectoria parabólica y estela saliendo de cada aspersor, con un leve
 *      barrido de la boquilla.
 *   Todo es periódico (16 s): no hay salto al reiniciar. Con `prefers-reduced-motion`, sin WebGL o antes de
 *   cargar, se queda la foto estática (el LCP no se ve afectado).
 */
export type HeroVideo = { webm?: string; mp4?: string };

const LOOP = 16;
const FPS = 30;
const IMG_W = 1672;
const IMG_H = 941;

/** Boquillas visibles en la foto (px sobre la imagen 1672×941), con su fuerza relativa. */
const HEADS = [
  { x: 1300, y: 548, power: 1, angle: -0.62 },
  { x: 960, y: 566, power: 0.9, angle: -0.58 },
  { x: 647, y: 566, power: 0.8, angle: -0.55 },
  { x: 468, y: 566, power: 0.65, angle: -0.5 },
] as const;
const DROPS_PER_HEAD = 38;

const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D uTex;
uniform vec2 uRes;
uniform vec2 uImg;
uniform vec2 uPos;
uniform float uPhase;

float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vnoise(vec2 p){
  vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);
}
float fbm(vec2 p){
  float v=0.,a=.5;
  for(int i=0;i<3;i++){v+=a*vnoise(p);p=p*2.03+vec2(7.1,3.7);a*=.5;}
  return v;
}
float spray(vec2 uv){
  vec3 c=texture2D(uTex,uv).rgb;
  float mn=min(c.r,min(c.g,c.b)),mx=max(c.r,max(c.g,c.b));
  float sat=(mx-mn)/(mx+.001);
  float white=smoothstep(.40,.76,mn)*(1.-smoothstep(.20,.48,sat));
  float band=smoothstep(.28,.38,uv.y)*(1.-smoothstep(.70,.78,uv.y));
  return white*band;
}
// Dirección del chorro: radial desde la boquilla más cercana.
void head(vec2 h,vec2 uv,float asp,inout vec2 best,inout float bd){
  vec2 d=(uv-h)*vec2(asp,1.);
  float dist=length(d);
  if(dist<bd&&dist>.0001){bd=dist;best=d/dist;}
}
// xy = dirección del chorro, z = distancia a la boquilla más cercana (para apagar el efecto junto a ella).
vec3 flowDir(vec2 uv){
  float asp=uImg.x/uImg.y;
  vec2 best=vec2(.85,-.5);float bd=9.;
  head(vec2(.777,.583),uv,asp,best,bd);
  head(vec2(.574,.601),uv,asp,best,bd);
  head(vec2(.387,.601),uv,asp,best,bd);
  head(vec2(.280,.601),uv,asp,best,bd);
  return vec3(best,bd);
}
void main(){
  vec2 p=vec2(gl_FragCoord.x,uRes.y-gl_FragCoord.y);
  float sc=max(uRes.x/uImg.x,uRes.y/uImg.y);
  vec2 size=uImg*sc;
  vec2 off=(uRes-size)*uPos;
  vec2 uv=(p-off)/size;
  float asp=uImg.x/uImg.y;

  float m=(spray(uv)*2.+spray(uv+vec2(.012,0.))+spray(uv-vec2(.012,0.))+spray(uv+vec2(0.,.012))+spray(uv-vec2(0.,.012)))/6.;
  m=smoothstep(.0,.40,m*2.);

  vec3 base=texture2D(uTex,uv).rgb;
  vec3 col=base;
  if(m>.01){
    // 1) El rocío de la foto viaja a lo largo del chorro (4 ciclos por bucle → periódico).
    vec3 fd=flowDir(uv);
    vec2 fl=fd.xy/vec2(asp,1.);
    m*=smoothstep(.03,.16,fd.z);
    vec3 adv=vec3(0.);
    for(int k=0;k<2;k++){
      float ph=fract(uPhase*4.+float(k)*.5);
      float w=1.-abs(2.*ph-1.);
      adv+=w*texture2D(uTex,uv-fl*ph*.11).rgb;
    }
    col=mix(base,adv,m*.85);

    // 2) Ondulación y neblina que se desplazan.
    vec2 q=uv*vec2(6.,3.4);
    vec2 dir=vec2(1.,.5);
    vec2 disp=vec2(0.);
    float mist=0.;
    for(int k=0;k<2;k++){
      float ph=fract(uPhase*2.+float(k)*.5);
      float w=1.-abs(2.*ph-1.);
      float s=float(k);
      disp+=w*vec2(fbm(q*1.3-dir*ph*1.6+s*17.3)-.5,fbm(q*2.2+vec2(-.7,.4)*ph*2.1+s*9.1)-.5);
      mist+=w*fbm(q*.8-dir*ph*1.2+s*31.7);
    }
    disp*=.0075*m;
    vec3 rip=texture2D(uTex,uv+disp+fl*.004).rgb;
    col=mix(col,rip,.5);
    float haze=smoothstep(.36,.78,mist)*m;
    col=mix(col,vec3(.94,.97,1.),haze*.34);
    col+=(mist-.5)*.08*m;
  }
  gl_FragColor=vec4(col,1.);
}`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
}

function parsePos(value: string): [number, number] {
  const [x, y] = value.split(" ").map((v) => (v.endsWith("%") ? parseFloat(v) / 100 : 0.5));
  return [Number.isFinite(x) ? x : 0.5, Number.isFinite(y) ? y : 0.5];
}

const rnd = (i: number, s: number) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Gotas con trayectoria parabólica; cada gota se repite un número entero de veces por bucle. */
function drawDrops(ctx: CanvasRenderingContext2D, w: number, h: number, pos: [number, number], clock: number, small: boolean) {
  ctx.clearRect(0, 0, w, h);
  const scale = Math.max(w / IMG_W, h / IMG_H);
  const ox = (w - IMG_W * scale) * pos[0];
  const oy = (h - IMG_H * scale) * pos[1];
  const loopT = clock / LOOP;
  const perHead = small ? Math.round(DROPS_PER_HEAD * 0.6) : DROPS_PER_HEAD;
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";

  for (let hIdx = 0; hIdx < HEADS.length; hIdx++) {
    const hd = HEADS[hIdx];
    const sway = Math.sin(2 * Math.PI * (loopT * 2 + hIdx * 0.21)) * 0.07;
    for (let i = 0; i < perHead; i++) {
      const id = hIdx * 100 + i;
      const cycles = 10 + Math.floor(rnd(id, 1) * 5); // 10–14 ciclos por bucle → vida 1.1–1.6 s
      const life = LOOP / cycles;
      const t = (loopT * cycles + rnd(id, 2)) % 1;
      const tau = t * life;
      const ang = hd.angle + sway + (rnd(id, 3) - 0.5) * 0.5;
      const speed = (380 + rnd(id, 4) * 360) * hd.power;
      const g = 520;
      const x = hd.x + Math.cos(ang) * speed * tau;
      const y = hd.y + Math.sin(ang) * speed * tau + 0.5 * g * tau * tau;
      const tail = 0.045;
      const x0 = hd.x + Math.cos(ang) * speed * (tau - tail);
      const y0 = hd.y + Math.sin(ang) * speed * (tau - tail) + 0.5 * g * (tau - tail) * (tau - tail);
      const fade = Math.sin(Math.PI * Math.min(1, t * 1.15)) * (1 - t * 0.35);
      const a = Math.max(0, fade) * (0.35 + rnd(id, 5) * 0.45);
      if (a < 0.02) continue;
      ctx.strokeStyle = `rgba(236,246,255,${a.toFixed(3)})`;
      ctx.lineWidth = (0.9 + rnd(id, 6) * 1.7) * Math.max(0.7, scale * 1.15);
      ctx.beginPath();
      ctx.moveTo(ox + x0 * scale, oy + y0 * scale);
      ctx.lineTo(ox + x * scale, oy + y * scale);
      ctx.stroke();
    }
  }
  ctx.globalCompositeOperation = "source-over";
}

export function HeroMotion({ video }: { video?: HeroVideo }) {
  const t = useAgri();
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const drops = useRef<HTMLCanvasElement>(null);
  const videoEl = useRef<HTMLVideoElement>(null);
  const playingRef = useRef(true);
  const [playing, setPlaying] = useState(true);
  const [live, setLive] = useState(false);
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const v = videoEl.current;
    if (!v || reduced) return;
    if (playing) void v.play().catch(() => undefined);
    else v.pause();
  }, [playing, reduced, video]);

  useEffect(() => {
    if (video || reduced) return;
    const cv = canvas.current;
    const dv = drops.current;
    const box = wrap.current;
    const photo = box?.parentElement?.querySelector<HTMLImageElement>(".ag-hero__photo");
    if (!cv || !dv || !box || !photo) return;

    let raf = 0;
    let stopped = false;
    let visible = true;
    let cleanup: (() => void) | undefined;

    const start = () => {
      if (stopped) return;
      const gl = cv.getContext("webgl", { alpha: false, antialias: false, powerPreference: "low-power" });
      const ctx = dv.getContext("2d");
      if (!gl || !ctx) return;
      const vs = compile(gl, gl.VERTEX_SHADER, VERT);
      const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
      const prog = gl.createProgram();
      if (!vs || !fs || !prog) return;
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
      gl.useProgram(prog);

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, "a");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

      const u = (n: string) => gl.getUniformLocation(prog, n);
      const uRes = u("uRes"), uImg = u("uImg"), uPos = u("uPos"), uPhase = u("uPhase");
      const tex = gl.createTexture();
      let small = false;

      const resize = () => {
        const w = box.clientWidth, h = box.clientHeight;
        small = w < 800;
        const dpr = Math.min(window.devicePixelRatio || 1, small ? 1 : 1.25);
        let cw = w * dpr, ch = h * dpr;
        const cap = small ? 0.9e6 : 1.8e6;
        const k = Math.min(1, Math.sqrt(cap / (cw * ch)));
        cw = Math.max(2, Math.round(cw * k));
        ch = Math.max(2, Math.round(ch * k));
        if (cv.width !== cw || cv.height !== ch) {
          cv.width = cw;
          cv.height = ch;
        }
        if (dv.width !== cw || dv.height !== ch) {
          dv.width = cw;
          dv.height = ch;
        }
        gl.viewport(0, 0, cw, ch);
      };
      const ro = new ResizeObserver(resize);
      ro.observe(box);
      resize();

      const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
      io.observe(box);

      let clock = 0;
      let last = performance.now();
      let acc = 0;
      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        const dt = Math.min((now - last) / 1000, 0.1);
        last = now;
        if (!visible || document.hidden || !playingRef.current) return;
        acc += dt;
        if (acc < 1 / FPS) return;
        clock += acc;
        acc = 0;
        const pos = parsePos(getComputedStyle(photo).objectPosition);
        gl.uniform2f(uRes, cv.width, cv.height);
        gl.uniform2f(uPos, pos[0], pos[1]);
        gl.uniform1f(uPhase, (clock / LOOP) % 1);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        drawDrops(ctx, dv.width, dv.height, pos, clock, small);
      };

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.decoding = "async";
      img.onload = () => {
        if (stopped) return;
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.uniform2f(uImg, img.naturalWidth, img.naturalHeight);
        gl.uniform1i(u("uTex"), 0);
        last = performance.now();
        raf = requestAnimationFrame(frame);
        requestAnimationFrame(() => requestAnimationFrame(() => !stopped && setLive(true)));
      };
      const w = window.innerWidth < 800 ? 1080 : 1920;
      img.src = `/_next/image?url=${encodeURIComponent("/media/agricultura/hero.webp")}&w=${w}&q=75`;

      const lost = (e: Event) => { e.preventDefault(); setLive(false); cancelAnimationFrame(raf); };
      cv.addEventListener("webglcontextlost", lost);

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        cv.removeEventListener("webglcontextlost", lost);
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      };
    };

    const kick = () => {
      const idle = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
      if (idle) idle(start, { timeout: 2500 });
      else window.setTimeout(start, 600);
    };
    if (document.readyState === "complete") kick();
    else window.addEventListener("load", kick, { once: true });

    return () => {
      stopped = true;
      window.removeEventListener("load", kick);
      cleanup?.();
      setLive(false);
    };
  }, [video, reduced]);

  const toggle = useCallback(() => {
    playingRef.current = !playingRef.current;
    setPlaying(playingRef.current);
  }, []);

  if (reduced) return null;

  return (
    <>
      <div ref={wrap} className={`ag-hero__motion${live || video ? " is-live" : ""}`} aria-hidden="true">
        {video ? (
          <video ref={videoEl} muted loop playsInline autoPlay preload="metadata" poster="/media/agricultura/hero.webp" disablePictureInPicture>
            {video.webm && <source src={video.webm} type="video/webm" />}
            {video.mp4 && <source src={video.mp4} type="video/mp4" />}
          </video>
        ) : (
          <>
            <canvas ref={canvas} />
            <canvas ref={drops} className="ag-hero__drops" />
          </>
        )}
      </div>
      <button type="button" className="ag-motion-toggle" onClick={toggle} aria-pressed={!playing} aria-label={playing ? t.motion.pause : t.motion.play} title={playing ? t.motion.pause : t.motion.play}>
        {playing ? <Pause aria-hidden="true" size={15} strokeWidth={2.2} /> : <Play aria-hidden="true" size={15} strokeWidth={2.2} />}
      </button>
    </>
  );
}
