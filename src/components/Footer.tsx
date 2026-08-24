import { Link } from "react-router-dom";

const Footer = () => {
  const navSections = [
    {
      title: "Research",
      links: [
        { label: "Research Areas", href: "/research" },
        { label: "Projects", href: "/projects" },
        { label: "Publications", href: "/publications" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Software & Tools", href: "/software" },
        { label: "Team", href: "/team" },
        { label: "Contact", href: "/contact" },
      ],
    },
  ];

  const affiliations = [
    {
      name: "Universitat Rovira i Virgili",
      logo: "/images/urv-logo.png",
      url: "https://www.urv.cat/en/",
      fallback: "URV",
    },
    {
      name: "TecnATox",
      logo: "/images/tecnatox-logo.png",
      url: "https://www.tecnatox.urv.cat/en/",
      fallback: "TecnATox",
    },
    {
      name: "IISPV",
      logo: "/images/iispv-logo.png",
      url: "https://www.iispv.cat/en/",
      fallback: "IISPV",
    },
  ];

  return (
    <footer className="relative pt-20 pb-8 px-6 border-t border-border/30 bg-gradient-to-b from-background to-background/80">
      {/* Subtle mesh glow at top */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-px opacity-60"
        style={{
          background:
            "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.4), hsl(var(--mesh-2) / 0.3), transparent)",
        }}
      />

      <div className="container mx-auto max-w-6xl">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* Brand Column */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="font-serif text-xl font-semibold text-foreground tracking-tight">
                InSilicoVida
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mb-6">
              A dynamic research group at the intersection of computational
              toxicology, AI, and human health risk assessment. Part of TecnATox
              Research Center.
            </p>
            <p className="text-xs text-muted-foreground/60">
              Department of Chemical Engineering
              <br />
              Universitat Rovira i Virgili, Tarragona, Spain
            </p>
          </div>

          {/* Navigation Columns */}
          {navSections.map((section) => (
            <div key={section.title} className="md:col-span-2">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-widest mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Affiliations Column */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-widest mb-4">
              Affiliated with
            </h3>
            <div className="flex flex-wrap gap-3">
              {affiliations.map((affiliation) => (
                <a
                  key={affiliation.name}
                  href={affiliation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center p-3 rounded-xl bg-card/50 border border-border/50 hover:border-primary/20 hover:bg-card/80 transition-all duration-300 min-w-[72px] min-h-[48px]"
                  aria-label={`Visit ${affiliation.name} website`}
                  title={affiliation.name}
                >
                  <img
                    src={affiliation.logo}
                    alt={affiliation.name}
                    className="h-8 w-auto object-contain opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector(".logo-fallback")) {
                        const fallback = document.createElement("span");
                        fallback.className =
                          "logo-fallback text-xs font-semibold text-muted-foreground";
                        fallback.textContent = affiliation.fallback;
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground/50">
            © {new Date().getFullYear()} InSilicoVida Research Laboratory. All
            rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/40">
            Part of TecnATox · Universitat Rovira i Virgili
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
