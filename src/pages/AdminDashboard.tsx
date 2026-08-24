import { useState } from "react";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Users, FileText, Code, Newspaper, Home, BookOpen } from "lucide-react";
import AdminTeamTab from "@/components/admin/AdminTeamTab";
import AdminProjectsTab from "@/components/admin/AdminProjectsTab";
import AdminSoftwareTab from "@/components/admin/AdminSoftwareTab";
import AdminNewsTab from "@/components/admin/AdminNewsTab";
import AdminPostersTab from "@/components/admin/AdminPostersTab";
import AdminHomepageTab from "@/components/admin/AdminHomepageTab";
import AdminBlogTab from "@/components/admin/AdminBlogTab";

export default function AdminDashboard() {
  const { isAdmin, isLoading: authLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'home' | 'team' | 'projects' | 'software' | 'news' | 'posters' | 'blog'>('home');

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen bg-background relative z-10 flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl text-foreground font-normal mb-2">
                Admin <span className="text-gradient">Dashboard</span>
              </h1>
              <p className="text-sm text-muted-foreground">Manage your website data.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={logout}
                className="flex items-center gap-2 border border-border/50 bg-card hover:bg-muted/50 px-5 py-2.5 rounded-full text-sm font-medium transition-colors text-muted-foreground hover:text-foreground"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-8">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === 'home' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-card border border-border/50 text-muted-foreground hover:text-foreground'}`}
            >
              <Home size={16} /> Homepage
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === 'team' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-card border border-border/50 text-muted-foreground hover:text-foreground'}`}
            >
              <Users size={16} /> Team Members
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === 'projects' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-card border border-border/50 text-muted-foreground hover:text-foreground'}`}
            >
              <FileText size={16} /> Projects
            </button>
            <button
              onClick={() => setActiveTab('software')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === 'software' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-card border border-border/50 text-muted-foreground hover:text-foreground'}`}
            >
              <Code size={16} /> Software
            </button>
            <button
              onClick={() => setActiveTab('news')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === 'news' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-card border border-border/50 text-muted-foreground hover:text-foreground'}`}
            >
              <Newspaper size={16} /> News
            </button>
            <button
              onClick={() => setActiveTab('posters')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === 'posters' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-card border border-border/50 text-muted-foreground hover:text-foreground'}`}
            >
              <FileText size={16} /> Posters
            </button>
            <button
              onClick={() => setActiveTab('blog')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === 'blog' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-card border border-border/50 text-muted-foreground hover:text-foreground'}`}
            >
              <BookOpen size={16} /> Blog Articles
            </button>
          </div>

          {activeTab === 'home' && <AdminHomepageTab />}
          {activeTab === 'team' && <AdminTeamTab />}
          {activeTab === 'projects' && <AdminProjectsTab />}
          {activeTab === 'software' && <AdminSoftwareTab />}
          {activeTab === 'news' && <AdminNewsTab />}
          {activeTab === 'posters' && <AdminPostersTab />}
          {activeTab === 'blog' && <AdminBlogTab />}

        </div>
      </main>
      <Footer />
    </div>
  );
}
