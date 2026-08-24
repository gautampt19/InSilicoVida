import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Research from "./pages/Research";
import ResearchProjects from "./pages/ResearchProjects";

import Software from "./pages/Software";
import Posters from "./pages/Posters";
import Team from "./pages/Team";
import TeamMemberProfile from "./pages/TeamMemberProfile";
import Contact from "./pages/Contact";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import TestingPublications from "./pages/TestingPublications";
import TeamMemberPageV2 from "./pages/TeamMemberPageV2";
import NotFound from "./pages/NotFound";
import Blog from "./pages/Blog";
import BlogPostDetail from "./pages/BlogPostDetail";
import { AuthProvider } from "@/contexts/AuthContext";
import { TeamProvider } from "@/contexts/TeamContext";
import { ProjectsProvider } from "@/contexts/ProjectsContext";
import { SoftwareProvider } from "@/contexts/SoftwareContext";
import { NewsProvider } from "@/contexts/NewsContext";
import { PostersProvider } from "@/contexts/PostersContext";
import { PublicationsProvider } from "@/contexts/PublicationsContext";
import { HomeProvider } from "@/contexts/HomeContext";
import { BlogProvider } from "@/contexts/BlogContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <HomeProvider>
        <TeamProvider>
          <PublicationsProvider>
            <ProjectsProvider>
              <SoftwareProvider>
                <NewsProvider>
                  <PostersProvider>
                    <BlogProvider>
                      <TooltipProvider>
                        <Toaster />
                        <Sonner />
                        <BrowserRouter basename={import.meta.env.BASE_URL}>
                          <Routes>
                            <Route path="/" element={<Index />} />
                            <Route path="/research" element={<Research />} />
                            <Route path="/projects" element={<ResearchProjects />} />
                            <Route path="/publications" element={<TestingPublications />} />
                            <Route path="/software" element={<Software />} />
                            <Route path="/posters" element={<Posters />} />
                            <Route path="/blog" element={<Blog />} />
                            <Route path="/blog/:slug" element={<BlogPostDetail />} />
                            <Route path="/team" element={<Team />} />
                            <Route path="/team/:memberSlug" element={<TeamMemberPageV2 />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="/admin" element={<AdminLogin />} />
                            <Route path="/admin/dashboard" element={<AdminDashboard />} />

                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </BrowserRouter>
                      </TooltipProvider>
                    </BlogProvider>
                  </PostersProvider>
                </NewsProvider>
              </SoftwareProvider>
            </ProjectsProvider>
          </PublicationsProvider>
        </TeamProvider>
      </HomeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
