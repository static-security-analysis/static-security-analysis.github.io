import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Clock, User } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: "Top 10 SAST Tools for 2023",
      excerpt: "Discover the best static analysis security tools that help developers identify vulnerabilities early in the development lifecycle.",
      date: "April 12, 2023",
      author: "Jane Smith",
      readTime: "8 min read",
      image: "photo-1518770660439-4636190af475",
      category: "Tools Comparison"
    },
    {
      id: 2,
      title: "Understanding Common Injection Attacks",
      excerpt: "Learn how static analyzers can help you prevent SQL, XSS, and command injection vulnerabilities in your applications.",
      date: "March 28, 2023",
      author: "Michael Chen",
      readTime: "12 min read",
      image: "photo-1487058792275-0ad4aaf24ca7",
      category: "Vulnerabilities"
    },
    {
      id: 3,
      title: "Securing CI/CD Pipelines with Static Analysis",
      excerpt: "Integrate security scanning into your continuous integration workflow to catch vulnerabilities before they reach production.",
      date: "February 15, 2023",
      author: "Sarah Johnson",
      readTime: "10 min read",
      image: "photo-1498050108023-c5249f4df085",
      category: "DevSecOps"
    },
    {
      id: 4,
      title: "Best Practices for Code Review with SAST Tools",
      excerpt: "How to effectively combine manual code reviews with automated static analysis to maximize security and code quality.",
      date: "January 20, 2023",
      author: "David Wilson",
      readTime: "7 min read",
      image: "photo-1461749280684-dccba630e2f6",
      category: "Best Practices"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onSearch={() => {}} />
      
      {/* Header */}
      <div className="bg-security-800 text-white py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Security Blog</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            The latest insights, guides, and best practices for application security 
            and static analysis tools.
          </p>
        </div>
      </div>
      
      {/* Blog Content */}
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Featured Post */}
          <Card className="md:col-span-2 lg:col-span-3 border-security-200 shadow-md overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="bg-security-50 p-6 flex items-center">
                <img 
                  src={`https://images.unsplash.com/${blogPosts[0].image}?auto=format&fit=crop&w=800&q=80`}
                  alt={blogPosts[0].title}
                  className="w-full h-64 object-cover rounded-md"
                />
              </div>
              <div className="p-6 flex flex-col justify-center">
                <div className="mb-2">
                  <span className="px-3 py-1 bg-security-100 text-security-700 rounded-full text-sm font-medium">
                    {blogPosts[0].category}
                  </span>
                </div>
                <CardTitle className="text-2xl mb-4">{blogPosts[0].title}</CardTitle>
                <CardDescription className="text-base mb-6">
                  {blogPosts[0].excerpt}
                </CardDescription>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <User size={16} className="mr-1" />
                  <span className="mr-4">{blogPosts[0].author}</span>
                  <Calendar size={16} className="mr-1" />
                  <span className="mr-4">{blogPosts[0].date}</span>
                  <Clock size={16} className="mr-1" />
                  <span>{blogPosts[0].readTime}</span>
                </div>
                <Button className="bg-security-600 hover:bg-security-700 mt-2 w-fit">
                  Read Article <ArrowRight size={16} className="ml-1" />
                </Button>
              </div>
            </div>
          </Card>
          
          {/* Other Posts */}
          {blogPosts.slice(1).map((post) => (
            <Card key={post.id} className="overflow-hidden flex flex-col h-full">
              <div className="relative h-48">
                <img 
                  src={`https://images.unsplash.com/${post.image}?auto=format&fit=crop&w=500&q=60`}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 text-security-700 rounded-full text-sm font-medium">
                    {post.category}
                  </span>
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">{post.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <User size={14} className="mr-1" />
                  <span className="mr-4">{post.author}</span>
                  <Clock size={14} className="mr-1" />
                  <span>{post.readTime}</span>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" className="border-security-200 hover:bg-security-50 text-security-700">
                  Read Article
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        {/* Newsletter */}
        <div className="mt-16 bg-gray-50 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Stay Updated on Security Best Practices</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join our newsletter to receive the latest security insights and updates on static analysis tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="flex-grow px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-security-500"
            />
            <Button className="bg-security-600 hover:bg-security-700">
              Subscribe
            </Button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Blog;
