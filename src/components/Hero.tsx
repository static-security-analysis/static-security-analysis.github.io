
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck } from "lucide-react";

const Hero = () => {
  return (
    <section className="py-16 px-4 md:py-24 bg-gradient-to-br from-security-800 via-security-900 to-slate-900 text-white">
      <div className="container max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/2 text-center md:text-left">
            <div className="inline-block p-2 bg-security-700/30 rounded-lg mb-4">
              <ShieldCheck className="text-security-200" size={28} />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
              Discover the Best <span className="text-security-300">Security Static Analyzers</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-xl">
              Find and compare the perfect static analysis tools to protect your code from security vulnerabilities and ensure compliance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button size="lg" className="bg-security-500 hover:bg-security-600 text-white">
                <a href="#analyzers" className="flex items-center gap-2">
                  Browse Analyzers <ArrowRight size={18} />
                </a>
              </Button>
              {/* 
              <Button variant="outline" size="lg" className="border-white/30 hover:bg-white/10 text-white">
                Learn More
              </Button>
              */}
            </div>
          </div>
          
          <div className="md:w-1/2 mt-8 md:mt-0">
            <div className="relative bg-security-800/70 p-6 rounded-xl border border-security-700/50 shadow-xl">
              <div className="absolute -top-3 -left-3 w-16 h-16 bg-security-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-mono font-bold">01</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 ml-10">Find vulnerabilities early</h3>
              <p className="text-gray-300 ml-10">Detect security issues before they reach production</p>
              
              <div className="mt-6 bg-security-700/30 p-4 rounded-lg">
                <h4 className="text-security-300 font-medium mb-2">Popular Categories</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-security-700/50 rounded-full text-sm">SAST</span>
                  <span className="px-3 py-1 bg-security-700/50 rounded-full text-sm">Open Source</span>
                  <span className="px-3 py-1 bg-security-700/50 rounded-full text-sm">Commercial</span>
                  <span className="px-3 py-1 bg-security-700/50 rounded-full text-sm">CI/CD Integration</span>
                  <span className="px-3 py-1 bg-security-700/50 rounded-full text-sm">Multi-language</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
