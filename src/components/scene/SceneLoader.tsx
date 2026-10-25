"use client";

import { Component, type ReactNode } from "react";
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
  return (
    <div aria-hidden className="scene-layer pointer-events-none fixed inset-0 z-0">
      <WebGLBoundary>
        <SceneCanvas />
      </WebGLBoundary>
    </div>
  );
}
