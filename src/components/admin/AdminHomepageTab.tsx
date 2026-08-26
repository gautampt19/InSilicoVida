import { useState } from "react";
import { useHome, HighlightItem } from "@/contexts/HomeContext";
import { Save, Layout, Sparkles, Image as ImageIcon, CheckCircle2, Megaphone, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminHomepageTab() {
  const { homeData, updateHomeData } = useHome();
  const [formData, setFormData] = useState({
    labName: homeData.labName,
    tagline: homeData.tagline,
    description: homeData.description,
    bannerImage: homeData.bannerImage,
    highlights: [...homeData.highlights],
    tickerItems: [...(homeData.tickerItems || [])],
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleHighlightChange = (index: number, field: keyof HighlightItem, value: string) => {
    const updated = [...formData.highlights];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, highlights: updated });
  };

  const handleTickerChange = (index: number, field: "category" | "title", value: string) => {
    const updated = [...formData.tickerItems];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, tickerItems: updated });
  };

  const handleAddHighlight = () => {
    setFormData({
      ...formData,
      highlights: [
        ...formData.highlights,
        { title: "New Feature", text: "Describe what you do here.", link: "" },
      ],
    });
  };

  const handleDeleteHighlight = (index: number) => {
    const updated = formData.highlights.filter((_, i) => i !== index);
    setFormData({ ...formData, highlights: updated });
  };

  const handleAddTickerItem = () => {
    setFormData({
      ...formData,
      tickerItems: [
        ...formData.tickerItems,
        { category: "News", title: "New announcement title here" },
      ],
    });
  };

  const handleDeleteTickerItem = (index: number) => {
    const updated = formData.tickerItems.filter((_, i) => i !== index);
    setFormData({ ...formData, tickerItems: updated });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await updateHomeData(formData);
      if (res.success) {
        toast.success("Homepage content updated successfully!");
      } else {
        toast.error(res.error || "Failed to update homepage content.");
      }
    } catch (err: any) {
      toast.error("Error saving changes.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h2 className="font-serif text-2xl text-foreground font-normal">Homepage Content</h2>
          <p className="text-sm text-muted-foreground">
            Edit the main hero text, introduction description, and "What We Do" cards.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-md cursor-pointer disabled:opacity-50 shrink-0"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Hero Section Edit Box */}
        <div className="p-6 rounded-2xl border border-border/50 bg-card space-y-5">
          <div className="flex items-center gap-2 text-primary font-medium text-sm">
            <Layout size={18} />
            <span>Hero & Main Intro</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Lab Name / Title
              </label>
              <input
                type="text"
                value={formData.labName}
                onChange={(e) => setFormData({ ...formData, labName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary/40"
                placeholder="InSilico Vida"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Tagline / Subtitle
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary/40"
                placeholder="Computational Modeling for Health Risk Assessment"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Laboratory Description Paragraph
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary/40 leading-relaxed resize-y"
              placeholder="A dynamic laboratory..."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Banner Image URL
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="text"
                value={formData.bannerImage}
                onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary/40"
                placeholder="/banner.png"
              />
              <ImageIcon size={20} className="text-muted-foreground shrink-0" />
            </div>
          </div>
        </div>

        {/* What We Do Cards Edit Box */}
        <div className="p-6 rounded-2xl border border-border/50 bg-card space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary font-medium text-sm">
              <Sparkles size={18} />
              <span>"What We Do" Cards ({formData.highlights.length} Highlights)</span>
            </div>
            <button
              type="button"
              onClick={handleAddHighlight}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors cursor-pointer"
            >
              <Plus size={14} /> Add Card
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {formData.highlights.map((item, idx) => (
              <div key={idx} className="p-5 rounded-xl border border-border/40 bg-background/60 space-y-3 relative">
                <div className="flex items-center justify-between text-xs font-semibold text-primary uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span>Card #{idx + 1}</span>
                    <CheckCircle2 size={14} className="text-primary/70" />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteHighlight(idx)}
                    className="p-1.5 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors cursor-pointer"
                    title="Delete Card"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Title</label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => handleHighlightChange(idx, "title", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:border-primary/40 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Description Text</label>
                  <textarea
                    rows={3}
                    value={item.text}
                    onChange={(e) => handleHighlightChange(idx, "text", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:border-primary/40 resize-y text-xs leading-relaxed"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Link Target</label>
                  <input
                    type="text"
                    value={item.link}
                    onChange={(e) => handleHighlightChange(idx, "link", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground text-xs focus:outline-none focus:border-primary/40 font-mono"
                    placeholder="/research#topic"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Announcement Ticker Updates Box */}
        <div className="p-6 rounded-2xl border border-border/50 bg-card space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary font-medium text-sm">
              <Megaphone size={18} />
              <span>Announcement Ticker Updates</span>
            </div>
            <button
              type="button"
              onClick={handleAddTickerItem}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors cursor-pointer"
            >
              <Plus size={14} /> Add Update
            </button>
          </div>

          <div className="space-y-4">
            {formData.tickerItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-background/60">
                <div className="w-32 shrink-0">
                  <label className="block text-[10px] uppercase font-bold text-muted-foreground mb-1">Category</label>
                  <select
                    value={item.category}
                    onChange={(e) => handleTickerChange(idx, "category", e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-card border border-border text-foreground text-xs focus:outline-none focus:border-primary/40 font-semibold"
                  >
                    <option value="News">News</option>
                    <option value="Publication">Publication</option>
                    <option value="Poster">Poster</option>
                    <option value="Event">Event</option>
                    <option value="Research">Research</option>
                  </select>
                </div>

                <div className="flex-1 min-w-0">
                  <label className="block text-[10px] uppercase font-bold text-muted-foreground mb-1">Announcement Text</label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => handleTickerChange(idx, "title", e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-card border border-border text-foreground text-xs focus:outline-none focus:border-primary/40"
                    placeholder="Enter announcement..."
                    required
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteTickerItem(idx)}
                  className="p-2 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors shrink-0 mt-4 cursor-pointer"
                  title="Delete Update"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {isSaving ? "Saving..." : "Save All Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
