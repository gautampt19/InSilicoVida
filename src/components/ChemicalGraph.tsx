import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

type AtomType = "C" | "O" | "N" | "S" | "Cl" | "F";

interface Node {
  id: number;
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: AtomType;
  phaseX: number;
  phaseY: number;
}

interface Edge {
  source: number;
  target: number;
  type: "single" | "double";
}

const ATOM_COLORS: Record<AtomType, string> = {
  C: "#8892b0", // muted grey/blue
  O: "#ef4444", // red
  N: "#3b82f6", // blue
  S: "#eab308", // yellow
  Cl: "#22c55e", // green
  F: "#14b8a6", // teal
};

const ATOM_SIZES: Record<AtomType, number> = {
  C: 8,
  O: 9,
  N: 8,
  S: 10,
  Cl: 11,
  F: 7,
};

// Generate a visually pleasing molecule layout (e.g. a complex drug-like compound)
const generateMolecule = (width: number, height: number) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  const cx = width / 2;
  const cy = height / 2;
  const scale = 35; // bond length

  // Helper to add node
  const addNode = (x: number, y: number, type: AtomType = "C") => {
    const id = nodes.length;
    nodes.push({
      id,
      baseX: cx + x * scale,
      baseY: cy + y * scale,
      x: cx + x * scale,
      y: cy + y * scale,
      vx: 0,
      vy: 0,
      type,
      phaseX: Math.random() * Math.PI * 2,
      phaseY: Math.random() * Math.PI * 2,
    });
    return id;
  };

  const addEdge = (source: number, target: number, type: "single" | "double" = "single") => {
    edges.push({ source, target, type });
  };

  // Ring 1 (Center)
  const r1 = [];
  for(let i=0; i<6; i++) {
    const angle = (i * Math.PI) / 3;
    r1.push(addNode(Math.cos(angle)*1.5, Math.sin(angle)*1.5, i === 0 ? "N" : "C"));
  }
  for(let i=0; i<6; i++) {
    addEdge(r1[i], r1[(i+1)%6], i % 2 === 0 ? "double" : "single");
  }

  // Ring 2 (Left attached)
  const r2 = [];
  const r2cx = Math.cos(Math.PI) * 1.5 - 2.5;
  const r2cy = Math.sin(Math.PI) * 1.5;
  for(let i=0; i<5; i++) {
    const angle = (i * Math.PI * 2) / 5 + Math.PI;
    r2.push(addNode(r2cx + Math.cos(angle)*1.4, r2cy + Math.sin(angle)*1.4, i === 2 ? "O" : "C"));
  }
  for(let i=0; i<5; i++) {
    addEdge(r2[i], r2[(i+1)%5], "single");
  }
  addEdge(r1[3], r2[0]); // connect rings

  // Tail extending right
  const t1 = addNode(Math.cos(0)*1.5 + 1.5, Math.sin(0)*1.5 - 1, "C");
  const t2 = addNode(Math.cos(0)*1.5 + 2.5, Math.sin(0)*1.5 - 2, "N");
  const t3 = addNode(Math.cos(0)*1.5 + 3.5, Math.sin(0)*1.5 - 1.5, "C");
  const t4 = addNode(Math.cos(0)*1.5 + 4.5, Math.sin(0)*1.5 - 2.5, "F");
  
  addEdge(r1[0], t1);
  addEdge(t1, t2);
  addEdge(t2, t3);
  addEdge(t3, t4);

  // Oxygen double bond off tail
  const o1 = addNode(Math.cos(0)*1.5 + 1.5, Math.sin(0)*1.5 + 0.5, "O");
  addEdge(t1, o1, "double");

  // Bottom branch
  const b1 = addNode(Math.cos(Math.PI/3)*1.5 + 1, Math.sin(Math.PI/3)*1.5 + 1.5, "S");
  const b2 = addNode(Math.cos(Math.PI/3)*1.5 + 2, Math.sin(Math.PI/3)*1.5 + 2.5, "C");
  const b3 = addNode(Math.cos(Math.PI/3)*1.5 + 1, Math.sin(Math.PI/3)*1.5 + 3.5, "Cl");

  addEdge(r1[1], b1);
  addEdge(b1, b2);
  addEdge(b2, b3);

  // Top branch
  const tb1 = addNode(Math.cos(-Math.PI/3)*1.5 - 1, Math.sin(-Math.PI/3)*1.5 - 1.5, "C");
  const tb2 = addNode(Math.cos(-Math.PI/3)*1.5 - 2, Math.sin(-Math.PI/3)*1.5 - 2.5, "O");
  addEdge(r1[5], tb1);
  addEdge(tb1, tb2, "double");

  return { nodes, edges };
};

