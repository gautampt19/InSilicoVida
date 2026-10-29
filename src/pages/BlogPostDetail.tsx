import { useParams, Link, useNavigate } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useBlog } from "@/contexts/BlogContext";
import { ArrowLeft, Calendar, Clock, Tag, Share2, Check } from "lucide-react";
import { useState } from "react";

export default function BlogPostDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { blogs, isLoading } = useBlog();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const blog = blogs.find((b) => b.slug === slug || b.id === slug);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center pt-24">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 pt-32 pb-20 px-6 text-center">
          <div className="max-w-md mx-auto">
            <h1 className="font-serif text-3xl font-medium text-foreground mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-8">The requested article could not be found or has been moved.</p>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-sm hover:bg-primary/90 transition-colors"
            >
              <ArrowLeft size={16} /> Back to Blog
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const relatedBlogs = blogs
    .filter((b) => b.slug !== blog.slug && b.published !== false)
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-20">
        <article className="container mx-auto max-w-4xl px-6">
          {/* Back link */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/blog")}
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Blog
            </button>
          </div>

          {/* Metadata badges */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {blog.category && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                <Tag size={12} /> {blog.category}
              </span>
            )}
            <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
              <Calendar size={12} /> {blog.date}
            </span>
            {blog.read_time && (
              <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                <Clock size={12} /> {blog.read_time}
              </span>
            )}
          </div>

          {/* Main Title */}
          <h1 className="font-serif text-3xl md:text-5xl font-normal text-foreground leading-tight mb-6">
            {blog.title}
          </h1>

          {/* Author & Share row */}
          <div className="flex items-center justify-between py-4 border-y border-border/40 mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                {blog.author.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">{blog.author}</div>
                <div className="text-xs text-muted-foreground">InSilicoVida Researcher</div>
              </div>
            </div>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-card hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} />}
              {copied ? "Link Copied!" : "Share Article"}
            </button>
          </div>

          {/* Cover Image */}
          {blog.image && (
            <div className="mb-12 rounded-3xl overflow-hidden border border-border/40 max-h-[460px] bg-muted">
              <img
                src={blog.image}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Lead Excerpt */}
          <div className="text-lg md:text-xl text-foreground font-medium leading-relaxed mb-8 p-6 rounded-2xl bg-muted/20 border-l-4 border-primary">
            {blog.excerpt}
          </div>

          {/* Article Body Content */}
          <div className="prose dark:prose-invert max-w-none text-foreground/90 space-y-6 text-base leading-relaxed mb-16">
            {blog.content.split('\n\n').map((paragraph, idx) => {
              const trimmed = paragraph.trim();

              // Check for markdown image: ![caption](url)
              const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
              if (imgMatch) {
                return (
                  <figure key={idx} className="my-8 rounded-2xl overflow-hidden border border-border/50 bg-muted/20">
                    <img
                      src={imgMatch[2]}
                      alt={imgMatch[1] || blog.title}
                      className="w-full h-auto max-h-[560px] object-cover mx-auto"
                      loading="lazy"
                    />
                    {imgMatch[1] && (
                      <figcaption className="text-center text-xs text-muted-foreground p-3 bg-muted/40 border-t border-border/30">
                        {imgMatch[1]}
                      </figcaption>
                    )}
                  </figure>
                );
              }

              if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={idx} className="font-serif text-2xl font-normal text-foreground mt-8 mb-4">
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              }
              if (paragraph.startsWith('1. ') || paragraph.startsWith('- ')) {
                const items = paragraph.split('\n');
                return (
                  <ul key={idx} className="list-disc list-inside space-y-2 pl-4 text-muted-foreground">
                    {items.map((item, i) => (
                      <li key={i}>{item.replace(/^(\d+\.\s*|-\s*)/, '')}</li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={idx} className="text-muted-foreground leading-relaxed">
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Related Articles */}
          {relatedBlogs.length > 0 && (
            <div className="pt-12 border-t border-border/50">
              <h2 className="font-serif text-2xl font-medium text-foreground mb-6">More Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedBlogs.map((rel) => (
                  <Link
                    key={rel.slug}
                    to={`/blog/${rel.slug}`}
                    className="p-6 border border-border/50 rounded-2xl bg-card hover:border-primary/40 transition-all block group"
                  >
                    <div className="text-xs text-primary font-mono mb-2">{rel.category}</div>
                    <h3 className="font-serif text-lg font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                      {rel.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{rel.excerpt}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </main>
      <Footer />
    </div>
  );
}
