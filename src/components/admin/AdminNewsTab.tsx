import { useState } from "react";
import { useNews } from "@/contexts/NewsContext";
import { NewsItem } from "@/data/types";
import { Plus, Edit2, Trash2, X, Save, Newspaper } from "lucide-react";
import { toast } from "sonner";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function AdminNewsTab() {
  const { news, addNews, updateNews, deleteNews } = useNews();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    month: "Jan",
    year: new Date().getFullYear().toString(),
    title: "",
    description: "",
    link: "",
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-serif text-2xl text-foreground flex items-center gap-2">
          <Newspaper size={24} className="text-primary" /> News & Updates
        </h2>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus size={16} /> Add News
        </button>
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
              {news.map((item) => (
                <tr key={item.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-primary font-semibold">
                    {item.date}
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate font-medium text-foreground">
                    {item.title}
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
              ))}
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
    </div>
  );
}