export const ChemicalGraph: React.FC<{ className?: string }> = ({ className = "" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredAtom, setHoveredAtom] = useState<Node | null>(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const moleculeRef = useRef<{ nodes: Node[]; edges: Edge[] } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas resolution
    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth * window.devicePixelRatio;
        canvas.height = parent.clientHeight * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        
        // Regenerate molecule on resize to center it
        moleculeRef.current = generateMolecule(parent.clientWidth, parent.clientHeight);
      }
    };
    
    window.addEventListener("resize", resize);
    resize();

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      time += 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!moleculeRef.current) return;
      const { nodes, edges } = moleculeRef.current;
      const themePrimary = "hsl(168, 76%, 36%)"; // The emerald color from the theme

      // Update node positions (vibration/molecular dynamics)
      nodes.forEach((node) => {
        // Subtle floating / vibration
        const dx = Math.sin(time * 2 + node.phaseX) * 3;
        const dy = Math.cos(time * 1.5 + node.phaseY) * 3;

        // Mouse repulsion
        const distX = node.baseX - mousePos.x;
        const distY = node.baseY - mousePos.y;
        const dist = Math.sqrt(distX * distX + distY * distY);
        
        let repelX = 0;
        let repelY = 0;
        if (dist < 100) {
          const force = (100 - dist) / 100;
          repelX = (distX / dist) * force * 15;
          repelY = (distY / dist) * force * 15;
        }

        // Spring back to base
        node.vx = (node.baseX + dx + repelX - node.x) * 0.1;
        node.vy = (node.baseY + dy + repelY - node.y) * 0.1;

        node.x += node.vx;
        node.y += node.vy;
      });

      // Draw Edges
      edges.forEach((edge) => {
        const source = nodes[edge.source];
        const target = nodes[edge.target];

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.strokeStyle = "rgba(136, 146, 176, 0.2)"; // Muted bond color
        ctx.lineWidth = edge.type === "double" ? 4 : 2;
        ctx.stroke();

        // If double bond, draw an inner line to simulate the double bond look
        if (edge.type === "double") {
          ctx.beginPath();
          ctx.moveTo(source.x, source.y);
          ctx.lineTo(target.x, target.y);
          ctx.strokeStyle = "rgba(10, 25, 47, 1)"; // Background color to cut through
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });

      // Draw Nodes
      let currentHovered: Node | null = null;
      
      nodes.forEach((node) => {
        const isHovered = 
          Math.sqrt(Math.pow(mousePos.x - node.x, 2) + Math.pow(mousePos.y - node.y, 2)) < ATOM_SIZES[node.type] * 2;
        
        if (isHovered) currentHovered = node;

        const size = ATOM_SIZES[node.type] * (isHovered ? 1.5 : 1);
        const color = isHovered ? ATOM_COLORS[node.type] : "rgba(136, 146, 176, 0.4)";

        // Glow effect
        if (isHovered || node.type !== "C") {
          ctx.beginPath();
          ctx.arc(node.x, node.y, size * 2.5, 0, Math.PI * 2);
          const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, size * 2.5);
          gradient.addColorStop(0, `${ATOM_COLORS[node.type]}66`); // 40% opacity
          gradient.addColorStop(1, "transparent");
          ctx.fillStyle = gradient;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        
        if (node.type !== "C" || isHovered) {
           ctx.strokeStyle = isHovered ? "#ffffff" : ATOM_COLORS[node.type];
           ctx.lineWidth = 1.5;
           ctx.stroke();
        }
      });

      setHoveredAtom(currentHovered);
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mousePos]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: -1000, y: -1000 });
  };

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full h-full ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full cursor-crosshair" />
      
      {/* Tooltip for Hovered Atom */}
      <div 
        className={`absolute pointer-events-none transition-opacity duration-200 z-10 glass-panel px-3 py-1.5 rounded-lg flex items-center gap-2 border shadow-lg ${hoveredAtom ? 'opacity-100' : 'opacity-0'}`}
        style={{
          left: hoveredAtom ? hoveredAtom.x + 15 : 0,
          top: hoveredAtom ? hoveredAtom.y - 30 : 0,
          borderColor: hoveredAtom ? ATOM_COLORS[hoveredAtom.type] : 'transparent'
        }}
      >
        <div 
          className="w-2.5 h-2.5 rounded-full" 
          style={{ backgroundColor: hoveredAtom ? ATOM_COLORS[hoveredAtom.type] : 'transparent' }}
        />
        <span className="font-display text-xs font-semibold text-foreground tracking-wider">
          {hoveredAtom?.type === 'C' ? 'Carbon' : 
           hoveredAtom?.type === 'O' ? 'Oxygen' : 
           hoveredAtom?.type === 'N' ? 'Nitrogen' : 
           hoveredAtom?.type === 'S' ? 'Sulfur' : 
           hoveredAtom?.type === 'Cl' ? 'Chlorine' : 
           hoveredAtom?.type === 'F' ? 'Fluorine' : ''} Atom
        </span>
      </div>
    </div>
  );
};
