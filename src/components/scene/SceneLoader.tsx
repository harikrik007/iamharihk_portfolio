"use client";

import { Component, useEffect, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";

const SceneCanvas = dynamic(() => import("./SceneCanvas"), { ssr: false });

// If WebGL is unavailable the page still works; it just loses the 3D layer.
class WebGLBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function SceneLoader() {
  // Mount three.js once the browser is idle after the first paint, so the text
  // paints and responds first. The layer fades in anyway, so nobody sees the wait.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const start = () => setReady(true);
    const hasIdle = typeof window.requestIdleCallback === "function";
    const id = hasIdle ? window.requestIdleCallback(start, { timeout: 1200 }) : window.setTimeout(start, 300);
    return () => (hasIdle ? window.cancelIdleCallback(id) : window.clearTimeout(id));
  }, []);

  return (
    <div aria-hidden className="scene-layer pointer-events-none fixed inset-0 z-0">
      {ready && (
        <WebGLBoundary>
          <SceneCanvas />
        </WebGLBoundary>
      )}
    </div>
  );
}
