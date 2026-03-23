'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import type { NodeObject, LinkObject } from 'react-force-graph-2d';
import { cn } from '@/lib/utils';
import { CHART_COLORS } from './chart-colors';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

interface NetworkGraphProps {
  nodes: {
    did: string;
    handle: string;
    displayName: string;
    avatar: string | null;
    degree: number;
  }[];
  edges: { source: string; target: string; mutual: boolean }[];
  className?: string;
}

type GNode = NodeObject;
type GLink = LinkObject;

interface HoveredInfo {
  handle: string;
  displayName: string;
  degree: number;
}

export function NetworkGraph({ nodes, edges, className }: NetworkGraphProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<HoveredInfo | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 500 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setDimensions({
          width: entry.contentRect.width,
          height: Math.max(320, Math.min(500, entry.contentRect.width * 0.7)),
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [mounted]);

  const isDark = resolvedTheme === 'dark';
  const colors = isDark ? CHART_COLORS.dark : CHART_COLORS.light;

  const graphData = {
    nodes: nodes.map((n) => ({
      id: n.did,
      handle: n.handle,
      displayName: n.displayName,
      degree: n.degree,
    })),
    links: edges.map((e) => ({
      source: e.source,
      target: e.target,
      mutual: e.mutual,
    })),
  };

  const nodeCanvasObject = useCallback(
    (node: GNode, ctx: CanvasRenderingContext2D) => {
      const degree = (node.degree as number) ?? 1;
      const size = Math.max(4, Math.min(16, degree * 2));
      const color = colors[Math.abs(hashCode(String(node.id ?? ''))) % colors.length];
      ctx.beginPath();
      ctx.arc(node.x ?? 0, node.y ?? 0, size, 0, 2 * Math.PI);
      ctx.fillStyle = color as string;
      ctx.fill();
    },
    [colors],
  );

  const linkColor = useCallback(
    (link: GLink) => {
      const base = isDark ? 'rgba(255,255,255,' : 'rgba(0,0,0,';
      return link.mutual ? `${base}0.3)` : `${base}0.12)`;
    },
    [isDark],
  );

  const linkWidth = useCallback((link: GLink) => (link.mutual ? 1.5 : 0.5), []);

  if (!nodes.length) return null;

  if (!mounted) {
    return <div ref={containerRef} className={cn('min-h-[320px] md:min-h-[500px]', className)} />;
  }

  return (
    <div ref={containerRef} className={cn('relative min-h-[320px] md:min-h-[500px]', className)}>
      <div aria-hidden="true">
        <ForceGraph2D
          graphData={graphData}
          width={dimensions.width}
          height={dimensions.height}
          nodeCanvasObject={nodeCanvasObject}
          nodePointerAreaPaint={(node: GNode, paintColor: string, ctx: CanvasRenderingContext2D) => {
            const degree = (node.degree as number) ?? 1;
            const size = Math.max(4, Math.min(16, degree * 2));
            ctx.beginPath();
            ctx.arc(node.x ?? 0, node.y ?? 0, size + 2, 0, 2 * Math.PI);
            ctx.fillStyle = paintColor;
            ctx.fill();
          }}
          linkColor={linkColor}
          linkWidth={linkWidth}
          onNodeHover={(node: GNode | null) => {
            if (node) {
              setHoveredNode({
                handle: node.handle as string,
                displayName: node.displayName as string,
                degree: node.degree as number,
              });
            } else {
              setHoveredNode(null);
            }
          }}
          cooldownTicks={100}
          enableZoomInteraction={true}
          enablePanInteraction={true}
        />
      </div>
      {hoveredNode && (
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-md border border-border bg-secondary px-3 py-2 text-sm shadow-md">
          <p className="font-medium text-foreground">
            {hoveredNode.displayName || hoveredNode.handle}
          </p>
          <p className="text-muted-foreground">
            @{hoveredNode.handle} &middot; {hoveredNode.degree} connections
          </p>
        </div>
      )}
    </div>
  );
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
