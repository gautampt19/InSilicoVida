import { useRef, useState, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Search, BookOpen, Calendar, Clock, User, ArrowRight, Tag } from "lucide-react";
import { useBlog } from "@/contexts/BlogContext";
import { useGSAP } from "@/hooks/useGSAP";
import { fadeInUp, scrollStagger } from "@/utils/animations";
import { AnimatedNetwork } from "@/components/AnimatedNetwork";
import { BlogPost } from "@/data/types";
import { Link } from "react-router-dom";

const Blog = () => {
  const { blogs, isLoading } = useBlog();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const headerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    blogs.forEach((b) => {
      if (b.category) set.add(b.category);
    });
    return ["all", ...Array.from(set)];
  }, [blogs]);

  // Filter published blogs by query & category
  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      if (b.published === false) return false;
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.excerpt.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        (b.category && b.category.toLowerCase().includes(q));
      const matchesCategory = selectedCategory === "all" || b.category === selectedCategory;
      return matchesQuery && matchesCategory;
    });
  }, [blogs, query, selectedCategory]);

  // Featured article is the first article
  const featuredBlog = filteredBlogs[0];
  const remainingBlogs = filteredBlogs.slice(1);

  useGSAP(() => {
    if (isLoading) return;

    if (headerRef.current) {
      fadeInUp(headerRef.current, { delay: 0.2, duration: 0.8 });
    }
    if (searchRef.current) {
      fadeInUp(searchRef.current, { delay: 0.4, duration: 0.6 });
    }
    if (gridRef.current) {
      const cards = gridRef.current.querySelectorAll(".blog-card");
      scrollStagger(cards, {
        start: "top 85%",
        stagger: 0.08,
        once: true,
        trigger: gridRef.current,
      });
    }
  }, [filteredBlogs, isLoading]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="relative pt-12 pb-16 px-6 overflow-hidden">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-primary/5 via-primary/5 to-transparent" />
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] opacity-70 translate-x-1/3 -translate-y-1/3" />
            <div className="absolute top-1/2 left-1/4 w-[1000px] h-[500px] -translate-y-1/2 opacity-20">
              <AnimatedNetwork />
            </div>
            <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-background to-transparent" />
            <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-background to-transparent" />
          </div>

          <div className="container mx-auto max-w-7xl relative z-10">
            <div ref={headerRef} className="max-w-3xl" style={{ opacity: 0 }}>
              <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold text-xs tracking-widest uppercase border border-primary/20 mb-4">
                <BookOpen size={14} /> Knowledge & Research
              </p>
              <h1 className="font-serif text-3xl md:text-5xl font-normal leading-tight mb-4 text-foreground">
                InSilicoVida <span className="text-primary">Blog</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Insights, tutorials, and research updates on PBPK modeling, computational toxicology, machine learning, and FAIR bio-data frameworks.
              </p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="pb-20 px-6">
          <div className="container mx-auto max-w-7xl">
            {/* Search & Category Pills */}
            <div ref={searchRef} className="mb-12 flex flex-col md:flex-row gap-6 justify-between items-stretch md:items-center" style={{ opacity: 0 }}>
              <div className="relative flex-1 max-w-xl">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search articles by topic, author, or keyword..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-card border border-border/50 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all text-sm shadow-sm"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                      selectedCategory === cat
                        ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                        : "bg-card border border-border/50 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat === "all" ? "All Topics" : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Articles List */}
            {isLoading ? (
              <div className="py-20 flex justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredBlogs.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground border border-dashed border-border/50 rounded-3xl bg-card/20">
                <BookOpen size={36} className="mx-auto mb-3 opacity-40 text-primary" />
                <p className="text-lg font-medium text-foreground">No articles found</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Try clearing your search or category filter.
                </p>
              </div>
            ) : (
              <div>
                {/* Featured Blog Header Card */}
                {featuredBlog && !query && selectedCategory === "all" && (
                  <div className="mb-12">
                    <FeaturedBlogCard blog={featuredBlog} />
                  </div>
                )}

                {/* Grid of Articles */}
                <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {(query || selectedCategory !== "all" ? filteredBlogs : remainingBlogs).map((blog) => (
                    <BlogCard key={blog.id || blog.slug} blog={blog} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

/* ─── Featured Article Card Component ─── */
const FeaturedBlogCard = ({ blog }: { blog: BlogPost }) => {
  return (
    <Link
      to={`/blog/${blog.slug}`}
      className="group grid grid-cols-1 lg:grid-cols-12 gap-8 border border-border/50 rounded-3xl bg-card hover:border-primary/40 hover:shadow-xl transition-all duration-300 overflow-hidden p-6 md:p-8"
    >
      <div className="lg:col-span-7 flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              <Tag size={12} /> Featured Article
            </span>
            <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
              <Calendar size={12} /> {blog.date}
            </span>
            {blog.read_time && (
              <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                <Clock size={12} /> {blog.read_time}
              </span>
            )}
          </div>

          <h2 className="font-serif text-2xl md:text-4xl font-normal text-foreground group-hover:text-primary transition-colors leading-tight mb-4">
            {blog.title}
          </h2>

          <p className="text-muted-foreground text-base leading-relaxed mb-6">
            {blog.excerpt}
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border/40">
          <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
            <User size={14} className="text-primary" /> {blog.author}
          </span>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:translate-x-1 transition-transform">
            Read Full Article <ArrowRight size={16} />
          </span>
        </div>
      </div>

      {blog.image && (
        <div className="lg:col-span-5 h-64 lg:h-auto rounded-2xl overflow-hidden bg-muted relative">
          <img
            src={blog.image}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
    </Link>
  );
};

/* ─── Standard Article Card Component ─── */
const BlogCard = ({ blog }: { blog: BlogPost }) => {
  return (
    <article className="blog-card group flex flex-col border border-border/50 rounded-2xl bg-card hover:border-primary/40 hover:shadow-lg transition-all duration-300 overflow-hidden h-full" style={{ opacity: 0 }}>
      {blog.image && (
        <Link to={`/blog/${blog.slug}`} className="h-48 w-full overflow-hidden bg-muted relative block">
          <img
            src={blog.image}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {blog.category && (
            <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-background/80 backdrop-blur-md text-foreground border border-border/40">
              {blog.category}
            </span>
          )}
        </Link>
      )}

      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3 font-mono">
          <span className="flex items-center gap-1"><Calendar size={12} /> {blog.date}</span>
          {blog.read_time && <span>•</span>}
          {blog.read_time && <span className="flex items-center gap-1"><Clock size={12} /> {blog.read_time}</span>}
        </div>

        <Link to={`/blog/${blog.slug}`}>
          <h3 className="font-serif text-xl font-medium text-foreground group-hover:text-primary transition-colors leading-snug mb-3 line-clamp-2">
            {blog.title}
          </h3>
        </Link>

        <p className="text-sm text-muted-foreground line-clamp-3 mb-6 leading-relaxed flex-1">
          {blog.excerpt}
        </p>

        <div className="pt-4 border-t border-border/40 flex items-center justify-between text-xs mt-auto">
          <span className="text-muted-foreground flex items-center gap-1 font-medium">
            <User size={12} className="text-primary" /> {blog.author}
          </span>
          <Link
            to={`/blog/${blog.slug}`}
            className="text-primary font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
          >
            Read <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default Blog;
