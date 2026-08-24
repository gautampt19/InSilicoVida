import { useState } from "react";
import { useBlog } from "@/contexts/BlogContext";
import { BlogPost } from "@/data/types";
import { Plus, Edit2, Trash2, X, Save, BookOpen, Search, Eye, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";

export default function AdminBlogTab() {
  const { blogs, addBlog, updateBlog, deleteBlog } = useBlog();

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    author: "InSilicoVida Team",
    date: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    category: "General",
    read_time: "5 min read",
    image: "",
    excerpt: "",
    content: "",
    published: true,
  });

  const handleOpenModal = (blog?: BlogPost) => {
    if (blog) {
      setEditingBlog(blog);
      setFormData({
        title: blog.title || "",
        slug: blog.slug || "",
        author: blog.author || "InSilicoVida Team",
        date: blog.date || "",
        category: blog.category || "General",
        read_time: blog.read_time || "5 min read",
        image: blog.image || "",
        excerpt: blog.excerpt || "",
        content: blog.content || "",
        published: blog.published !== false,
      });
    } else {
      setEditingBlog(null);
      setFormData({
        title: "",
        slug: "",
        author: "InSilicoVida Team",
        date: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        category: "PBPK",
        read_time: "5 min read",
        image: "",
        excerpt: "",
        content: "",
        published: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBlog(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const generatedSlug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const blogData: BlogPost = {
      title: formData.title,
      slug: generatedSlug,
      author: formData.author,
      date: formData.date,
      category: formData.category,
      read_time: formData.read_time,
      image: formData.image || "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=1200",
      excerpt: formData.excerpt,
      content: formData.content,
      published: formData.published,
    };

    if (editingBlog && editingBlog.id) {
      const res = await updateBlog(editingBlog.id, blogData);
      if (res.success) {
        toast.success("Blog post updated successfully");
        handleCloseModal();
      } else {
        toast.error(res.error || "Failed to update blog post");
      }
    } else {
      const res = await addBlog(blogData);
      if (res.success) {
        toast.success("Blog post created successfully");
        handleCloseModal();
      } else {
        toast.error(res.error || "Failed to create blog post");
      }
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      const res = await deleteBlog(id);
      if (res.success) {
        toast.success("Blog post deleted");
      } else {
        toast.error(res.error || "Failed to delete blog post");
      }
    }
  };

  const filteredBlogs = blogs.filter((b) =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.category && b.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="font-serif text-2xl text-foreground flex items-center gap-2">
            <BookOpen size={24} className="text-primary" /> Blog Articles
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Publish and manage insights, research summaries, and lab news.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus size={16} /> Create Article
        </button>
      </div>

      {/* Search Filter */}
      <div className="mb-6 relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search articles by title, author, or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-card border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
        />
      </div>

      {/* Articles Table */}
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted/30 uppercase text-xs tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Article</th>
                <th className="px-6 py-4 font-medium">Author</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filteredBlogs.map((blog) => (
                <tr key={blog.id || blog.slug} className="hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-4 max-w-sm truncate font-medium text-foreground">
                    <div className="flex items-center gap-3">
                      {blog.image && (
                        <img
                          src={blog.image}
                          alt={blog.title}
                          className="w-10 h-10 rounded-lg object-cover border border-border/40 shrink-0"
                        />
                      )}
                      <div>
                        <div className="font-semibold text-foreground truncate">{blog.title}</div>
                        <div className="text-xs text-muted-foreground font-mono">/blog/{blog.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{blog.author}</td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {blog.category || "General"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-muted-foreground">{blog.date}</td>
                  <td className="px-6 py-4">
                    {blog.published !== false ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                        <CheckCircle size={12} /> Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full">
                        <Clock size={12} /> Draft
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <a
                      href={`/blog/${blog.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-muted-foreground hover:text-primary transition-colors inline-block mr-1"
                      title="View Article"
                    >
                      <Eye size={16} />
                    </a>
                    <button
                      onClick={() => handleOpenModal(blog)}
                      className="p-2 text-muted-foreground hover:text-primary transition-colors inline-block mr-1"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => blog.id && handleDelete(blog.id, blog.title)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors inline-block"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredBlogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No articles found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border/50 rounded-3xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
              <h2 className="font-serif text-xl font-medium text-foreground">
                {editingBlog ? "Edit Article" : "Create New Article"}
              </h2>
              <button onClick={handleCloseModal} className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="blog-form" onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Article Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                    placeholder="e.g. High-Throughput PBPK Workflows"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Category */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Category</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                      placeholder="e.g. PBPK, AI, News"
                    />
                  </div>

                  {/* Author */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Author</label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                      placeholder="e.g. InSilicoVida Team"
                    />
                  </div>

                  {/* Read Time */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Read Time</label>
                    <input
                      type="text"
                      value={formData.read_time}
                      onChange={(e) => setFormData({ ...formData, read_time: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                      placeholder="e.g. 5 min read"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Image URL */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Cover Image URL</label>
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Publication Date</label>
                    <input
                      type="text"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                      placeholder="July 2026"
                    />
                  </div>
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Short Excerpt *</label>
                  <textarea
                    required
                    rows={2}
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                    placeholder="Brief 1-2 sentence summary displayed on card preview..."
                  />
                </div>

                {/* Content Body */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Article Content *</label>
                  <textarea
                    required
                    rows={8}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 min-h-[160px] font-mono text-xs"
                    placeholder="Write your article body (supports markdown formatting like ### Headings, bullet points)..."
                  />
                </div>

                {/* Published Toggle */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="published-checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="w-4 h-4 rounded text-primary focus:ring-primary border-border"
                  />
                  <label htmlFor="published-checkbox" className="text-sm font-medium text-foreground cursor-pointer">
                    Publish immediately (visible to public)
                  </label>
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
                form="blog-form"
                disabled={isSaving}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                ) : (
                  <Save size={16} />
                )}
                {isSaving ? "Saving..." : "Save Article"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
