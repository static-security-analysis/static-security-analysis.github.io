
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onSearch={handleSearch} />
      <Hero />
      <AnalyzerList searchTerm={searchTerm} />
      <Footer />
    </div>
  );
};

export default Index;
