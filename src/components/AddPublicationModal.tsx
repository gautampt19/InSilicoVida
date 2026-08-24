import { useState } from "react";
import { X } from "lucide-react";
import { Publication } from "@/data/types";
import { toast } from "sonner";

interface AddPublicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (pub: Publication) => void;
}

const AddPublicationModal = ({ isOpen, onClose, onAdd }: AddPublicationModalProps) => {
  const [formData, setFormData] = useState<Partial<Publication>>({
    title: "",
    authors: "",
    journal: "",
    year: new Date().getFullYear().toString(),
    doi: "",
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.authors || !formData.journal || !formData.year || !formData.doi) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const newPublication: Publication = {
      id: crypto.randomUUID(),
      title: formData.title as string,
      authors: formData.authors as string,
      journal: formData.journal as string,
      year: formData.year as string,
      doi: formData.doi as string,
      // Optional image can be added here if desired later
    };

    onAdd(newPublication);
    toast.success("Publication added successfully!");
    setFormData({
      title: "",
      authors: "",
      journal: "",
      year: new Date().getFullYear().toString(),
      doi: "",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card w-full max-w-lg rounded-3xl border border-border/50 shadow-2xl relative animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <h2 className="font-serif text-xl font-medium text-foreground">Add Publication</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
              Title *
            </label>
            <textarea
              name="title"
              value={formData.title}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/50 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 text-sm resize-none"
              placeholder="e.g. A novel approach to..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
              Authors *
            </label>
            <input
              type="text"
              name="authors"
              value={formData.authors}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/50 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 text-sm"
              placeholder="e.g. Smith J., Doe A."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                Journal *
              </label>
              <input
                type="text"
                name="journal"
                value={formData.journal}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/50 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 text-sm"
                placeholder="e.g. Nature"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                Year *
              </label>
              <input
                type="text"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/50 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
              DOI *
            </label>
            <input
              type="text"
              name="doi"
              value={formData.doi}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/50 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 text-sm"
              placeholder="e.g. 10.1038/s41586..."
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-border/50 text-muted-foreground text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity shadow-md shadow-primary/20"
            >
              Add Publication
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPublicationModal;
