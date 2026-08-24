import { useState } from "react";
import { useProjects } from "@/contexts/ProjectsContext";
import { Project } from "@/data/types";
import { Plus, Edit2, Trash2, X, Save } from "lucide-react";
import { toast } from "sonner";

export default function AdminProjectsTab() {
  const { projects, addProject, updateProject, deleteProject, uploadProjectImage } = useProjects();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    status: "active",
    date: "",
    grantNumber: "",
    funding: "",
    website: "",
    image: "",
  });

  const handleOpenModal = (project?: Project) => {
    setSelectedFile(null);
    if (project) {
      setEditingProject(project);
      setFormData({
        title: project.title,
        subtitle: project.subtitle,
        description: project.description,
        status: project.status,
        date: project.date,
        grantNumber: project.grantNumber || "",
        funding: project.funding || "",
        website: project.website || "",
        image: project.image || "",
      });
    } else {
      setEditingProject(null);
      setFormData({
        title: "",
        subtitle: "",
        description: "",
        status: "active",
        date: new Date().getFullYear().toString(),
        grantNumber: "",
        funding: "",
        website: "",
        image: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
    setSelectedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    let finalImageUrl = formData.image;

    if (selectedFile) {
      const uploadRes = await uploadProjectImage(selectedFile, formData.title || 'project');
      if (uploadRes.success && uploadRes.url) {
        finalImageUrl = uploadRes.url;
      } else {
        toast.error(uploadRes.error || "Failed to upload image.");
        setIsUploading(false);
        return;
      }
    }

    const projectData = {
      title: formData.title,
      subtitle: formData.subtitle,
      description: formData.description,
      status: formData.status as "active" | "past",
      date: formData.date,
      grantNumber: formData.grantNumber,
      funding: formData.funding,
      website: formData.website,
      image: finalImageUrl,
    };

    if (editingProject && editingProject.id) {
      const res = await updateProject(editingProject.id, projectData);
      if (res.success) {
        toast.success("Project updated successfully");
        handleCloseModal();
      } else {
        toast.error(res.error || "Failed to update project");
      }
    } else {
      const res = await addProject(projectData);
      if (res.success) {
        toast.success("Project added successfully");
        handleCloseModal();
      } else {
        toast.error(res.error || "Failed to add project");
      }
    }
    setIsUploading(false);
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete ${title}?`)) {
      const res = await deleteProject(id);
      if (res.success) {
        toast.success("Project deleted");
      } else {
        toast.error(res.error || "Failed to delete");
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-serif text-2xl text-foreground">Projects</h2>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus size={16} /> Add Project
        </button>
      </div>

      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted/30 uppercase text-xs tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Project</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{project.title}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[300px]">{project.subtitle}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${project.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{project.date}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleOpenModal(project)}
                      className="p-2 text-muted-foreground hover:text-primary transition-colors inline-block mr-2"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => project.id && handleDelete(project.id, project.title)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors inline-block"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    No projects found.
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
                {editingProject ? "Edit Project" : "Add Project"}
              </h2>
              <button onClick={handleCloseModal} className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="project-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Title</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                  {/* Subtitle */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Subtitle</label>
                    <input
                      type="text"
                      required
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                  {/* Status */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                    >
                      <option value="active">Active</option>
                      <option value="past">Past</option>
                    </select>
                  </div>
                  {/* Date */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Date/Year</label>
                    <input
                      type="text"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                  {/* Image */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Project Logo / Image</label>
                    <div className="flex items-center gap-4">
                      {/* Image Preview */}
                      <div className="w-16 h-16 shrink-0 rounded-lg border border-border/50 overflow-hidden bg-muted flex items-center justify-center p-1">
                        {(selectedFile || formData.image) ? (
                          <img 
                            src={selectedFile ? URL.createObjectURL(selectedFile) : formData.image} 
                            alt="Preview" 
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">None</span>
                        )}
                      </div>
                      
                      {/* File Input */}
                      <div className="flex-1">
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
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Description</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 min-h-[150px]"
                  />
                </div>

                <div className="border-t border-border/50 pt-6">
                  <h3 className="font-serif text-lg font-medium text-foreground mb-4">Additional Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Grant Number */}
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Grant Number</label>
                      <input
                        type="text"
                        value={formData.grantNumber}
                        onChange={(e) => setFormData({ ...formData, grantNumber: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                      />
                    </div>
                    {/* Funding */}
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Funding Agency</label>
                      <input
                        type="text"
                        value={formData.funding}
                        onChange={(e) => setFormData({ ...formData, funding: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                      />
                    </div>
                    {/* Website */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Website URL</label>
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
                form="project-form"
                disabled={isUploading}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                ) : (
                  <Save size={16} />
                )}
                {isUploading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
