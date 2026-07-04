import { Search, Code2, Braces, Layers, Heart } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface HeroProps {
  onSearch: (term: string) => void;
  onTagClick?: (tag: string) => void;
}

const POPULAR_TAGS: { label: string; icon?: React.ReactNode }[] = [
  { label: "JavaScript", icon: <Code2 className="h-3.5 w-3.5 shrink-0" /> },
  { label: "Python", icon: <Braces className="h-3.5 w-3.5 shrink-0" /> },
  { label: "Multi-language", icon: <Layers className="h-3.5 w-3.5 shrink-0" /> },
  { label: "Open Source", icon: <Heart className="h-3.5 w-3.5 shrink-0" /> },
];

const Hero = ({ onSearch, onTagClick }: HeroProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden bg-white px-4 pt-[4.5rem] pb-12 md:pt-28 md:pb-16">
      {/* +24px mobile (72px top), +48px desktop (112px top) for clear navbar separation */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(219,234,254,0.45),transparent)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl lg:text-5xl">
          Find the right{" "}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text font-bold text-transparent">
            static analysis tool
          </span>{" "}
          for your stack.
        </h1>
        <p className="mt-5 text-lg text-neutral-600 md:text-xl">
          Compare features, languages, integrations, and weaknesses.
        </p>

        <form onSubmit={handleSubmit} className="relative mt-6 w-full max-w-xl">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            className={cn(
              "w-full rounded-xl border border-neutral-300 bg-white pl-11 pr-4 py-3.5 text-base",
              "shadow-md shadow-black/10",
              "placeholder:text-neutral-400",
              "transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400",
              "text-neutral-900"
            )}
            placeholder="Search for analyzers..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              onSearch(e.target.value);
            }}
          />
        </form>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
          {POPULAR_TAGS.map(({ label, icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                setSearchTerm(label);
                onTagClick?.(label);
              }}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50/80 px-2.5 py-1 text-xs font-medium text-neutral-600",
                "cursor-pointer transition-colors hover:bg-neutral-100",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
              )}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
