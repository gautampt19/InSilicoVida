import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show on non-touch devices
    if (window.matchMedia("(hover: none)").matches) {
      return;
    }

    setIsVisible(true);

    const onMouseMove = (e: MouseEvent) => {
      // Immediate move for the small dot
      gsap.to(cursorRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0,
      });

      // Delayed move for the larger follower ring
      gsap.to(followerRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.6,
        ease: "power3.out",
      });
    };

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Outer Follower Ring - Very subtle */}
      <div
        ref={followerRef}
        className="fixed top-0 left-0 w-6 h-6 rounded-full border border-primary/20 pointer-events-none z-[100] transform -translate-x-1/2 -translate-y-1/2"
      />
      
      {/* Ambient Glow - Soft and smaller */}
      <div
        ref={(el) => {
          if (!el) return;
          window.addEventListener("mousemove", (e) => {
            gsap.to(el, {
              x: e.clientX,
              y: e.clientY,
              duration: 1.2,
              ease: "power2.out",
            });
          });
        }}
        className="fixed top-0 left-0 w-[250px] h-[250px] rounded-full bg-primary/5 blur-[50px] pointer-events-none z-0 transform -translate-x-1/2 -translate-y-1/2"
      />
    </>
  );
};
