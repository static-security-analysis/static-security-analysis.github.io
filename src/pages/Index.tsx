import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AnalyzerList from "@/components/AnalyzerList";
import Footer from "@/components/Footer";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleTagClick = (tag: string) => {
    setSearchTerm(tag);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Hero onSearch={handleSearch} onTagClick={handleTagClick} />
      <AnalyzerList searchTerm={searchTerm} />
      <Footer />
    </div>
  );
};

export default Index;
