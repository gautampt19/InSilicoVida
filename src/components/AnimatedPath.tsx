import { useRef } from "react";
import { useGSAP } from "@/hooks/useGSAP";
import gsap from "gsap";

/**
 * Animated SVG path component that creates a flowing molecular/network visualization
 */
export const AnimatedPath = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const ballRef = useRef<SVGCircleElement>(null);

  useGSAP(() => {
    if (!pathRef.current || !ballRef.current) return;

    const path = pathRef.current;
    const ball = ballRef.current;
    const pathLength = path.getTotalLength();

    // Set up the path for animation
    path.style.strokeDasharray = `${pathLength} ${pathLength}`;
    path.style.strokeDashoffset = `${pathLength}`;

    // Function to get point on path at a given percentage
    const getPointOnPath = (percent: number) => {
      const point = path.getPointAtLength((percent / 100) * pathLength);
      return { x: point.x, y: point.y };
    };

    // Create a timeline that loops
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2 });
    
    // Animate path drawing
    tl.to(path, {
      strokeDashoffset: 0,
      duration: 3,
      ease: "power2.inOut",
    });

    // Animate ball position along path using a custom object
    const ballProgress = { value: 0 };
    tl.to(ballProgress, {
      value: 100,
      duration: 3,
      ease: "power2.inOut",
      onUpdate: function () {
        const point = getPointOnPath(ballProgress.value);
        gsap.set(ball, {
          attr: { cx: point.x, cy: point.y },
        });
      },
    }, 0);

    // Reset animation
    tl.to(path, {
      strokeDashoffset: pathLength,
      duration: 0.5,
      ease: "power2.in",
    });

    // Pulse animation for the ball
    gsap.to(ball, {
      scale: 1.5,
      duration: 1,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }, []);

  // Molecular network path
  const networkPath = `M 50 100 
    Q 100 50, 150 80 
    T 250 60
    Q 300 40, 350 70
    T 450 50
    Q 500 30, 550 60
    T 650 40
    Q 700 20, 750 50`;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 animated-molecular-canvas">
      <svg
        ref={svgRef}
        viewBox="0 0 800 150"
        className="w-full h-full max-w-4xl"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Main animated path */}
        <path
          ref={pathRef}
          d={networkPath}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Animated ball that moves along the path */}
        <circle
          ref={ballRef}
          cx="50"
          cy="100"
          r="6"
          fill="hsl(var(--highlight))"
        />

        {/* Static nodes for visual interest */}
        {[
          { cx: 150, cy: 80 },
          { cx: 250, cy: 60 },
          { cx: 350, cy: 70 },
          { cx: 450, cy: 50 },
          { cx: 550, cy: 60 },
          { cx: 650, cy: 40 },
        ].map((node, i) => (
          <circle
            key={i}
            cx={node.cx}
            cy={node.cy}
            r="3"
            fill="hsl(var(--muted-foreground))"
            opacity="0.4"
          />
        ))}
      </svg>
    </div>
  );
};
