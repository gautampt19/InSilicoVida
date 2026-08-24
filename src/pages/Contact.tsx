import { useRef, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MapPin, Mail, Building, Phone, ExternalLink, ArrowRight } from "lucide-react";
import { contactInfo } from "@/data/contact";
import { useGSAP } from "@/hooks/useGSAP";
import { fadeInUp } from "@/utils/animations";
import { toast } from "sonner";

const Contact = () => {
  const headerRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in your name, email, and message.");
      return;
    }

    const mailtoSubject = encodeURIComponent(formData.subject || `Contact Inquiry from ${formData.name}`);
    const mailtoBody = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    );

    // Trigger mailto link
    window.location.href = `mailto:${contactInfo.email}?subject=${mailtoSubject}&body=${mailtoBody}`;

    toast.success("Thank you! Opening your email client to send the message.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  useGSAP(() => {
    if (headerRef.current) {
      fadeInUp(headerRef.current, { delay: 0.2, duration: 0.8 });
    }
    if (leftRef.current) {
      fadeInUp(leftRef.current, { delay: 0.4, duration: 0.8 });
    }
    if (rightRef.current) {
      fadeInUp(rightRef.current, { delay: 0.6, duration: 0.8, y: 30 });
    }
  }, []);

  return (
    <div className="min-h-screen bg-background relative z-10">
      <Header />
      <main className="pt-20">
        <section className="py-10 px-6">
          <div className="section-container">
            {/* Header */}
            <div ref={headerRef} className="mb-8" style={{ opacity: 0 }}>
              <span className="font-display text-xs font-semibold tracking-[0.2em] text-primary/80 uppercase mb-4 block">
                Get in Touch
              </span>
              <h1 className="font-serif text-4xl md:text-6xl font-normal text-foreground mb-4">
                Contact <span className="text-gradient">Us</span>
              </h1>
              <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
                {contactInfo.affiliation.description}
              </p>
            </div>

            {/* Split Layout */}
            <div className="grid lg:grid-cols-5 gap-8">
              {/* Left — Contact Info Cards */}
              <div
                ref={leftRef}
                className="lg:col-span-2 space-y-4"
                style={{ opacity: 0 }}
              >
                {/* Department */}
                <div className="p-6 rounded-2xl glass-panel">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/10 shrink-0">
                      <Building className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-foreground mb-1">
                        Department
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {contactInfo.location.department}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {contactInfo.location.university}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="p-6 rounded-2xl glass-panel">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/10 shrink-0">
                      <MapPin className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-foreground mb-1">
                        Location
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {contactInfo.location.city}
                      </p>
                      <a
                        href={contactInfo.googleMapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        View on Maps <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="p-6 rounded-2xl glass-panel">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/10 shrink-0">
                      <Mail className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-foreground mb-1">
                        Email
                      </h3>
                      <a
                        href={`mailto:${contactInfo.email}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {contactInfo.email}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div className="p-6 rounded-2xl glass-panel">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/10 shrink-0">
                      <Phone className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-foreground mb-1">
                        Phone
                      </h3>
                      <a
                        href={`tel:${contactInfo.phoneLink}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {contactInfo.phone}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Tecnatox Link */}
                <a
                  href={contactInfo.affiliation.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between p-6 rounded-2xl glass-panel glass-panel-hover"
                >
                  <div>
                    <p className="text-xs text-muted-foreground/60 uppercase tracking-wider mb-1">
                      Parent Organization
                    </p>
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      Visit TecnATox Website
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                </a>
              </div>

              {/* Right — Contact Form */}
              <div
                ref={rightRef}
                className="lg:col-span-3"
                style={{ opacity: 0 }}
              >
                <div className="p-8 md:p-10 rounded-2xl glass-panel">
                  <h2 className="font-serif text-xl font-normal text-foreground mb-6">
                    Send us a message
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider"
                        >
                          Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all duration-200 text-sm"
                          placeholder="Your name"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider"
                        >
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all duration-200 text-sm"
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider"
                      >
                        Subject
                      </label>
                      <input
                        type="text"
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all duration-200 text-sm"
                        placeholder="Research inquiry"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider"
                      >
                        Message
                      </label>
                      <textarea
                        id="message"
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all duration-200 resize-none text-sm"
                        placeholder="Your message..."
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="daylight-btn group w-full px-8 py-3.5 rounded-full bg-primary text-primary-foreground border border-transparent font-medium text-xs tracking-wider uppercase shadow-sm cursor-pointer"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2 group-hover:text-primary transition-colors duration-300">
                        Send Message
                        <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                      <div className="daylight-btn-overlay bg-background" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
