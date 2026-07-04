import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Github, FilePlus, MessageSquarePlus } from "lucide-react";

const REPO = "https://github.com/static-security-analysis/static-security-analysis.github.io";
const NEW_TOOL = `${REPO}/new/main/src/data/analyzers`;
const NEW_ISSUE = `${REPO}/issues/new`;

const SAMPLE = `id: my-tool
name: My Tool
description: One-line description of what it detects.
languages:
  - Python
  - JavaScript
license: Open Source          # Open Source | Commercial | Freemium
website: "https://my-tool.dev/"
github: "https://github.com/org/my-tool"
features:
  - Taint Analysis
techniques:
  - Taint Analysis
weaknesses:                    # Seven Pernicious Kingdoms categories
  - category: Input Validation and Representation
    examples: [SQL Injection, XSS]
toolType: oss                  # oss | academic | commercial
ecosystem:
  - Web`;

const Submit = () => (
  <div className="min-h-screen flex flex-col bg-white">
    <Navbar />
    <div className="container py-10 flex-grow max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-900">Contribute a tool</h1>
      <p className="text-gray-600 mt-3 leading-relaxed">
        AppSecHub is a community-maintained, open catalogue of static security
        analysis tools and papers. Adding a tool takes one YAML file — no code
        changes needed; the app loads every file in{" "}
        <code className="text-sm bg-gray-100 px-1.5 py-0.5 rounded">src/data/analyzers/</code>{" "}
        automatically.
      </p>

      <div className="flex flex-wrap gap-3 mt-6">
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <a href={NEW_TOOL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
            <FilePlus size={16} /> Add a tool on GitHub
          </a>
        </Button>
        <Button variant="outline" asChild className="text-gray-700">
          <a href={NEW_ISSUE} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
            <MessageSquarePlus size={16} /> Suggest via issue
          </a>
        </Button>
        <Button variant="outline" asChild className="text-gray-700">
          <a href={REPO} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
            <Github size={16} /> Repository
          </a>
        </Button>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">How it works</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Click <strong>Add a tool on GitHub</strong> (or fork the repo).</li>
          <li>
            Create a YAML file named after the tool id (e.g.{" "}
            <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">my-tool.yaml</code>) using the
            template below.
          </li>
          <li>Open a pull request. Once merged, it appears on the homepage and at <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">/tool/&lt;id&gt;</code>.</li>
        </ol>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Template</h2>
        <pre className="bg-gray-900 text-gray-100 text-sm rounded-lg p-4 overflow-x-auto">
          <code>{SAMPLE}</code>
        </pre>
        <p className="text-sm text-gray-500 mt-3">
          Optional fields include <code className="bg-gray-100 px-1 rounded">soundness</code>,{" "}
          <code className="bg-gray-100 px-1 rounded">maintenance</code>,{" "}
          <code className="bg-gray-100 px-1 rounded">yearIntroduced</code>,{" "}
          <code className="bg-gray-100 px-1 rounded">githubStars</code>,{" "}
          <code className="bg-gray-100 px-1 rounded">academicReferences</code>, and{" "}
          <code className="bg-gray-100 px-1 rounded">institute</code>. See existing files for examples.
        </p>
      </section>
    </div>
    <Footer />
  </div>
);

export default Submit;
