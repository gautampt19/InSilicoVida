import { useState } from "react";
import { usePosters } from "@/contexts/PostersContext";
import { Poster } from "@/data/types";
import { Plus, Edit2, Trash2, X, Save, FileText, ExternalLink, Image as ImageIcon, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function AdminPostersTab() {
  const { posters, addPoster, updatePoster, deletePoster, uploadPosterImage } = usePosters();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPoster, setEditingPoster] = useState<Poster | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingZenodo, setIsFetchingZenodo] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    authors: "",
    conference: "",
    year: new Date().getFullYear().toString(),
    zenodo_url: "",
    pdf_url: "",
    image_url: "",
    description: "",
  });

  const handleOpenModal = (item?: Poster) => {
    setSelectedFile(null);
    if (item) {
      setEditingPoster(item);
      setFormData({
        title: item.title,
        authors: item.authors,
        conference: item.conference,
        year: item.year,
        zenodo_url: item.zenodo_url || "",
        pdf_url: item.pdf_url || "",
        image_url: item.image_url || "",
        description: item.description || "",
      });
    } else {
      setEditingPoster(null);
      setFormData({
        title: "",
        authors: "",
        conference: "",
        year: new Date().getFullYear().toString(),
        zenodo_url: "",
        pdf_url: "",
        image_url: "",
        description: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPoster(null);
    setSelectedFile(null);
  };

  const handleFetchFromZenodo = async () => {
    if (!formData.zenodo_url) {
      toast.error("Please enter a Zenodo URL first");
      return;
    }

    // Extract Record ID from URL (e.g. https://zenodo.org/records/10839201 or record/10839201)
    const match = formData.zenodo_url.match(/(?:records?\/|zenodo\.)([0-9]+)/i);
    if (!match || !match[1]) {
      toast.error("Could not extract Zenodo Record ID from URL");
      return;
    }

    const recordId = match[1];
    setIsFetchingZenodo(true);

    try {
      const res = await fetch(`https://zenodo.org/api/records/${recordId}`);
      if (!res.ok) throw new Error("Failed to fetch record from Zenodo API");

      const data = await res.json();
      const metadata = data.metadata || {};
      const files = data.files || [];

      // Extract title, authors, year
      const title = metadata.title || formData.title;
      const authors = metadata.creators ? metadata.creators.map((c: any) => c.name).join(", ") : formData.authors;
      const year = metadata.publication_date ? metadata.publication_date.slice(0, 4) : formData.year;
      
      // Clean HTML from description
      let description = formData.description;
      if (metadata.description) {
        description = metadata.description.replace(/<[^>]*>?/gm, '').trim().substring(0, 300);
      }

      // Look for PDF or image files in Zenodo files list
      let pdfUrl = formData.pdf_url;
      let imageUrl = formData.image_url;

      for (const file of files) {
        const rawKey = file.key || file.filename || "";
        const fileKey = rawKey.toLowerCase();
        const fileLink = file.links?.self || file.links?.content || file.links?.download || "";

        if (fileKey.endsWith('.pdf')) {
          if (!pdfUrl) pdfUrl = fileLink;
          // Generate Zenodo PDF page 1 preview image URL
          if (!imageUrl && rawKey) {
            imageUrl = `https://zenodo.org/records/${recordId}/files/${encodeURIComponent(rawKey)}/preview/1`;
          }
        }
        if (fileKey.endsWith('.png') || fileKey.endsWith('.jpg') || fileKey.endsWith('.jpeg') || fileKey.endsWith('.webp')) {
          imageUrl = fileLink;
        }
      }

      // Fallback to Zenodo's auto-generated record thumbnail if still not set
      if (!imageUrl) {
        imageUrl = `https://zenodo.org/records/${recordId}/thumb400`;
      }

      setFormData((prev) => ({
        ...prev,
        title,
        authors,
        year,
        description,
        pdf_url: pdfUrl,
        image_url: imageUrl,
      }));

      toast.success("Successfully auto-filled details from Zenodo!");
    } catch (err: any) {
      console.error("Zenodo fetch error:", err);
      toast.error("Failed to auto-fetch from Zenodo. Please fill manually.");
    } finally {
      setIsFetchingZenodo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    let finalImageUrl = formData.image_url;

    if (selectedFile) {
      const uploadRes = await uploadPosterImage(selectedFile, formData.title || 'poster');
      if (uploadRes.success && uploadRes.url) {
        finalImageUrl = uploadRes.url;
      } else {
        toast.error(uploadRes.error || "Failed to upload poster image.");
        setIsSaving(false);
        return;
      }
    }

    const posterData: Poster = {
      title: formData.title,
      authors: formData.authors,
      conference: formData.conference,
      year: formData.year,
      zenodo_url: formData.zenodo_url || undefined,
      pdf_url: formData.pdf_url || undefined,
      image_url: finalImageUrl || undefined,
      description: formData.description || undefined,
    };

    if (editingPoster && editingPoster.id) {
      const res = await updatePoster(editingPoster.id, posterData);
      if (res.success) {
        toast.success("Poster updated successfully");
        handleCloseModal();
      } else {
        toast.error(res.error || "Failed to update poster");
      }
    } else {
      const res = await addPoster(posterData);
      if (res.success) {
        toast.success("Poster added successfully");
        handleCloseModal();
      } else {
        toast.error(res.error || "Failed to add poster");
      }
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete poster "${title}"?`)) {
      const res = await deletePoster(id);
      if (res.success) {
        toast.success("Poster deleted");
      } else {
        toast.error(res.error || "Failed to delete poster");
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-serif text-2xl text-foreground flex items-center gap-2">
          <FileText size={24} className="text-primary" /> Academic Posters
        </h2>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus size={16} /> Add Poster
        </button>
      </div>

      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted/30 uppercase text-xs tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Title</th>
                <th className="px-6 py-4 font-medium">Conference</th>
                <th className="px-6 py-4 font-medium">Year</th>
                <th className="px-6 py-4 font-medium">Zenodo Link</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {posters.map((item) => (
                <tr key={item.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-4 max-w-xs truncate font-medium text-foreground">
                    {item.title}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    <span className="px-2 py-1 bg-muted rounded text-xs font-medium">
                      {item.conference}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground font-mono text-xs">
                    {item.year}
                  </td>
                  <td className="px-6 py-4 text-xs">
                    {item.zenodo_url ? (
                      <a
                        href={item.zenodo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-500 hover:underline"
                      >
                        <ExternalLink size={12} /> Zenodo
                      </a>
                    ) : (
                      <span className="text-muted-foreground/40 italic">None</span>
                    )}
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
              {posters.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No posters found. Click "Add Poster" to create one.
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
          <div className="bg-card border border-border/50 rounded-3xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
              <h2 className="font-serif text-xl font-medium text-foreground">
                {editingPoster ? "Edit Poster" : "Add Poster"}
              </h2>
              <button onClick={handleCloseModal} className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="poster-form" onSubmit={handleSubmit} className="space-y-6">

                {/* Zenodo Link & Auto Fetch */}
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
                  <label className="block text-xs font-medium text-primary mb-2 uppercase tracking-wider">Zenodo URL / DOI Link</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="url"
                      value={formData.zenodo_url}
                      onChange={(e) => setFormData({ ...formData, zenodo_url: e.target.value })}
                      className="flex-1 px-4 py-2 rounded-xl bg-background border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40"
                      placeholder="https://zenodo.org/records/10839201"
                    />
                    <button
                      type="button"
                      onClick={handleFetchFromZenodo}
                      disabled={isFetchingZenodo}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-xs tracking-wider uppercase shrink-0 hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {isFetchingZenodo ? (
                        <div className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                      ) : (
                        <Sparkles size={14} />
                      )}
                      {isFetchingZenodo ? "Fetching..." : "Auto-Fill from Zenodo"}
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2">Paste a Zenodo link and click "Auto-Fill" to automatically extract the title, authors, year, abstract, and poster file!</p>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Poster Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                    placeholder="Title of the poster..."
                  />
                </div>

                {/* Authors */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Authors</label>
                  <input
                    type="text"
                    required
                    value={formData.authors}
                    onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                    placeholder="e.g. Gautam, Vikas Kumar"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Conference */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Conference / Event</label>
                    <input
                      type="text"
                      required
                      value={formData.conference}
                      onChange={(e) => setFormData({ ...formData, conference: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                      placeholder="e.g. URV PhD Day 2026"
                    />
                  </div>

                  {/* Year */}
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

                <div className="border-t border-border/50 pt-6 space-y-6">
                  <h3 className="font-serif text-lg font-medium text-foreground">Poster Image & Preview</h3>

                  {/* Poster Image Upload or Preview */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Poster Image Preview</label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="w-24 h-32 shrink-0 rounded-xl border border-border/50 overflow-hidden bg-muted flex items-center justify-center relative">
                        {(selectedFile || formData.image_url) ? (
                          <img 
                            src={selectedFile ? URL.createObjectURL(selectedFile) : formData.image_url} 
                            alt="Poster Preview" 
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground text-center p-2">No Image</span>
                        )}
                      </div>
                      
                      <div className="flex-1 space-y-3 w-full">
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setSelectedFile(e.target.files[0]);
                              }
                            }}
                            className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                          />
                          <p className="text-[10px] text-muted-foreground mt-1">Upload a poster image file directly from your computer.</p>
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono text-muted-foreground uppercase mb-1">Or paste Image URL manually</label>
                          <input
                            type="url"
                            value={formData.image_url}
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-lg bg-background/50 border border-border/50 text-foreground text-xs focus:outline-none focus:border-primary/40"
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Direct PDF Link */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Direct PDF Download URL (Optional)</label>
                    <input
                      type="url"
                      value={formData.pdf_url}
                      onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                      placeholder="https://zenodo.org/records/.../files/poster.pdf"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Abstract / Short Description (Optional)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 min-h-[90px]"
                    placeholder="Short abstract or key takeaways..."
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
                form="poster-form"
                disabled={isSaving}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                ) : (
                  <Save size={16} />
                )}
                {isSaving ? "Saving..." : "Save Poster"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

