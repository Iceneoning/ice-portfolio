import source from '../shaders/winter-crystal.frag?raw';
import { crystalBranches } from '../lib/crystal-geometry';

const field = crystalBranches.map(({ a, b, width }) =>
  `d=min(d,blade(q,vec2(${a.map((v) => v.toFixed(5)).join(',')}),vec2(${b.map((v) => v.toFixed(5)).join(',')}),${width.toFixed(5)}));`).join('\n');
const fragmentSource = source.replace('// __BRANCH_FIELD__', field);
const vertexSource = 'attribute vec2 a_position; void main(){gl_Position=vec4(a_position,0.0,1.0);}';

export function initializeCrystals() {
  document.querySelectorAll<HTMLElement>('[data-crystal]').forEach(initialize);
}

function initialize(view: HTMLElement) {
  const canvas = view.querySelector<HTMLCanvasElement>('canvas');
  const button = view.parentElement?.querySelector<HTMLButtonElement>('.crystal-control');
  if (!canvas || !button || view.dataset.crystalState) return;
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  view.dataset.crystalState = 'fallback';
  // Motion reduction uses the matching static SVG, without allocating a context.
  if (media.matches) return;
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false,
    premultipliedAlpha: false, powerPreference: 'low-power', preserveDrawingBuffer: false });
  if (!gl) return;
  const shaders: WebGLShader[] = [];
  let program: WebGLProgram | null = null, buffer: WebGLBuffer | null = null;
  let raf = 0, visible = true, paused = false, lost = false, stopped = false;
  let lastDraw = 0, opticalTime = 0, frames = 0;
  let pointerX = 0, pointerY = 0;
  const cleanupGpu = () => {
    if (program) gl.deleteProgram(program);
    if (buffer) gl.deleteBuffer(buffer);
    shaders.forEach((shader) => gl.deleteShader(shader));
  };
  try {
    for (const [type, text] of [[gl.VERTEX_SHADER, vertexSource], [gl.FRAGMENT_SHADER, fragmentSource]] as const) {
      const shader = gl.createShader(type);
      if (!shader) throw new Error('shader allocation');
      shaders.push(shader); gl.shaderSource(shader, text); gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? 'shader compilation');
    }
    program = gl.createProgram();
    if (!program) throw new Error('program allocation');
    shaders.forEach((shader) => gl.attachShader(program!, shader)); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? 'program link');
    gl.useProgram(program);
    buffer = gl.createBuffer();
    if (!buffer) throw new Error('buffer allocation');
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  } catch (error) {
    console.warn('Winter crystal: static artwork retained.', error);
    cleanupGpu(); return;
  }
  const resolution = gl.getUniformLocation(program, 'u_resolution');
  const pointer = gl.getUniformLocation(program, 'u_pointer');
  const time = gl.getUniformLocation(program, 'u_time');
  const stop = () => { cancelAnimationFrame(raf); raf = 0; lastDraw = 0; };
  const draw = () => {
    if (lost || stopped) return;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(resolution, canvas.width, canvas.height);
    gl.uniform2f(pointer, pointerX, pointerY); gl.uniform1f(time, opticalTime);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    view.dataset.crystalFrames = String(++frames);
  };
  const tick = (stamp: number) => {
    raf = 0;
    if (paused || !visible || document.hidden || lost || stopped || media.matches) return;
    if (!lastDraw || stamp - lastDraw >= 1000 / 24) {
      opticalTime += lastDraw ? Math.min((stamp - lastDraw) / 1000, 0.1) : 0;
      lastDraw = stamp; draw();
    }
    raf = requestAnimationFrame(tick);
  };
  const start = () => {
    if (!raf && !paused && visible && !document.hidden && !lost && !stopped && !media.matches) raf = requestAnimationFrame(tick);
  };
  const resize = () => {
    const size = Math.min(760, Math.max(1, Math.round(view.clientWidth * 1.25)));
    if (canvas.width !== size || canvas.height !== size) { canvas.width = size; canvas.height = size; }
    draw();
  };
  resize();
  if (gl.getError() !== gl.NO_ERROR) { cleanupGpu(); return; }
  view.dataset.crystalState = 'ready'; button.hidden = false;
  const observer = new IntersectionObserver(([entry]) => { visible = entry?.isIntersecting ?? false; visible ? start() : stop(); });
  observer.observe(view);
  const sizing = new ResizeObserver(resize); sizing.observe(view);
  const hero = view.closest<HTMLElement>('.hero');
  const move = (event: PointerEvent) => {
    if (paused || media.matches) return;
    const bounds = view.getBoundingClientRect();
    pointerX = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
    pointerY = Math.max(-1, Math.min(1, 1 - (event.clientY - bounds.top) / bounds.height * 2));
  };
  hero?.addEventListener('pointermove', move, { passive: true });
  button.addEventListener('click', () => {
    paused = !paused; button.setAttribute('aria-pressed', String(paused));
    button.textContent = paused ? '继续光影' : '暂停光影';
    view.dataset.crystalState = paused ? 'paused' : 'ready'; paused ? stop() : start();
  });
  const visibility = () => document.hidden ? stop() : start();
  document.addEventListener('visibilitychange', visibility);
  const preference = () => {
    if (media.matches) { stop(); view.dataset.crystalState = 'fallback'; button.hidden = true; }
    else { view.dataset.crystalState = paused ? 'paused' : 'ready'; button.hidden = false; start(); }
  };
  media.addEventListener('change', preference);
  canvas.addEventListener('webglcontextlost', () => {
    lost = true; stop(); view.dataset.crystalState = 'fallback'; button.hidden = true;
  });
  // A lost context stays on the static art; no repeated allocations or retry loop.
  const pagehide = (event: PageTransitionEvent) => {
    stop();
    if (!event.persisted) {
      stopped = true; observer.disconnect(); sizing.disconnect(); cleanupGpu();
      hero?.removeEventListener('pointermove', move);
      document.removeEventListener('visibilitychange', visibility); media.removeEventListener('change', preference);
    }
  };
  addEventListener('pagehide', pagehide);
  addEventListener('pageshow', start);
  start();
}
