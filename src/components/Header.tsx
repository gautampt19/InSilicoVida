import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useGSAP } from "@/hooks/useGSAP";
import gsap from "gsap";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Research", href: "/research" },
    { label: "Projects", href: "/projects" },
    { label: "Publications", href: "/publications" },
    { label: "Software", href: "/software" },
    { label: "Posters", href: "/posters" },
    { label: "Blog", href: "/blog" },
    { label: "Team", href: "/team" },
    { label: "Contact", href: "/contact" },
  ];

  const isActive = (href: string) => location.pathname === href;

  // Animate header on mount
  useGSAP(() => {
    if (navRef.current) {
      gsap.fromTo(
        navRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }
      );
    }
  }, []);

  // Animate mobile menu
  useEffect(() => {
    if (mobileMenuRef.current) {
      if (isMenuOpen) {
        gsap.fromTo(
          mobileMenuRef.current,
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
        );
        // Stagger mobile links
        const links = mobileMenuRef.current.querySelectorAll("li");
        gsap.fromTo(
          links,
          { opacity: 0, x: -20 },
          {
            opacity: 1,
            x: 0,
            duration: 0.4,
            stagger: 0.05,
            ease: "power3.out",
            delay: 0.1,
          }
        );
      }
    }
  }, [isMenuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border shadow-sm h-14 md:h-16">
      <div className="container mx-auto px-6 h-full">
        <nav
          ref={navRef}
          className="flex items-center justify-between gap-4 h-full"
          style={{ opacity: 0 }}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0 group h-full">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-auto object-contain transition-transform duration-300 group-hover:opacity-80 block scale-120 origin-center"
            >
              <source src="/hero-background.mp4" type="video/mp4" />
            </video>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <ul className="flex items-center gap-7">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className={`relative text-sm font-medium transition-colors duration-200 py-1 ${isActive(link.href)
                      ? "text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {link.label}
                    {/* Active dot indicator */}
                    {isActive(link.href) && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Mobile Controls */}
          <div className="flex md:hidden items-center gap-2">
            <button
              className="p-2 text-foreground hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation — full width overlay */}
        {isMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="md:hidden pt-6 pb-4 border-t border-border/30 mt-4"
          >
            <ul className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(link.href)
                      ? "text-primary bg-accent/50"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
                      }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {isActive(link.href) && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
