import { useState, useMemo } from "react";
import { useTeam } from "@/contexts/TeamContext";
import { TeamMember } from "@/data/types";
import { Plus, Edit2, Trash2, X, Save } from "lucide-react";
import { toast } from "sonner";

export default function AdminTeamTab() {
  const { teamMembers, addTeamMember, updateTeamMember, deleteTeamMember, uploadImage } = useTeam();

  const sortedTeamMembers = useMemo(() => {
    const hierarchyOrder: Record<string, number> = {
      leader: 1,
      researcher: 2,
      phd: 3,
      visiting: 4,
      alumni: 5,
    };
    return [...teamMembers].sort((a, b) => {
      const orderA = hierarchyOrder[a.hierarchy || "researcher"] || 6;
      const orderB = hierarchyOrder[b.hierarchy || "researcher"] || 6;
      return orderA - orderB;
    });
  }, [teamMembers]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    hierarchy: "researcher",
    bio: "",
    image: "",
    email: "",
    orcid: "",
    github: "",
    scholar: "",
    twitter: "",
    linkedin: "",
  });

  const handleOpenModal = (member?: TeamMember) => {
    setSelectedFile(null);
    if (member) {
      setEditingMember(member);
      setFormData({
        name: member.name,
        role: member.role,
        hierarchy: member.hierarchy || "researcher",
        bio: member.bio,
        image: member.image,
        email: member.links?.email || "",
        orcid: member.links?.orcid || "",
        github: member.links?.github || "",
        scholar: member.links?.["google scholar"] || "",
        twitter: member.links?.twitter || "",
        linkedin: member.links?.LinkedIn || "",
      });
    } else {
      setEditingMember(null);
      setFormData({
        name: "",
        role: "",
        hierarchy: "researcher",
        bio: "",
        image: "",
        email: "",
        orcid: "",
        github: "",
        scholar: "",
        twitter: "",
        linkedin: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMember(null);
    setSelectedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    let finalImageUrl = formData.image;
    
    if (selectedFile) {
      const uploadRes = await uploadImage(selectedFile, formData.name || 'member');
      if (uploadRes.success && uploadRes.url) {
        finalImageUrl = uploadRes.url;
      } else {
        toast.error(uploadRes.error || "Failed to upload image.");
        setIsUploading(false);
        return;
      }
    }
    
    const memberData = {
      name: formData.name,
      role: formData.role,
      hierarchy: formData.hierarchy as "leader" | "researcher" | "phd" | "visiting" | "alumni",
      bio: formData.bio,
      image: finalImageUrl,
      links: {
        ...(formData.email && { email: formData.email }),
        ...(formData.orcid && { orcid: formData.orcid }),
        ...(formData.github && { github: formData.github }),
        ...(formData.scholar && { "google scholar": formData.scholar }),
        ...(formData.twitter && { twitter: formData.twitter }),
        ...(formData.linkedin && { LinkedIn: formData.linkedin }),
      },
    };

    if (editingMember && editingMember.id) {
      const res = await updateTeamMember(editingMember.id, memberData);
      if (res.success) {
        toast.success("Team member updated successfully");
        handleCloseModal();
      } else {
        toast.error(res.error || "Failed to update team member");
      }
    } else {
      const res = await addTeamMember(memberData);
      if (res.success) {
        toast.success("Team member added successfully");
        handleCloseModal();
      } else {
        toast.error(res.error || "Failed to add team member");
      }
    }
    setIsUploading(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      const res = await deleteTeamMember(id);
      if (res.success) {
        toast.success("Team member deleted");
      } else {
        toast.error(res.error || "Failed to delete");
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-serif text-2xl text-foreground">Team Members</h2>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus size={16} /> Add Member
        </button>
      </div>

      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted/30 uppercase text-xs tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Member</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Hierarchy</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {sortedTeamMembers.map((member) => (
                <tr key={member.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={member.image || "https://via.placeholder.com/150"} 
                        alt={member.name} 
                        className="w-10 h-10 rounded-full object-cover bg-muted"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'}}
                      />
                      <span className="font-medium text-foreground">{member.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{member.role}</td>
                  <td className="px-6 py-4 text-muted-foreground capitalize">{member.hierarchy}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleOpenModal(member)}
                      className="p-2 text-muted-foreground hover:text-primary transition-colors inline-block mr-2"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => member.id && handleDelete(member.id, member.name)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors inline-block"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {teamMembers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    No team members found.
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
                {editingMember ? "Edit Team Member" : "Add Team Member"}
              </h2>
              <button onClick={handleCloseModal} className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="member-form" onSubmit={handleSubmit} className="space-y-6">
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
                  {/* Role */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Display Role</label>
                    <input
                      type="text"
                      required
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                      placeholder="e.g. Group Leader, PhD Student"
                    />
                  </div>
                  {/* Hierarchy */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Hierarchy Section</label>
                    <select
                      value={formData.hierarchy}
                      onChange={(e) => setFormData({ ...formData, hierarchy: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                    >
                      <option value="leader">Group Leader</option>
                      <option value="researcher">Researcher</option>
                      <option value="phd">PhD Student</option>
                      <option value="visiting">Visiting Scientist & Trainee</option>
                      <option value="alumni">Alumni</option>
                    </select>
                  </div>
                  {/* Image */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Profile Image</label>
                    <div className="flex items-center gap-4">
                      {/* Image Preview */}
                      <div className="w-16 h-16 shrink-0 rounded-full border border-border/50 overflow-hidden bg-muted flex items-center justify-center">
                        {(selectedFile || formData.image) ? (
                          <img 
                            src={selectedFile ? URL.createObjectURL(selectedFile) : formData.image} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
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
                        <p className="text-[10px] text-muted-foreground mt-1">Upload a new image from your computer.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Biography</label>
                  <textarea
                    required
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 min-h-[100px]"
                  />
                </div>

                <div className="border-t border-border/50 pt-6">
                  <h3 className="font-serif text-lg font-medium text-foreground mb-4">Links & Socials</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Email */}
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                      />
                    </div>
                    {/* ORCID */}
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">ORCID</label>
                      <input
                        type="text"
                        value={formData.orcid}
                        onChange={(e) => setFormData({ ...formData, orcid: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                        placeholder="0000-0000-0000-0000"
                      />
                    </div>
                    {/* GitHub */}
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">GitHub Username</label>
                      <input
                        type="text"
                        value={formData.github}
                        onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                      />
                    </div>
                    {/* Google Scholar */}
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Google Scholar URL</label>
                      <input
                        type="url"
                        value={formData.scholar}
                        onChange={(e) => setFormData({ ...formData, scholar: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                      />
                    </div>
                    {/* LinkedIn */}
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">LinkedIn URL</label>
                      <input
                        type="text"
                        value={formData.linkedin}
                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                      />
                    </div>
                    {/* Twitter */}
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Twitter Username</label>
                      <input
                        type="text"
                        value={formData.twitter}
                        onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
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
                form="member-form"
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
