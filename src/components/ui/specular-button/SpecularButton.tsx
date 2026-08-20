import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Renderer, Program, Mesh, Triangle, Color } from "ogl";
import "./SpecularButton.css";

const PAD = 48;

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform vec2 uCenter;
uniform vec2 uHalfSize;
uniform float uRadius;
uniform float uAngle;
uniform float uPx;
uniform vec3 uLineColor;
uniform vec3 uBaseColor;
uniform float uIntensity;
uniform float uShineSize;
uniform float uShineFade;
uniform float uThickness;
uniform float uBaseWidth;
uniform float uGlowScale;

out vec4 fragColor;

float sdRoundedRect(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float shapeSDF(vec2 p) { return sdRoundedRect(p, uHalfSize, uRadius); }

float gaussianLine(float d, float sigma) {
  float x = d / (sigma + 1e-6);
  float k = mix(1.0, 1.6, smoothstep(0.0, 1.5, x));
  return exp(-k * x * x);
}

void main() {
  vec2 p = gl_FragCoord.xy - uCenter;
  float d = shapeSDF(p);
  vec2 L = vec2(cos(uAngle), sin(uAngle));

  // Dark base stroke hugging the edge for a sense of thickness
  float base = (1.0 - smoothstep(0.0, uBaseWidth, abs(d))) * 0.45;

  // Symmetric specular: the edges facing toward/away from the light both
  // catch a streak. The angular window (size + fade) is measured with an
  // elliptical normal so it varies continuously along straight edges.
  vec2 nEll = normalize(p / (uHalfSize * uHalfSize) + 1e-6);
  float phi = acos(clamp(abs(dot(nEll, L)), 0.0, 1.0));
  float rim = 1.0 - smoothstep(uShineSize - uShineFade, uShineSize + uShineFade + 1e-4, phi);
  float line = gaussianLine(d, uThickness);
  float edgeClamp = 1.0 - smoothstep(0.5 * uPx, 10.0 * uPx, abs(d));
  float hi = line * rim * edgeClamp * uIntensity;

  // Halo / shadow spill outside the shape, tinted with the shine color and
  // following the same angular direction so it reads as the shine's shadow.
  float glow = smoothstep(0.0, 2.0 * uPx, d) * exp(-d * 0.09) * rim * uGlowScale * uIntensity;

  vec3 col = uBaseColor * base + uLineColor * hi + uLineColor * glow;
  float a = clamp(base + hi + glow, 0.0, 1.0);
  fragColor = vec4(col, a);
}
`;

type SpecularButtonProps = {
  children?: ReactNode;
  size?: "sm" | "md" | "lg";
  radius?: number;
  tint?: string;
  tintOpacity?: number;
  background?: string;
  blur?: number;
  textColor?: string;
  lineColor?: string;
  baseColor?: string;
  intensity?: number;
  shineSize?: number;
  shineFade?: number;
  thickness?: number;
  speed?: number;
  followMouse?: boolean;
  autoAnimate?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
};

type ShaderProps = {
  radius: number;
  lineColor: string;
  baseColor: string;
  intensity: number;
  shineSize: number;
  shineFade: number;
  thickness: number;
  speed: number;
  followMouse: boolean;
  autoAnimate: boolean;
};

export function SpecularButton({
  children = "Create with AI",
  size = "lg",
  radius = 18,
  tint = "#ffffff",
  tintOpacity = 0,
  background,
  blur = 0,
  textColor = "#f5f5f5",
  lineColor = "#ffffff",
  baseColor = "#525252",
  intensity = 1,
  shineSize = 10,
  shineFade = 40,
  thickness = 1,
  speed = 0.35,
  followMouse = true,
  autoAnimate = false,
  disabled = false,
  onClick,
  className = "",
  type = "button",
}: SpecularButtonProps) {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const fxRef = useRef<HTMLSpanElement | null>(null);
  const propsRef = useRef<ShaderProps>({
    radius,
    lineColor,
    baseColor,
    intensity,
    shineSize,
    shineFade,
    thickness,
    speed,
    followMouse,
    autoAnimate,
  });

  useEffect(() => {
    propsRef.current = {
      radius,
      lineColor,
      baseColor,
      intensity,
      shineSize,
      shineFade,
      thickness,
      speed,
      followMouse,
      autoAnimate,
    };
  });

  useEffect(() => {
    const btn = btnRef.current;
    const fx = fxRef.current;
    if (!btn || !fx) return;

    const dpr = window.devicePixelRatio || 1;

    let init: { r: Renderer; m: Mesh; prog: Program; glc: Renderer["gl"] } | undefined;

    try {
      const renderer = new Renderer({
        alpha: true,
        premultipliedAlpha: true,
        antialias: true,
        dpr,
      });
      const gl = renderer.gl;
      gl.clearColor(0, 0, 0, 0);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

      const geometry = new Triangle(gl);
      if (geometry.attributes.uv) delete geometry.attributes.uv;

      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          uCenter: { value: [0, 0] },
          uHalfSize: { value: [1, 1] },
          uRadius: { value: 0 },
          uAngle: { value: 2.4 },
          uPx: { value: dpr },
          uLineColor: { value: [1, 1, 1] },
          uBaseColor: { value: [0.32, 0.32, 0.32] },
          uIntensity: { value: 1 },
          uShineSize: { value: 0.17 },
          uShineFade: { value: 0.7 },
          uThickness: { value: 1 },
          uBaseWidth: { value: dpr },
          uGlowScale: { value: 0.42 },
        },
      });

      const mesh = new Mesh(gl, { geometry, program });
      fx.appendChild(gl.canvas);
      init = { r: renderer, m: mesh, prog: program, glc: gl };
    } catch {
      return;
    }

    if (!init) return;
    const { r, m, prog, glc } = init;

    const sizeRef = { w: 1, h: 1 };
    const resize = () => {
      const rect = btn.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      sizeRef.w = w;
      sizeRef.h = h;
      r.setSize(w + PAD * 2, h + PAD * 2);
      prog.uniforms.uCenter.value = [(PAD + w / 2) * dpr, (PAD + h / 2) * dpr];
      prog.uniforms.uHalfSize.value = [(w / 2) * dpr, (h / 2) * dpr];
    };
    const ro = new ResizeObserver(resize);
    ro.observe(btn);
    resize();

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let hovering = false;
    let pointerAngle: number | null = null;
    const onPointerMove = (e: PointerEvent) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = Math.max(rect.left - e.clientX, 0, e.clientX - rect.right);
      const dy = Math.max(rect.top - e.clientY, 0, e.clientY - rect.bottom);
      const dist = Math.hypot(dx, dy);
      hovering = dist === 0;
      if (dist === 0) {
        const nx = (e.clientX - cx) / (rect.width / 2);
        const ny = (cy - e.clientY) / (rect.height / 2);
        pointerAngle = Math.atan2(2 / rect.height, -2 / rect.width) + nx * 0.3 + ny * 0.15;
      } else {
        pointerAngle = Math.atan2(cy - e.clientY, e.clientX - cx);
      }
      if (!running) update(performance.now());
    };
    window.addEventListener("pointermove", onPointerMove);

    let angle = 2.4;
    let idleAngle = 2.4;
    let bright = 0;
    let last = performance.now();
    let raf = 0;
    let running = false;

    const lineC = new Color();
    const baseC = new Color();

    const update = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const p = propsRef.current;

      idleAngle = (idleAngle + p.speed * dt) % (Math.PI * 2);
      // Lock the shine direction (stop sweeping) only while actually hovering,
      // so nearing the button never changes the rotation.
      const lock = p.followMouse && pointerAngle != null && hovering;
      const target = lock && pointerAngle != null ? pointerAngle : idleAngle;
      const diff = Math.atan2(Math.sin(target - angle), Math.cos(target - angle));
      angle += diff * (1 - Math.exp(-dt * 7));
      angle = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

      // Light idle shine while the sweep rotates; full on hover (locked).
      const brightTarget = p.autoAnimate ? 1 : hovering ? 1 : 0.2;
      bright += (brightTarget - bright) * (1 - Math.exp(-dt * 8));

      lineC.set(p.lineColor);
      baseC.set(p.baseColor);
      prog.uniforms.uAngle.value = angle;
      prog.uniforms.uRadius.value = Math.min(p.radius, Math.min(sizeRef.w, sizeRef.h) / 2) * dpr;
      prog.uniforms.uLineColor.value = [lineC.r, lineC.g, lineC.b];
      prog.uniforms.uBaseColor.value = [baseC.r, baseC.g, baseC.b];
      prog.uniforms.uIntensity.value = p.intensity * bright;
      prog.uniforms.uShineSize.value = (p.shineSize * Math.PI) / 180;
      prog.uniforms.uShineFade.value = (p.shineFade * Math.PI) / 180;
      prog.uniforms.uThickness.value = p.thickness * dpr;
      r.render({ scene: m });
    };

    const tick = (now: number) => {
      update(now);
      if (running) raf = requestAnimationFrame(tick);
    };

    const stopLoop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const startLoop = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };

    let inView = false;
    const io = new IntersectionObserver((entries) => {
      inView = entries[0]?.isIntersecting ?? false;
      updateRunning();
    });
    io.observe(btn);

    const onVisibilityChange = () => {
      updateRunning();
    };

    const updateRunning = () => {
      const shouldRun = inView && document.visibilityState === "visible" && !reducedMotion;
      if (shouldRun) {
        startLoop();
      } else {
        stopLoop();
      }
    };
    window.addEventListener("visibilitychange", onVisibilityChange);
    updateRunning();

    return () => {
      stopLoop();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("visibilitychange", onVisibilityChange);
      ro.disconnect();
      io.disconnect();
      if (glc.canvas.parentNode === fx) fx.removeChild(glc.canvas);
      glc.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <button
      ref={btnRef}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`specular-button specular-button--${size}${className ? ` ${className}` : ""}`}
      style={
        {
          "--sb-radius": `${radius}px`,
          "--sb-tint": tint,
          "--sb-tint-opacity": tintOpacity,
          "--sb-blur": `${blur}px`,
          "--sb-text-color": textColor,
          ...(background ? { background } : {}),
        } as CSSProperties
      }
    >
      <span ref={fxRef} className="specular-button__fx" aria-hidden="true" />
      <span className="specular-button__label">{children}</span>
    </button>
  );
}