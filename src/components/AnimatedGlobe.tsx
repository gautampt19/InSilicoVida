import React, { useEffect, useRef } from 'react';

interface AnimatedGlobeProps {
  className?: string;
}

export const AnimatedGlobe: React.FC<AnimatedGlobeProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    
    // Theme tracking
    let isDark = document.documentElement.classList.contains('dark');
    
    const observer = new MutationObserver(() => {
      isDark = document.documentElement.classList.contains('dark');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // Globe settings
    const numPoints = 800;
    const globeRadius = 350;
    const points: { x: number; y: number; z: number; isHorizontal: boolean }[] = [];

    // Generate points on a sphere using Fibonacci lattice
    const phi = Math.PI * (3 - Math.sqrt(5)); // golden angle
    for (let i = 0; i < numPoints; i++) {
      const y = 1 - (i / (numPoints - 1)) * 2; // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y); // radius at y
      const theta = phi * i; // golden angle increment

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      points.push({
        x: x * globeRadius,
        y: y * globeRadius,
        z: z * globeRadius,
        isHorizontal: Math.random() > 0.5,
      });
    }

    const resize = () => {
      // Setup high-DPI canvas
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', resize);
    resize();

    let rotation = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Dark mode: light gray lines. Light mode: dark gray lines.
      const baseColorRGB = isDark ? '255, 255, 255' : '0, 0, 0';

      const centerX = width / 2;
      const centerY = height / 2;

      // Rotate points slowly around Y-axis
      rotation += 0.0015;
      const cosR = Math.cos(rotation);
      const sinR = Math.sin(rotation);

      // Render each point
      points.forEach((point) => {
        // Rotate around Y axis
        const rotX = point.x * cosR - point.z * sinR;
        const rotZ = point.z * cosR + point.x * sinR;
        const rotY = point.y;

        // Simple 3D to 2D projection
        const focalLength = 1000;
        const depth = focalLength / (focalLength - rotZ);
        
        const scale = depth;
        
        const projX = centerX + rotX * scale;
        const projY = centerY + rotY * scale;

        const normalizedZ = (rotZ + globeRadius) / (globeRadius * 2); // 0 (back) to 1 (front)
        
        // Base opacity + extra opacity for closer points
        const opacity = 0.15 + Math.pow(normalizedZ, 2) * 0.5;
        
        ctx.strokeStyle = `rgba(${baseColorRGB}, ${opacity})`;
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();

        const dashLength = 4 * scale;

        if (point.isHorizontal) {
          ctx.moveTo(projX - dashLength, projY);
          ctx.lineTo(projX + dashLength, projY);
        } else {
          ctx.moveTo(projX, projY - dashLength);
          ctx.lineTo(projX, projY + dashLength);
        }
        
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full pointer-events-none ${className}`}
      style={{ display: 'block' }}
    />
  );
};
