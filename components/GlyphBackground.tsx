"use client";

import { useEffect, useRef } from "react";

/*
  Faint wall of code behind the hero, rendered with WebGL:
  - ~2.5% ink everywhere, 4 slowly breathing "islands"
  - a drifting cloud mask
  - mouse torch (86x48 ellipse) with a short fading trail
  - click ripples (wobbly expanding rings)
  The <pre> is the no-WebGL / SSR fallback.
*/

const VERT = `
attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform sampler2D atlas;
uniform vec2 size;
uniform vec2 cell;
uniform float dpr;
uniform float time;
uniform float rest;
uniform float haze;
uniform float hoverInk;
uniform vec3 pointer;
uniform float activity;
uniform vec2 drift;
uniform vec3 color;
uniform vec4 waves[12];
uniform vec4 trail[8];

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

void main() {
  vec2 pixel = vec2(gl_FragCoord.x, size.y - gl_FragCoord.y);
  vec2 index = floor(pixel / cell);
  vec2 point = (index + 0.5) * cell / dpr;

  // click ripples
  float ring = 0.0;
  for (int i = 0; i < 6; i++) {
    vec4 a = waves[i * 2];
    vec4 b = waves[i * 2 + 1];
    if (a.w <= 0.0) continue;
    vec2 v = point - a.xy;
    float ang = atan(-v.y, v.x);
    float shape = 1.0 + 0.07 * sin(3.0 * ang + b.z + b.w) + 0.05 * sin(5.0 * ang - b.z * 1.7 - b.w * 1.3) + 0.03 * sin(9.0 * ang + b.w * 2.1);
    float d = length(v) - a.z * shape;
    float k = d > 0.0 ? d / 14.0 : d / 42.0;
    ring = max(ring, exp(-k * k) * a.w);
  }

  // pointer torch + trail
  float focus = length((point - pointer.xy) / vec2(86.0, 48.0));
  float hover = pointer.z * (1.0 - smoothstep(0.12, 1.0, focus));
  for (int i = 0; i < 8; i++) {
    vec4 t = trail[i];
    if (t.w <= 0.0) continue;
    vec2 v = point - t.xy;
    hover += t.w * exp(-dot(v, v) / (2.0 * t.z * t.z));
  }
  hover = min(hover, 1.0);

  // drifting cloud mask
  mat2 turn = mat2(0.82, 0.57, -0.57, 0.82);
  vec2 q = turn * (point - drift);
  float blob = noise(vec2(q.x / 140.0, q.y / 80.0) + vec2(time * 0.04, 0.0)) * 0.62
             + noise(vec2(q.x / 62.0, q.y / 36.0) + vec2(3.7, time * 0.06)) * 0.38;
  float grain = noise(vec2(q.x / 30.0, q.y / 14.0) + vec2(time * 0.2, 7.3));
  float cloud = blob * (0.82 + 0.24 * grain);
  float mask = pow(smoothstep(0.47 - 0.2 * activity, 0.84, cloud), 2.6);

  float ink = texture2D(atlas, pixel / size).a;

  // quiet islands that stay visible without a pointer
  vec2 viewport = size / dpr;
  vec2 patchSize = vec2(min(110.0, viewport.x * 0.23), 38.0);
  vec2 pa = (point - viewport * vec2(0.16, 0.22)) / patchSize;
  vec2 pb = (point - viewport * vec2(0.83, 0.36)) / patchSize;
  vec2 pc = (point - viewport * vec2(0.22, 0.77)) / patchSize;
  vec2 pd = (point - viewport * vec2(0.84, 0.82)) / patchSize;
  float idle = max(
    max(exp(-dot(pa, pa)) * (0.8 + 0.15 * sin(time * 0.18)),
        exp(-dot(pb, pb)) * (0.8 + 0.15 * sin(time * 0.18 + 1.6))),
    max(exp(-dot(pc, pc)) * (0.8 + 0.15 * sin(time * 0.18 + 3.2)),
        exp(-dot(pd, pd)) * (0.8 + 0.15 * sin(time * 0.18 + 4.8))));

  float grey = ink * clamp(rest + 0.075 * idle + haze * mask * (1.0 + 0.3 * activity) + hoverInk * hover * (0.9 + 0.1 * mask), 0.0, 1.0);
  float blue = ink * ring * 0.10;
  float alpha = grey + blue - grey * blue;
  vec3 tint = color * grey * (1.0 - blue) + color * blue;
  gl_FragColor = vec4(tint, alpha);
}
`;

