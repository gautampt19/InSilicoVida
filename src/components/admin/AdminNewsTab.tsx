import { useState } from "react";
import { useNews } from "@/contexts/NewsContext";
import { useTeam } from "@/contexts/TeamContext";
import { NewsItem } from "@/data/types";
import { Plus, Edit2, Trash2, X, Save, Newspaper, Linkedin, ExternalLink, Sparkles, User } from "lucide-react";
import { toast } from "sonner";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function AdminNewsTab() {
  const { news, addNews, updateNews, deleteNews } = useNews();
  const { teamMembers } = useTeam();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLinkedInModalOpen, setIsLinkedInModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    month: "Jan",
    year: new Date().getFullYear().toString(),
    title: "",
    description: "",
    link: "",
  });

  const [linkedInForm, setLinkedInForm] = useState({
    url: "",
    title: "",
    content: "",
    author: "InSilicoVida Lab",
  });

  const handleOpenModal = (item?: NewsItem) => {
    if (item) {
      setEditingNews(item);
      const parts = (item.date || "").trim().split(" ");
      const m = MONTHS.includes(parts[0]) ? parts[0] : "Jan";
      const y = parts[1] || new Date().getFullYear().toString();
      setFormData({
        month: m,
        year: y,
        title: item.title,
        description: item.description,
        link: item.link || "",
      });
    } else {
      setEditingNews(null);
      const now = new Date();
      setFormData({
        month: MONTHS[now.getMonth()],
        year: now.getFullYear().toString(),
        title: "",
        description: "",
        link: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingNews(null);
  };

  const handleLinkedInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkedInForm.url.trim()) {
      toast.error("Please provide a LinkedIn post URL");
      return;
    }

    setIsSaving(true);
    const now = new Date();
    const currentMonth = MONTHS[now.getMonth()];
    const currentYear = now.getFullYear().toString();

    // Generate clean title if not provided
    let title = linkedInForm.title.trim();
    if (!title) {
      const firstLine = linkedInForm.content.split("\n")[0].trim();
      title = firstLine.length > 90 ? firstLine.substring(0, 87) + "..." : firstLine || "Team Update on LinkedIn";
    }

    let finalLink = linkedInForm.url.trim();
    if (linkedInForm.author && linkedInForm.author !== "InSilicoVida Lab" && !finalLink.includes("#author=")) {
      finalLink = `${finalLink}#author=${encodeURIComponent(linkedInForm.author)}`;
    }

    const newsData: NewsItem = {
      date: `${currentMonth} ${currentYear}`,
      title,
      description: linkedInForm.content.trim() || "Check out our latest research update on LinkedIn.",
      link: finalLink,
    };

    const res = await addNews(newsData);
    if (res.success) {
      toast.success("LinkedIn post published to Latest News!");
      setIsLinkedInModalOpen(false);
      setLinkedInForm({ url: "", title: "", content: "", author: "InSilicoVida Lab" });
    } else {
      toast.error(res.error || "Failed to publish LinkedIn post");
    }
    setIsSaving(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const newsData: NewsItem = {
      date: `${formData.month} ${formData.year}`,
      title: formData.title,
      description: formData.description,
      link: formData.link || undefined,
    };

    if (editingNews && editingNews.id) {
      const res = await updateNews(editingNews.id, newsData);
      if (res.success) {
        toast.success("News item updated successfully");
        handleCloseModal();
      } else {
        toast.error(res.error || "Failed to update news item");
      }
    } else {
      const res = await addNews(newsData);
      if (res.success) {
        toast.success("News item added successfully");
        handleCloseModal();
      } else {
        toast.error(res.error || "Failed to add news item");
      }
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      const res = await deleteNews(id);
      if (res.success) {
        toast.success("News item deleted");
      } else {
        toast.error(res.error || "Failed to delete news item");
      }
    }
  };

  return (
    <div>
      {/* Sync Info Banner */}
      <div className="mb-6 p-4 rounded-2xl bg-[#0A66C2]/10 border border-[#0A66C2]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#0A66C2] text-white shrink-0">
            <Linkedin size={18} />
          </div>
          <div>
            <p className="font-medium text-foreground">LinkedIn News Integration Active</p>
            <p className="text-xs text-muted-foreground">
              Automated GitHub Actions periodically checks for new posts. You can also import any post immediately with the button on the right.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="font-serif text-2xl text-foreground flex items-center gap-2">
          <Newspaper size={24} className="text-primary" /> News & Updates
        </h2>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsLinkedInModalOpen(true)}
            className="flex items-center gap-2 bg-[#0A66C2] text-white px-4 py-2.5 rounded-full text-sm font-medium hover:bg-[#084e96] transition-colors shadow-sm"
          >
            <Linkedin size={15} /> Add LinkedIn Post
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus size={16} /> Add News
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted/30 uppercase text-xs tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Title</th>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {news.map((item) => {
                const isLinkedIn = Boolean(
                  item.link && (item.link.includes("linkedin.com") || item.link.includes("lnkd.in"))
                );

                return (
                  <tr key={item.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-primary font-semibold">
                      {item.date}
                    </td>
                    <td className="px-6 py-4 max-w-xs font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        {isLinkedIn && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#0A66C2]/15 text-[#0A66C2] dark:text-[#70b5f9] shrink-0">
                            <Linkedin size={10} className="fill-current" />
                            {item.link?.includes("#author=")
                              ? decodeURIComponent(item.link.split("#author=")[1]?.split("&")[0])
                              : "LinkedIn"}
                          </span>
                        )}
                        <span className="truncate">{item.title}</span>
                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary shrink-0"
                            title="Open external link"
                          >
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-md truncate text-muted-foreground">
                      {item.description}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenModal(item)}
                        className="p-2 text-muted-foreground hover:text-primary transition-colors inline-block mr-2"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => item.id && handleDelete(item.id, item.title)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors inline-block"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {news.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    No news items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border/50 rounded-3xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
              <h2 className="font-serif text-xl font-medium text-foreground">
                {editingNews ? "Edit News Item" : "Add News Item"}
              </h2>
              <button onClick={handleCloseModal} className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="news-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Month & Year Selectors */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Month</label>
                      <select
                        value={formData.month}
                        onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                      >
                        {MONTHS.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Year</label>
                      <input
                        type="number"
                        required
                        min="2000"
                        max="2100"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                        placeholder="2026"
                      />
                    </div>
                  </div>

                  {/* External Link */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Link (Optional)</label>
                    <input
                      type="url"
                      value={formData.link}
                      onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                    placeholder="e.g. New Grant Awarded"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Description</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 min-h-[100px]"
                    placeholder="Provide a short summary..."
                  />
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-border/50 flex justify-end gap-3 bg-muted/10">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-5 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="news-form"
                disabled={isSaving}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                ) : (
                  <Save size={16} />
                )}
                {isSaving ? "Saving..." : "Save News"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LinkedIn Post Modal */}
      {isLinkedInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-[#0A66C2]/30 rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-[#0A66C2]/5">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-[#0A66C2] text-white">
                  <Linkedin size={18} />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-medium text-foreground">Add LinkedIn Post</h2>
                  <p className="text-xs text-muted-foreground">Publish a LinkedIn update directly to Latest News</p>
                </div>
              </div>
              <button
                onClick={() => setIsLinkedInModalOpen(false)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="linkedin-form" onSubmit={handleLinkedInSubmit} className="space-y-5">
                {/* LinkedIn URL */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                    LinkedIn Post URL <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={linkedInForm.url}
                    onChange={(e) => setLinkedInForm({ ...linkedInForm, url: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2]/20"
                    placeholder="https://www.linkedin.com/posts/..."
                  />
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    Paste the link to your or your team member&apos;s LinkedIn post.
                  </p>
                </div>

                {/* Team Member / Author */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                    Posted By / Team Member
                  </label>
                  <select
                    value={linkedInForm.author}
                    onChange={(e) => setLinkedInForm({ ...linkedInForm, author: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2]/20"
                  >
                    <option value="InSilicoVida Lab">InSilicoVida Lab (Default)</option>
                    {teamMembers.map((member) => (
                      <option key={member.id || member.name} value={member.name}>
                        {member.name} ({member.role})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Optional Custom Title */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                    Headline / Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={linkedInForm.title}
                    onChange={(e) => setLinkedInForm({ ...linkedInForm, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2]/20"
                    placeholder="Leave empty to use the first sentence from the caption"
                  />
                </div>

                {/* Post Caption / Content */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                    Post Caption / Summary <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    required
                    value={linkedInForm.content}
                    onChange={(e) => setLinkedInForm({ ...linkedInForm, content: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2]/20 min-h-[120px]"
                    placeholder="Paste the caption or summary of the LinkedIn post here..."
                  />
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-border/50 flex justify-end gap-3 bg-muted/10">
              <button
                type="button"
                onClick={() => setIsLinkedInModalOpen(false)}
                className="px-5 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="linkedin-form"
                disabled={isSaving}
                className="flex items-center gap-2 bg-[#0A66C2] text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-[#084e96] transition-colors shadow-sm disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Linkedin size={16} />
                )}
                {isSaving ? "Publishing..." : "Publish to Latest News"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
