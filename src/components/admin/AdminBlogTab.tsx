import { useState } from "react";
import { useBlog } from "@/contexts/BlogContext";
import { BlogPost } from "@/data/types";
import { Plus, Edit2, Trash2, X, Save, BookOpen, Search, Eye, CheckCircle, Clock, Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export default function AdminBlogTab() {
  const { blogs, addBlog, updateBlog, deleteBlog, uploadImage } = useBlog();

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingBodyImage, setIsUploadingBodyImage] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

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
    setSelectedFile(null);
    setFilePreview(null);
    setIsUploadingBodyImage(false);

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
    setSelectedFile(null);
    setFilePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    let finalImageUrl = formData.image;

    // If an image file was selected for cover, upload it to Supabase storage bucket 'blog-images'
    if (selectedFile) {
      const uploadRes = await uploadImage(selectedFile, formData.title || 'blog');
      if (uploadRes.success && uploadRes.url) {
        finalImageUrl = uploadRes.url;
      } else {
        toast.error(uploadRes.error || "Failed to upload blog cover image");
        setIsSaving(false);
        return;
      }
    }

    const generatedSlug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const blogData: BlogPost = {
      title: formData.title,
      slug: generatedSlug,
      author: formData.author,
      date: formData.date,
      category: formData.category,
      read_time: formData.read_time,
      image: finalImageUrl || "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=1200",
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
          <p className="text-xs text-muted-foreground mt-1">Publish, edit, and upload pictures for research articles and insights.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
        >
          <Plus size={16} /> New Article
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search articles by title, author, or category..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 shadow-2xs"
        />
      </div>

      {/* Articles Table */}
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted/30 uppercase text-xs tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Article</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Author</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filteredBlogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No articles found. Click "New Article" to write one.
                  </td>
                </tr>
              ) : (
                filteredBlogs.map((blog) => (
                  <tr key={blog.id || blog.slug} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4 max-w-[340px]">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-10 rounded-lg overflow-hidden bg-muted/40 shrink-0 border border-border/50">
                          {blog.image ? (
                            <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <BookOpen size={16} />
                            </div>
                          )}
                        </div>
                        <div className="truncate">
                          <p className="font-medium text-foreground truncate">{blog.title}</p>
                          <p className="text-xs text-muted-foreground truncate font-mono mt-0.5">/{blog.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                        {blog.category || "General"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{blog.author}</td>
                    <td className="px-6 py-4 text-muted-foreground">{blog.date}</td>
                    <td className="px-6 py-4">
                      {blog.published !== false ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle size={14} /> Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
                          <Clock size={14} /> Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a
                        href={`/blog/${blog.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-muted-foreground hover:text-primary transition-colors inline-block mr-1"
                        title="View Article Live"
                      >
                        <Eye size={16} />
                      </a>
                      <button
                        onClick={() => handleOpenModal(blog)}
                        className="p-2 text-muted-foreground hover:text-primary transition-colors inline-block mr-1 cursor-pointer"
                        title="Edit Article"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(blog.id || "", blog.title)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors inline-block cursor-pointer"
                        title="Delete Article"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border/50 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-border/50">
              <h3 className="font-serif text-lg font-medium text-foreground">
                {editingBlog ? "Edit Article" : "Write New Article"}
              </h3>
              <button onClick={handleCloseModal} className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer">
                <X size={18} />
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

                {/* Cover Image Upload & URL */}
                <div className="border border-border/50 rounded-xl p-4 bg-muted/10 space-y-4">
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon size={14} className="text-primary" /> Cover Picture (Header Image)
                  </label>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Thumbnail preview */}
                    <div className="w-24 h-20 rounded-xl overflow-hidden bg-muted/30 border border-border/60 shrink-0 flex items-center justify-center">
                      {(filePreview || formData.image) ? (
                        <img
                          src={filePreview || formData.image}
                          alt="Cover Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=300";
                          }}
                        />
                      ) : (
                        <ImageIcon size={24} className="text-muted-foreground/40" />
                      )}
                    </div>

                    <div className="flex-1 w-full space-y-2">
                      {/* Direct file upload */}
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              setSelectedFile(file);
                              setFilePreview(URL.createObjectURL(file));
                            }
                          }}
                          className="w-full text-xs text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                        />
                        <p className="text-[10px] text-muted-foreground mt-1">Upload an image file from your device (automatically stored in Supabase Storage).</p>
                      </div>

                      {/* Or image URL */}
                      <div>
                        <input
                          type="url"
                          value={formData.image}
                          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg bg-background/50 border border-border/50 text-foreground text-xs focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 font-mono"
                          placeholder="Or paste external image URL: https://images.unsplash.com/..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Publication Date</label>
                    <input
                      type="text"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                      placeholder="e.g. July 2026"
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Custom Slug (optional)</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 font-mono text-xs"
                      placeholder="auto-generated-from-title"
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

                {/* Content Body with Insert Picture Tool */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Article Content *</label>
                    
                    {/* Quick Button to Upload and Insert Pictures inside the Article Body */}
                    <label className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium cursor-pointer transition-colors shadow-2xs">
                      <Upload size={12} className={isUploadingBodyImage ? "animate-spin" : ""} />
                      <span>{isUploadingBodyImage ? "Uploading..." : "Insert Picture into Article"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploadingBodyImage}
                        onChange={async (e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            setIsUploadingBodyImage(true);
                            const res = await uploadImage(file, `${formData.title || 'article'}_figure`);
                            if (res.success && res.url) {
                              const imgCaption = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
                              const imageMarkdown = `\n\n![${imgCaption}](${res.url})\n\n`;
                              setFormData((prev) => ({
                                ...prev,
                                content: prev.content + imageMarkdown,
                              }));
                              toast.success("Picture uploaded and inserted into article body!");
                            } else {
                              toast.error(res.error || "Failed to upload picture");
                            }
                            setIsUploadingBodyImage(false);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <textarea
                    required
                    rows={9}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 min-h-[180px] font-mono text-xs leading-relaxed"
                    placeholder="Write article body (Markdown: ### Headings, bullet lists, or click 'Insert Picture into Article' to embed figures)..."
                  />
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    💡 Tip: Click <strong>Insert Picture into Article</strong> above to upload figures directly into the text, or write markdown like <code className="text-primary font-mono">### Section Title</code>.
                  </p>
                </div>

                {/* Published Toggle */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="published"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="w-4 h-4 rounded text-primary focus:ring-primary/20 border-border"
                  />
                  <label htmlFor="published" className="text-sm font-medium text-foreground cursor-pointer">
                    Publish immediately (visible on public /blog page)
                  </label>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-border/50 flex justify-end gap-3 bg-muted/10">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-5 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="blog-form"
                disabled={isSaving}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
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
