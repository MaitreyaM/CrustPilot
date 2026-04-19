"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";

import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/ui/mini-navbar";
import { Textarea } from "@/components/ui/textarea";

export type HeroWaveProps = {
  className?: string;
  style?: React.CSSProperties;
  extendLeftPx?: number;
  title?: string;
  subtitle?: string;
  placeholder?: string;
  buttonText?: string;
  onPromptSubmit?: (value: string) => void;
  onPromptChange?: (value: string) => void;
  value?: string;
  showNavbar?: boolean;
  disabled?: boolean;
};

export function HeroWave({
  className,
  style,
  title = "Who are you looking for?",
  subtitle = "Use natural language to search people, refine the request conversationally, and save the strongest profiles as leads.",
  placeholder = "Describe the people you want to find...",
  buttonText = "Search",
  onPromptSubmit,
  onPromptChange,
  value,
  showNavbar = false,
  disabled = false,
}: HeroWaveProps) {
  const [internalPrompt, setInternalPrompt] = useState("");
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState("Find me a");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const prompt = value ?? internalPrompt;
  const basePlaceholder = "Find me a";
  const suggestionsRef = useRef<string[]>([
    " founder in San Francisco",
    " VP Sales at fintech startups",
    " product leader with AI experience",
    " technical recruiter at devtools companies",
    " operator from YC startups",
  ]);

  useEffect(() => {
    let running = true;
    let suggestionIndex = 0;
    let charIndex = 0;
    let deleting = false;
    const timers: number[] = [];

    const schedule = (fn: () => void, delay: number) => {
      const id = window.setTimeout(fn, delay);
      timers.push(id);
    };

    const step = () => {
      if (!running) return;
      if (prompt.trim() !== "") {
        setAnimatedPlaceholder(basePlaceholder);
        schedule(step, 250);
        return;
      }

      const current = suggestionsRef.current[suggestionIndex] ?? "";
      if (!deleting) {
        charIndex += 1;
        setAnimatedPlaceholder(basePlaceholder + current.slice(0, charIndex));
        if (charIndex >= current.length) {
          schedule(() => {
            deleting = true;
            step();
          }, 1100);
        } else {
          schedule(step, 55);
        }
      } else {
        charIndex = Math.max(0, charIndex - 1);
        setAnimatedPlaceholder(basePlaceholder + current.slice(0, charIndex));
        if (charIndex === 0) {
          deleting = false;
          suggestionIndex = (suggestionIndex + 1) % suggestionsRef.current.length;
          schedule(step, 420);
        } else {
          schedule(step, 34);
        }
      }
    };

    schedule(step, 450);

    return () => {
      running = false;
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [prompt]);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = canvasRef.current.clientWidth || 900;
    const height = canvasRef.current.clientHeight || 500;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.z = 24;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    canvasRef.current.appendChild(renderer.domElement);

    const pointsGeometry = new THREE.BufferGeometry();
    const pointsCount = 120;
    const positions = new Float32Array(pointsCount * 3);
    for (let i = 0; i < pointsCount; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 38;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    pointsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const pointsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.08,
      transparent: true,
      opacity: 0.14,
    });

    const points = new THREE.Points(pointsGeometry, pointsMaterial);
    scene.add(points);

    const timeline = gsap.timeline({ repeat: -1, yoyo: true });
    timeline.to(points.rotation, { y: 0.7, duration: 14, ease: "sine.inOut" });
    timeline.to(points.rotation, { x: 0.18, duration: 8, ease: "sine.inOut" }, 0);
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
    );

    let frameId = 0;
    const animate = () => {
      points.rotation.z += 0.0007;
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };
    animate();

    const resize = () => {
      const nextWidth = canvasRef.current?.clientWidth || width;
      const nextHeight = canvasRef.current?.clientHeight || height;
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
    };

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(frameId);
      timeline.kill();
      pointsGeometry.dispose();
      pointsMaterial.dispose();
      renderer.dispose();
      const canvasElement = canvasRef.current;
      if (canvasElement && renderer.domElement.parentNode === canvasElement) {
        canvasElement.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <section
      aria-label="AI input hero"
      className={className}
      ref={containerRef}
      style={{ position: "relative", width: "100%", minHeight: "62vh", ...style }}
    >
      {showNavbar ? <Navbar /> : null}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]"
        ref={canvasRef}
      />

      <div className="relative z-10 flex min-h-[62vh] items-center justify-center px-6 py-10">
        <div className="w-full max-w-3xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
            {title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/55 md:text-base">
            {subtitle}
          </p>

          <form
            className="mt-8"
            onSubmit={(event) => {
              event.preventDefault();
              if (!prompt.trim() || disabled) return;
              onPromptSubmit?.(prompt);
            }}
          >
            <div className="rounded-[28px] border border-white/10 bg-black/45 p-3 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
              <Textarea
                className="min-h-[120px] resize-none border-none bg-transparent text-white placeholder:text-white/30 focus-visible:ring-0"
                onChange={(event) => {
                  if (value === undefined) {
                    setInternalPrompt(event.target.value);
                  }
                  onPromptChange?.(event.target.value);
                }}
                placeholder={animatedPlaceholder || placeholder}
                value={prompt}
              />
              <div className="flex items-center justify-between px-2 pt-2">
                <div className="text-xs uppercase tracking-[0.22em] text-white/35">
                  Conversational people search
                </div>
                <Button className="rounded-2xl" disabled={disabled || !prompt.trim()} type="submit">
                  {buttonText}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
