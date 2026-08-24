import { useState } from "react";
import { useSoftware } from "@/contexts/SoftwareContext";
import { Software } from "@/data/types";
import { Plus, Edit2, Trash2, X, Save } from "lucide-react";
import { toast } from "sonner";

export default function AdminSoftwareTab() {
  const { software, addSoftware, updateSoftware, deleteSoftware } = useSoftware();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSoftware, setEditingSoftware] = useState<Software | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    language: "",
    stars: 0,
    license: "",
    github: "",
    doi: "",
    website: "",
    category: "pbpk",
    date: "",
  });

  const handleOpenModal = (tool?: Software) => {
    if (tool) {
      setEditingSoftware(tool);
      setFormData({
        name: tool.name,
        description: tool.description,
        language: tool.language || "",
        stars: tool.stars || 0,
        license: tool.license || "",
        github: tool.github || "",
        doi: tool.doi || "",
        website: tool.website || "",
        category: tool.category || "pbpk",
        date: tool.date || "",
      });
    } else {
      setEditingSoftware(null);
      setFormData({
        name: "",
        description: "",
        language: "",
        stars: 0,
        license: "",
        github: "",
        doi: "",
        website: "",
        category: "pbpk",
        date: new Date().getFullYear().toString(),
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSoftware(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const softwareData: Software = {
      name: formData.name,
      description: formData.description,
      language: formData.language,
      stars: formData.stars,
      license: formData.license,
      github: formData.github,
      doi: formData.doi,
      website: formData.website,
      category: formData.category as "pbpk" | "text-mining" | "omics",
      date: formData.date,
    };

    if (editingSoftware && editingSoftware.id) {
      const res = await updateSoftware(editingSoftware.id, softwareData);
      if (res.success) {
        toast.success("Software updated successfully");
        handleCloseModal();
      } else {
        toast.error(res.error || "Failed to update software");
      }
    } else {
      const res = await addSoftware(softwareData);
      if (res.success) {
        toast.success("Software added successfully");
        handleCloseModal();
      } else {
        toast.error(res.error || "Failed to add software");
      }
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      const res = await deleteSoftware(id);
      if (res.success) {
        toast.success("Software deleted");
      } else {
        toast.error(res.error || "Failed to delete");
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-serif text-2xl text-foreground">Software & Tools</h2>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus size={16} /> Add Software
        </button>
      </div>

      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted/30 uppercase text-xs tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Language</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {software.map((tool) => (
                <tr key={tool.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-medium text-foreground">{tool.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-muted rounded text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                      {tool.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{tool.language || "-"}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleOpenModal(tool)}
                      className="p-2 text-muted-foreground hover:text-primary transition-colors inline-block mr-2"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => tool.id && handleDelete(tool.id, tool.name)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors inline-block"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {software.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    No software tools found.
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
                {editingSoftware ? "Edit Software" : "Add Software"}
              </h2>
              <button onClick={handleCloseModal} className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="software-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                  {/* Category */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                    >
                      <option value="pbpk">PBPK</option>
                      <option value="text-mining">Text Mining</option>
                      <option value="omics">Omics</option>
                    </select>
                  </div>
                  {/* Language */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Primary Language</label>
                    <input
                      type="text"
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                      placeholder="e.g. Python, R, C++"
                    />
                  </div>
                  {/* License */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">License</label>
                    <input
                      type="text"
                      value={formData.license}
                      onChange={(e) => setFormData({ ...formData, license: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                      placeholder="e.g. MIT, GPL-3.0"
                    />
                  </div>
                  {/* Date */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Date / Year</label>
                    <input
                      type="text"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                    />
                  </div>

                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Description</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 min-h-[120px]"
                  />
                </div>

                <div className="border-t border-border/50 pt-6">
                  <h3 className="font-serif text-lg font-medium text-foreground mb-4">External Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* GitHub */}
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">GitHub URL</label>
                      <input
                        type="url"
                        value={formData.github}
                        onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                      />
                    </div>
                    {/* DOI */}
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">DOI Link (Paper)</label>
                      <input
                        type="url"
                        value={formData.doi}
                        onChange={(e) => setFormData({ ...formData, doi: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                      />
                    </div>
                    {/* Website */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Website / Documentation URL</label>
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                      />
                    </div>
                  </div>
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
                form="software-form"
                disabled={isSaving}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                ) : (
                  <Save size={16} />
                )}
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
