
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

interface NavbarProps {
  onSearch: (term: string) => void;
}

export const Navbar = ({ onSearch }: NavbarProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <nav className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm py-4">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-security-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">SA</span>
            </div>
            <h1 className="text-xl font-bold text-security-900">SecurityAnalyzers</h1>
          </Link>
        </div>
        
        <form onSubmit={handleSubmit} className="hidden md:flex relative w-1/3">
          <input
            type="text"
            className="w-full rounded-full pl-10 pr-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-security-500 focus:border-transparent"
            placeholder="Search for analyzers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </form>
        
        <div className="flex items-center gap-4">
          <Link to="/#analyzers" className="text-gray-600 hover:text-security-700 transition-colors">
            Analyzers
          </Link>
          <Link to="/blog" className="text-gray-600 hover:text-security-700 transition-colors">
            Blog
          </Link>
          <Link to="/#about" className="text-gray-600 hover:text-security-700 transition-colors">
            About
          </Link>
          <Button variant="ghost" className="hidden md:flex">
            Submit Tool
          </Button>
        </div>
      </div>
      
      <div className="md:hidden mt-3 px-4">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            className="w-full rounded-full pl-10 pr-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-security-500 focus:border-transparent"
            placeholder="Search for analyzers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </form>
      </div>
    </nav>
  );
};

export default Navbar;
