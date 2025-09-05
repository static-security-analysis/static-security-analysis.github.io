
import { Github, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4" id="about">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-security-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">SA</span>
              </div>
              <span className="text-xl font-bold">SecurityAnalyzers</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Your comprehensive resource for finding and comparing the best static analysis tools for security. We help developers build more secure applications by connecting them with the right tools.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><Link to="/blog" className="text-gray-400 hover:text-white transition-colors">Security Blog</Link></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Best Practices</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Tool Comparison</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Tutorials</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Submit a Tool</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center md:text-left">
          <p className="text-gray-500">
            &copy; {new Date().getFullYear()} SecurityAnalyzers. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
