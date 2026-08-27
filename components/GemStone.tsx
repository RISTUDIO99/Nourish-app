import React from "react";
import Svg, { Defs, LinearGradient, Stop, Polygon } from "react-native-svg";

type GemType = "emerald" | "sapphire" | "amethyst" | "diamond";

const GEM_CONFIG: Record<GemType, {
  colors: string[];
  facetColors: string[];
  shimmer: string;
}> = {
  emerald: {
    colors: ["#0d4d2e", "#1a7a45", "#0a3d24"],
    facetColors: ["#22a85e", "#15703d", "#0d4d2e", "#2dc96e", "#186b38"],
    shimmer: "#4fffaa",
  },
  sapphire: {
    colors: ["#0a1f5c", "#1a3fa8", "#071545"],
    facetColors: ["#2a5fd4", "#1a3fa8", "#0a1f5c", "#4a7fff", "#1630a0"],
    shimmer: "#80b0ff",
  },
  amethyst: {
    colors: ["#2d0a4e", "#6a1fa8", "#1e0733"],
    facetColors: ["#8b3fd4", "#6a1fa8", "#2d0a4e", "#a855e8", "#5a15a0"],
    shimmer: "#d4a0ff",
  },
  diamond: {
    colors: ["#1a1200", "#c9a227", "#0d0c00"],
    facetColors: ["#e8c84a", "#c9a227", "#8a6e10", "#f5d86a", "#a88520"],
    shimmer: "#fff5a0",
  },
};

interface GemStoneProps {
  type: GemType;
  size?: number;
}

export function GemStone({ type, size = 64 }: GemStoneProps) {
  const cfg = GEM_CONFIG[type];
  const s = size;
  const cx = s / 2;
  const cy = s / 2;

  // Facet points for an octagon gem (top-down view with facets)
  const outerR = s * 0.46;
  const innerR = s * 0.28;
  const midR = s * 0.37;

  function polarToCart(angle: number, r: number) {
    const rad = (angle - 90) * (Math.PI / 180);
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  }

  // 8 outer points
  const outer = Array.from({ length: 8 }, (_, i) => polarToCart(i * 45, outerR));
  // 8 mid points (offset 22.5°)
  const mid = Array.from({ length: 8 }, (_, i) => polarToCart(i * 45 + 22.5, midR));
  // inner octagon
  const inner = Array.from({ length: 8 }, (_, i) => polarToCart(i * 45, innerR));

  function pts(points: { x: number; y: number }[]) {
    return points.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
  }

  // Create 8 outer facets (outer[i] -> mid[i] -> inner[i] -> inner[i-1 mod 8] -> mid[(i+7) mod 8] -> outer[i])
  const outerFacets = outer.map((_, i) => {
    const ni = (i + 1) % 8;
    const pi = (i + 7) % 8;
    return [outer[i], mid[i], inner[i], inner[pi], mid[pi]];
  });

  // 8 side facets between outer points
  const sideFacets = outer.map((_, i) => {
    const ni = (i + 1) % 8;
    return [outer[i], outer[ni], mid[i]];
  });

  return (
    <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      <Defs>
        <LinearGradient id={`gemGrad_${type}`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={cfg.colors[1]} stopOpacity="1" />
          <Stop offset="0.5" stopColor={cfg.colors[0]} stopOpacity="1" />
          <Stop offset="1" stopColor={cfg.colors[2]} stopOpacity="1" />
        </LinearGradient>
        <LinearGradient id={`shimmer_${type}`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={cfg.shimmer} stopOpacity="0.7" />
          <Stop offset="1" stopColor={cfg.shimmer} stopOpacity="0" />
        </LinearGradient>
      </Defs>

      {/* Base shape */}
      <Polygon
        points={pts(outer)}
        fill={`url(#gemGrad_${type})`}
      />

      {/* Outer facets */}
      {outerFacets.map((facet, i) => (
        <Polygon
          key={`of${i}`}
          points={pts(facet)}
          fill={cfg.facetColors[i % cfg.facetColors.length]}
          opacity={0.7 + (i % 3) * 0.1}
        />
      ))}

      {/* Side facets */}
      {sideFacets.map((facet, i) => (
        <Polygon
          key={`sf${i}`}
          points={pts(facet)}
          fill={cfg.facetColors[(i + 2) % cfg.facetColors.length]}
          opacity={0.55 + (i % 2) * 0.15}
        />
      ))}

      {/* Center table facet */}
      <Polygon
        points={pts(inner)}
        fill={cfg.colors[1]}
        opacity={0.9}
      />

      {/* Shimmer highlight — top-left area */}
      <Polygon
        points={pts([outer[7], outer[0], outer[1], mid[0], inner[0], inner[7]])}
        fill={`url(#shimmer_${type})`}
        opacity={0.5}
      />

      {/* Center sparkle dot */}
      <Polygon
        points={pts(inner.slice(0, 4))}
        fill={cfg.shimmer}
        opacity={0.25}
      />
    </Svg>
  );
}
