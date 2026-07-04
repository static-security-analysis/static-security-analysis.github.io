import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useCompare } from "@/contexts/CompareContext";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { compareIds } = useCompare();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => {
    if (path === "/#analyzers")
      return (
        location.hash === "#analyzers" ||
        (location.pathname === "/" && !location.hash)
      );
    return location.pathname === path;
  };

  const navLinkClass = (active: boolean) =>
    cn(
      "text-sm font-medium transition-colors",
      active
        ? "text-blue-600 font-semibold underline underline-offset-4"
        : "text-neutral-700 hover:text-neutral-900 hover:opacity-80"
    );

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200/60 transition-[background-color] duration-300",
        "py-3 md:py-4 min-h-[64px] flex items-center",
        isScrolled && "bg-white/95"
      )}
    >
      <div className="max-w-7xl mx-auto w-full px-4 flex items-center justify-between gap-8 md:gap-10">
        <Link
          to="/"
          className="shrink-0 flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="bg-blue-600 p-1 rounded-lg">
             <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
              aria-hidden
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-neutral-900">
            AppSecHub
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/#analyzers" className={navLinkClass(isActive("/#analyzers"))}>
            Analyzers
          </Link>
          <Link to="/papers" className={navLinkClass(isActive("/papers"))}>
            Papers
          </Link>
          <Link to="/graph" className={navLinkClass(isActive("/graph"))}>
            Graph
          </Link>
          <Link to="/trends" className={navLinkClass(isActive("/trends"))}>
            Trends
          </Link>
          {compareIds.length >= 1 && (
            <Link
              to={`/compare?ids=${compareIds.join(",")}`}
              className={navLinkClass(location.pathname === "/compare")}
            >
              Compare ({compareIds.length})
            </Link>
          )}
          <Link to="/about" className={navLinkClass(isActive("/about"))}>
            About
          </Link>
          <Link
            to="/submit"
            className="hidden md:inline-flex rounded-md px-3 py-1.5 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Submit Tool
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
