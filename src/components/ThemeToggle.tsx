import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      // Default to light mode
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full border border-border/50 hover:border-primary/30 bg-card/30 backdrop-blur-sm text-muted-foreground hover:text-foreground transition-all duration-300"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon size={15} className="transition-transform duration-300 hover:-rotate-12" />
      ) : (
        <Sun size={15} className="transition-transform duration-300 hover:rotate-45" />
      )}
    </button>
  );
};
