import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CompareProvider } from "@/contexts/CompareContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ToolDetail from "./pages/ToolDetail";
import About from "./pages/About";
import Blog from "./pages/Blog";
import Compare from "./pages/Compare";
import Papers from "./pages/Papers";
import PaperDetail from "./pages/PaperDetail";
import Submit from "./pages/Submit";
// Lazy-loaded: each pulls in a heavy charting/graph lib only when visited.
const Graph = lazy(() => import("./pages/Graph"));
const Trends = lazy(() => import("./pages/Trends"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <CompareProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/tool/:id" element={<ToolDetail />} />
            <Route path="/papers" element={<Papers />} />
            <Route path="/paper/:id" element={<PaperDetail />} />
            <Route
              path="/graph"
              element={
                <Suspense
                  fallback={
                    <div className="min-h-screen flex items-center justify-center text-gray-500">
                      Loading graph…
                    </div>
                  }
                >
                  <Graph />
                </Suspense>
              }
            />
            <Route
              path="/trends"
              element={
                <Suspense
                  fallback={
                    <div className="min-h-screen flex items-center justify-center text-gray-500">
                      Loading charts…
                    </div>
                  }
                >
                  <Trends />
                </Suspense>
              }
            />
            <Route path="/submit" element={<Submit />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </CompareProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
