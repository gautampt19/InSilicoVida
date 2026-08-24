import React, { useEffect, useRef, useState } from "react";

interface Point {
  x: number;
  y: number;
}

interface ReceptorNode extends Point {
  baseX: number;
  baseY: number;
  radius: number;
  phase: number;
}

interface LigandNode extends Point {
  offsetX: number;
  offsetY: number;
  radius: number;
  color: string;
}

export const MolecularDocking: React.FC<{ className?: string }> = ({ className = "" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<Point>({ x: -1000, y: -1000 });
  const [isDocked, setIsDocked] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        width = parent.clientWidth;
        height = parent.clientHeight;
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    };
    window.addEventListener("resize", resize);
    resize();

    // Generate Receptor (Protein Pocket)
    const receptorNodes: ReceptorNode[] = [];
    const pocketCenter = { x: 0, y: 0 };
    
    // Create a C-shape for the receptor
    for (let i = 0; i < 25; i++) {
      const angle = (i / 25) * Math.PI * 1.5 - Math.PI * 0.75;
      const dist = 120 + Math.random() * 30;
      receptorNodes.push({
        x: 0, y: 0,
        baseX: Math.cos(angle) * dist,
        baseY: Math.sin(angle) * dist,
        radius: 20 + Math.random() * 15,
        phase: Math.random() * Math.PI * 2,
      });
      // Outer layer for bulk
      receptorNodes.push({
        x: 0, y: 0,
        baseX: Math.cos(angle) * (dist + 40),
        baseY: Math.sin(angle) * (dist + 40),
        radius: 30 + Math.random() * 20,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Ligand (Small molecule)
    const ligandNodes: LigandNode[] = [
      { x: 0, y: 0, offsetX: 0, offsetY: 0, radius: 12, color: "#8892b0" }, // Center Carbon
      { x: 0, y: 0, offsetX: -20, offsetY: -15, radius: 10, color: "#ef4444" }, // Oxygen
      { x: 0, y: 0, offsetX: 20, offsetY: -10, radius: 9, color: "#3b82f6" }, // Nitrogen
      { x: 0, y: 0, offsetX: 5, offsetY: 25, radius: 11, color: "#14b8a6" }, // Fluorine
    ];

    let ligandCenter = { x: width / 2, y: height / 2 };
    let ligandVelocity = { x: 0, y: 0 };
    let ligandRotation = 0;

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = width / 2;
      const cy = height / 2;

      // Draw Receptor
      ctx.globalCompositeOperation = "screen";
      let dockedState = false;

      // Calculate distance from ligand to pocket center
      const pocketAbsX = cx;
      const pocketAbsY = cy;
      const distToPocket = Math.sqrt(Math.pow(ligandCenter.x - pocketAbsX, 2) + Math.pow(ligandCenter.y - pocketAbsY, 2));
      
      if (distToPocket < 60) {
        dockedState = true;
      }
      
      receptorNodes.forEach((node) => {
        node.x = cx + node.baseX + Math.sin(time + node.phase) * 5;
        node.y = cy + node.baseY + Math.cos(time + node.phase) * 5;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        
        // Base color vs Docked color
        const baseColor = "rgba(136, 146, 176, 0.15)";
        const dockedColor = "rgba(16, 185, 129, 0.4)"; // Emerald glow when docked
        
        ctx.fillStyle = dockedState ? dockedColor : baseColor;
        ctx.fill();
      });
      ctx.globalCompositeOperation = "source-over";

      // Ligand Physics
      let targetX = mousePos.x === -1000 ? cx + Math.sin(time) * 200 : mousePos.x;
      let targetY = mousePos.y === -1000 ? cy + Math.cos(time * 0.8) * 150 : mousePos.y;

      // Docking Force
      if (distToPocket < 150) {
        // Pull towards center of pocket
        const force = (150 - distToPocket) / 150;
        targetX = targetX * (1 - force) + pocketAbsX * force;
        targetY = targetY * (1 - force) + pocketAbsY * force;
      }

      ligandVelocity.x = (targetX - ligandCenter.x) * 0.1;
      ligandVelocity.y = (targetY - ligandCenter.y) * 0.1;
      
      ligandCenter.x += ligandVelocity.x;
      ligandCenter.y += ligandVelocity.y;

      // Rotate ligand towards movement or lock to pocket
      if (dockedState) {
        // Slowly align to pocket
        ligandRotation += (Math.PI / 2 - ligandRotation) * 0.1;
      } else {
        const targetRot = Math.atan2(ligandVelocity.y, ligandVelocity.x);
        ligandRotation += (targetRot - ligandRotation) * 0.1;
      }

      // Draw Ligand Bonds
      ctx.beginPath();
      for (let i = 1; i < ligandNodes.length; i++) {
        const centerNode = ligandNodes[0];
        const targetNode = ligandNodes[i];
        
        const cx_rot = ligandCenter.x + (centerNode.offsetX * Math.cos(ligandRotation) - centerNode.offsetY * Math.sin(ligandRotation));
        const cy_rot = ligandCenter.y + (centerNode.offsetX * Math.sin(ligandRotation) + centerNode.offsetY * Math.cos(ligandRotation));
        
        const tx_rot = ligandCenter.x + (targetNode.offsetX * Math.cos(ligandRotation) - targetNode.offsetY * Math.sin(ligandRotation));
        const ty_rot = ligandCenter.y + (targetNode.offsetX * Math.sin(ligandRotation) + targetNode.offsetY * Math.cos(ligandRotation));

        ctx.moveTo(cx_rot, cy_rot);
        ctx.lineTo(tx_rot, ty_rot);
      }
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw Ligand Atoms
      ligandNodes.forEach((node) => {
        const nx = ligandCenter.x + (node.offsetX * Math.cos(ligandRotation) - node.offsetY * Math.sin(ligandRotation));
        const ny = ligandCenter.y + (node.offsetX * Math.sin(ligandRotation) + node.offsetY * Math.cos(ligandRotation));

        // Glow
        ctx.beginPath();
        ctx.arc(nx, ny, node.radius * 2, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, node.radius * 2);
        grad.addColorStop(0, `${node.color}88`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(nx, ny, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Update state for UI
      setIsDocked(dockedState);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mousePos]);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full ${className}`}
      onMouseMove={(e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
      onMouseLeave={() => setMousePos({ x: -1000, y: -1000 })}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full cursor-crosshair" />
      
      {/* UI Overlay */}
      <div className="absolute top-1/4 right-1/4 flex flex-col items-end gap-2 pointer-events-none">
        <div className="glass-panel px-4 py-2 rounded-lg border shadow-lg flex items-center gap-3 bg-background/40 backdrop-blur-md">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-display font-semibold">Affinity Score</span>
            <span className={`text-xl font-serif font-medium transition-colors duration-300 ${isDocked ? 'text-emerald-400' : 'text-primary'}`}>
              {isDocked ? '-9.8 kcal/mol' : '-2.4 kcal/mol'}
            </span>
          </div>
          <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${isDocked ? 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]' : 'bg-primary/30'}`} />
        </div>
        
        <div className={`transition-all duration-500 transform ${isDocked ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
          <div className="glass-panel px-3 py-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold tracking-wider uppercase">
            Binding Achieved
          </div>
        </div>
      </div>
    </div>
  );
};
