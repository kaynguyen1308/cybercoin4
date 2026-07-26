import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Camera physics controller for the Crew Database.
 *
 * Pipeline:
 *   wheel → Lenis → ScrollTrigger.progress → targetOffset
 *     → physics (velocity + friction + damping) → currentOffset
 *     → translateZ / opacity / text reveal
 *
 * The physics is a critically-damped first-order system (NOT a spring, NOT a
 * nested LERP). It tracks the target with momentum so the image keeps drifting
 * a hair forward after the user stops, then settles — like a heavy cinematic
 * camera. No overshoot, no bounce.
 *
 * Tuned constants:
 *   STIFFNESS — how hard the camera pulls toward target (higher = snappier)
 *   DAMPING   — velocity decay (higher = less glide)
 *
 * Critical damping (no overshoot) requires DAMPING = 2 * sqrt(STIFFNESS).
 * We keep a touch of sub-critical glide by staying just above critical.
 */

const STIFFNESS = 90;   // pull toward target
const DAMPING = 20;     // velocity friction (> 2*sqrt(90) ≈ 18.97 → no overshoot)
const SUBSTEP = 1 / 120; // fixed physics timestep (s)

export interface CameraState {
  position: number; // current camera offset (px)
  velocity: number; // px/s
}

export interface CameraController {
  setTarget: (t: number) => void;
  state: CameraState;
  kill: () => void;
}

export function createCameraController(
  initial: number,
  onUpdate: (offset: number) => void,
): CameraController {
  const state: CameraState = { position: initial, velocity: 0 };
  let target = initial;
  let raf = 0;
  let last = performance.now();
  let acc = 0;

  const step = (now: number) => {
    raf = requestAnimationFrame(step);
    let dt = (now - last) / 1000;
    last = now;
    if (dt > 0.05) dt = 0.05; // clamp huge gaps (tab switch)

    acc += dt;
    while (acc >= SUBSTEP) {
      // Spring-damper: a = -k(x - target) - c*v
      const accel = STIFFNESS * (target - state.position) - DAMPING * state.velocity;
      state.velocity += accel * SUBSTEP;
      state.position += state.velocity * SUBSTEP;
      acc -= SUBSTEP;
    }

    onUpdate(state.position);
  };
  raf = requestAnimationFrame(step);

  return {
    state,
    setTarget: (t: number) => { target = t; },
    kill: () => cancelAnimationFrame(raf),
  };
}

/**
 * Hook: binds a ScrollTrigger to a physics-driven camera.
 *
 * `mapProgress` converts ScrollTrigger progress (0..1) into a target camera
 * offset. The controller then eases toward that target with momentum, and
 * `onUpdate` is called every frame with the realized offset.
 */
export function useCameraScroll(
  triggerEl: React.RefObject<HTMLElement | null>,
  mapProgress: (p: number) => number,
  onCameraUpdate: (offset: number) => void,
) {
  const controllerRef = useRef<CameraController | null>(null);

  useEffect(() => {
    const el = triggerEl.current;
    if (!el) return;

    const controller = createCameraController(0, onCameraUpdate);
    controllerRef.current = controller;

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        controller.setTarget(mapProgress(self.progress));
      },
    });

    return () => {
      trigger.kill();
      controller.kill();
      controllerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return controllerRef;
}