type Pt = { x: number; y: number; at: number };

export function GlyphBackground({ code, fontSize = 12, className = "" }: { code: string; fontSize?: number; className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) return;

    const shaders: WebGLShader[] = [];
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type);
      if (!s) return null;
      shaders.push(s);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    const program = gl.createProgram();
    if (!vs || !fs || !program) { shaders.forEach((s) => gl.deleteShader(s)); return; }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { shaders.forEach((s) => gl.deleteShader(s)); gl.deleteProgram(program); return; }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const names = ["atlas", "size", "cell", "dpr", "time", "rest", "haze", "hoverInk", "pointer", "activity", "drift", "color", "waves[0]", "trail[0]"];
    const u = Object.fromEntries(names.map((n) => [n, gl.getUniformLocation(program, n)])) as Record<string, WebGLUniformLocation | null>;
    gl.uniform1i(u.atlas, 0);
    gl.uniform1f(u.rest, 0.025);
    gl.uniform1f(u.haze, 0.08);
    gl.uniform1f(u.hoverInk, 0.38);

    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const atlas = document.createElement("canvas");
    const actx = atlas.getContext("2d");
    const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });

    let w = 0, h = 0, dpr = 1, time = 0, raf = 0, last = 0;
    let visible = false, destroyed = false, lost = false;
    let pointer: { x: number; y: number } | null = null;
    let client: { x: number; y: number } | null = null;
    let ripples: Pt[] = [];
    let trail: Pt[] = [];
    const waveData = new Float32Array(48);
    const trailData = new Float32Array(32);

    const setColor = () => {
      if (!probe) return;
      probe.fillStyle = getComputedStyle(host).color;
      probe.fillRect(0, 0, 1, 1);
      const d = probe.getImageData(0, 0, 1, 1).data;
      gl.uniform3f(u.color, d[0] / 255, d[1] / 255, d[2] / 255);
    };

    const render = () => {
      if (destroyed || lost || !w || !h) return;
      waveData.fill(0);
      ripples = ripples.filter((r) => time - r.at < 4);
      ripples.forEach((r, i) => {
        const age = time - r.at;
        const strength = Math.min(1, age / 0.08) * Math.exp(-age / 1.3) * Math.min(1, (4 - age) / 0.5);
        waveData.set([r.x, r.y, (420 * age) / (1 + 0.4 * age), strength, 0, 0, 0, i * 1.7], 8 * i);
      });
      trailData.fill(0);
      trail = trail.filter((t) => time - t.at < 0.45);
      trail.forEach((t, i) => {
        const p = (time - t.at) / 0.45;
        trailData.set([t.x, t.y, 28, 0.18 * (1 - p) ** 2], 4 * i);
      });
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(u.size, canvas.width, canvas.height);
      gl.uniform2f(u.cell, 8 * dpr, 18 * dpr);
      gl.uniform1f(u.dpr, dpr);
      gl.uniform1f(u.time, time);
      gl.uniform3f(u.pointer, pointer?.x ?? -1000, pointer?.y ?? -1000, pointer ? 1 : 0);
      gl.uniform1f(u.activity, trail.length / 8);
      gl.uniform2f(u.drift, -8 * time, 4 * time);
      gl.uniform4fv(u["waves[0]"], waveData);
      gl.uniform4fv(u["trail[0]"], trailData);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    // draw the code text into an offscreen canvas, upload as a texture
    const layout = () => {
      if (destroyed || lost || !actx) return;
      const rect = host.getBoundingClientRect();
      w = rect.width; h = rect.height;
      dpr = Math.min(devicePixelRatio || 1, 1.5, Math.sqrt(1.5e6 / Math.max(1, w * h)));
      canvas.width = atlas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = atlas.height = Math.max(1, Math.round(h * dpr));
      actx.setTransform(dpr, 0, 0, dpr, 0, 0);
      actx.clearRect(0, 0, w, h);
      actx.fillStyle = "white";
      actx.font = `400 ${fontSize}px ${getComputedStyle(host).fontFamily}`;
      actx.textBaseline = "top";
      const lineH = 1.7 * fontSize;
      const rows = Math.ceil(h / lineH);
      const cols = Math.max(1, Math.floor(w / 370));
      const colW = w / cols;
      const maxW = Math.max(1, colW - 40);
      const measure = (s: string) => actx.measureText(s).width;
      const lines = code.split("\n").flatMap((line) => {
        const out: string[] = [];
        let wrapped = false;
        while (line && measure(`${wrapped ? "  " : ""}${line}`) > maxW) {
          const pre = wrapped ? "  " : "";
          let cut = line.length;
          while (cut > 1 && measure(pre + line.slice(0, cut)) > maxW) cut--;
          const sp = line.lastIndexOf(" ", cut);
          if (sp > cut / 2) cut = sp;
          out.push(pre + line.slice(0, cut));
          line = line.slice(cut).trimStart();
          wrapped = true;
        }
        return [...out, `${wrapped && line ? "  " : ""}${line}`];
      });
      const top = w <= 700 ? 112 : 12;
      for (let c = 0; c < cols; c++) {
        actx.save();
        actx.beginPath();
        actx.rect(c * colW + 20, 0, colW - 40, h);
        actx.clip();
        for (let r = 0; r < rows; r++) actx.fillText(lines[(r + c * rows) % lines.length], c * colW + 20, top + r * lineH);
        actx.restore();
      }
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas);
      setColor();
      render();
      host.dataset.renderer = "webgl";
    };

    const frame = (now: number) => {
      if (now - last >= 1000 / 30) {
        time += last ? Math.min((now - last) / 1000, 0.064) : 0;
        last = now;
        render();
      }
      raf = requestAnimationFrame(frame);
    };
    const sync = () => {
      cancelAnimationFrame(raf); raf = 0; last = 0;
      const animate = visible && !document.hidden && !reduce.matches && !lost;
      host.dataset.animated = String(animate);
      if (animate) raf = requestAnimationFrame(frame);
      else {
        ripples = []; trail = [];
        if (!visible || document.hidden) pointer = null;
        if (visible && !document.hidden) render();
      }
    };
    const local = (e: PointerEvent): Pt => {
      const r = host.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top, at: time };
    };
    const updatePointer = () => {
      const r = host.getBoundingClientRect();
      const x = (client?.x ?? -1000) - r.left;
      const y = (client?.y ?? -1000) - r.top;
      pointer = client && x >= 0 && x <= r.width && y >= 0 && y <= r.height ? { x, y } : null;
      if (reduce.matches) render();
    };
    const onMove = (e: PointerEvent) => {
      if (!visible) return;
      client = e.pointerType === "touch" ? null : { x: e.clientX, y: e.clientY };
      updatePointer();
      if (reduce.matches) return;
      const p = local(e);
      const prev = trail.at(-1);
      if (p.x < 0 || p.x > w || p.y < 0 || p.y > h || (prev && Math.hypot(p.x - prev.x, p.y - prev.y) < 14)) return;
      trail = [...trail.slice(-7), p];
    };
    const onDown = (e: PointerEvent) => {
      if (reduce.matches || !visible) return;
      const p = local(e);
      if (p.x >= 0 && p.x <= w && p.y >= 0 && p.y <= h) ripples = [...ripples.slice(-5), p];
    };
    const onLeave = () => { client = null; pointer = null; if (reduce.matches) render(); };
    const onLost = () => { lost = true; host.dataset.renderer = "fallback"; sync(); };

    const ro = new ResizeObserver(layout);
    ro.observe(host);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); });
    io.observe(host);
    const mo = new MutationObserver(() => { setColor(); render(); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    window.addEventListener("pointermove", onMove, { passive: true, capture: true });
    window.addEventListener("pointerdown", onDown, { passive: true, capture: true });
    window.addEventListener("scroll", updatePointer, { passive: true });
    window.addEventListener("blur", onLeave);
    document.documentElement.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("webglcontextlost", onLost);
    reduce.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    layout();
    document.fonts.ready.then(() => { if (!destroyed) layout(); });

    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect(); mo.disconnect();
      window.removeEventListener("pointermove", onMove, true);
      window.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("scroll", updatePointer);
      window.removeEventListener("blur", onLeave);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("webglcontextlost", onLost);
      reduce.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      gl.deleteTexture(tex); gl.deleteBuffer(buffer); gl.deleteProgram(program);
      shaders.forEach((s) => gl.deleteShader(s));
    };
  }, [code, fontSize]);

  return (
    <div ref={hostRef} className={`glyph-background ${className}`} aria-hidden="true">
      <pre className="glyph-code-fallback">{code}</pre>
      <canvas ref={canvasRef} />
    </div>
  );
}
