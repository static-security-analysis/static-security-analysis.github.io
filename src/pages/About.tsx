import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Target,
  Brain,
  BarChart3,
  Layers,
  Users,
  Search,
  FlaskConical,
  Wrench,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { staticAnalyzers } from "@/lib/analyzers-loader";

const toolCount = staticAnalyzers.length;
const languageCount = new Set(
  staticAnalyzers.flatMap((a) => a.languages)
).size;

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <div className="bg-blue-800 text-white py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About AppSecHub</h1>
          <p className="text-lg text-white-300 max-w-2xl mx-auto">
            Helping developers and teams choose the right security tooling for
            their stack—backed by research, not marketing.
          </p>
        </div>
      </div>

      {/* At a glance */}
      <div className="container mx-auto px-4 -mt-6 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-blue-200 shadow-sm">
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-blue-600">{toolCount}</p>
              <p className="text-sm font-medium text-neutral-700 mt-1">
                Tools indexed
              </p>
            </CardContent>
          </Card>
          <Card className="border-blue-200 shadow-sm">
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-blue-600">{languageCount}</p>
              <p className="text-sm font-medium text-neutral-700 mt-1">
                Languages covered
              </p>
            </CardContent>
          </Card>
          <Card className="border-blue-200 shadow-sm">
            <CardContent className="pt-6 text-center">
              <p className="text-sm font-medium text-neutral-700">
                Designed for teams: CI/CD, policy, and auditability in mind.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        {/* Who We Are */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-8 w-8 text-blue-600" aria-hidden />
            <h2 className="text-2xl font-bold text-neutral-900">
              Who We Are
            </h2>
          </div>
          <p className="text-neutral-600 leading-relaxed mb-4">
            We are researchers in software engineering and security. We built
            AppSecHub because too many developers were lost in vendor claims
            instead of getting clear, stack-aware guidance.
          </p>
          <ul className="list-disc list-inside text-neutral-600 space-y-1">
            <li>Stack-aware guidance (language, framework, CI)</li>
            <li>Strengths and limitations—noise, coverage, trade-offs</li>
            <li>Independent, research-driven curation</li>
          </ul>
        </section>

        {/* Our Mission */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Target className="h-8 w-8 text-blue-600" aria-hidden />
            <h2 className="text-2xl font-bold text-neutral-900">
              Our Mission
            </h2>
          </div>
          <p className="text-neutral-600 leading-relaxed mb-4">
            We help you match tools to your stack, threat model, and tolerance
            for noise. One place to compare by language, license, integration,
            and the weaknesses each tool covers.
          </p>
          <ul className="list-disc list-inside text-neutral-600 space-y-1">
            <li>Filter by your stack and pipeline</li>
            <li>Compare features and limitations side by side</li>
            <li>Decide with trade-offs in mind</li>
          </ul>
        </section>

        {/* How to use AppSecHub */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Wrench className="h-8 w-8 text-blue-600" aria-hidden />
            <h2 className="text-2xl font-bold text-neutral-900">
              How to Use AppSecHub
            </h2>
          </div>
          <ol className="list-decimal list-inside text-neutral-600 space-y-2 mb-6">
            <li>Filter by stack (language, framework, CI)</li>
            <li>Compare tools side by side</li>
            <li>Decide with trade-offs in mind</li>
          </ol>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link to="/#analyzers">Browse analyzers</Link>
            </Button>
            <Button asChild variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
              <Link to="/compare">Compare tools</Link>
            </Button>
          </div>
        </section>

        {/* Why Deep Static Analyzers Still Matter */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-blue-600" aria-hidden />
            <h2 className="text-2xl font-bold text-neutral-900">
              Why Deep Static Analyzers Still Matter
            </h2>
          </div>
          <p className="text-neutral-600 leading-relaxed mb-3 font-medium">
            AI does rule-based and taint-style checks—but it does not replace
            dedicated analyzers. Deep analyzers remain essential for industry.
          </p>
          <ul className="list-disc list-inside text-neutral-600 space-y-1 mb-6">
            <li>Whole-program and inter-procedural analysis (AI works on snippets)</li>
            <li>Tuning and deterministic evidence (reproducible runs, audit trails)</li>
            <li>Compliance and auditability (CWE mapping, regulated sectors)</li>
          </ul>
          <Accordion type="single" collapsible className="border rounded-lg border-blue-200 px-4">
            <AccordionItem value="whole-program">
              <AccordionTrigger className="text-left font-medium">
                <span className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600 shrink-0" />
                  Whole-program analysis vs. local patterns
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-neutral-600 leading-relaxed">
                AI tools typically work on individual files or snippets. Deep
                static analyzers build full program models: call graphs,
                data-flow and control-flow graphs, and inter-procedural taint
                tracking. They follow tainted data across functions and modules,
                reason about aliases, and apply context-sensitive rules—catching
                subtle data leaks and injection paths that pattern matching
                alone misses.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="tuning">
              <AccordionTrigger className="text-left font-medium">
                <span className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-blue-600 shrink-0" />
                  Tuning and auditability
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-neutral-600 leading-relaxed">
                Dedicated analyzers let you tune precision and recall: custom
                rules, suppression profiles, incremental scanning. You get
                deterministic, reproducible runs—critical when you need to prove
                what was scanned and when. Regulated sectors (finance, healthcare,
                automotive) require evidence that specific CWEs or standards were
                checked, with clear audit trails. AI suggestions in the editor are
                not a substitute for that assurance.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="together">
              <AccordionTrigger className="text-left font-medium">
                <span className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600 shrink-0" />
                  AI and analyzers: better together
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-neutral-600 leading-relaxed">
                The right picture is complementarity, not replacement. AI can
                catch low-hanging fruit quickly; deep analyzers provide the
                rigorous, repeatable, auditable baseline for compliance and risk
                management. Using both gives you the best of both worlds.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Our Vision */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="h-8 w-8 text-blue-600" aria-hidden />
            <h2 className="text-2xl font-bold text-neutral-900">
              Our Vision
            </h2>
          </div>
          <p className="text-neutral-600 leading-relaxed mb-6">
            We are not stopping at static analysis. We want more tool categories
            and evidence-based comparison using real data.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-blue-200 shadow-sm">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-neutral-900 flex items-center gap-2 mb-2">
                  <Layers className="h-5 w-5 text-blue-600 shrink-0" />
                  More tool categories
                </h3>
                <p className="text-neutral-600 text-sm mb-2">
                  We plan to include DAST, SCA, container and IaC scanners, and more.
                </p>
                <ul className="list-disc list-inside text-neutral-600 text-sm space-y-1">
                  <li>Same idea: stack-aware comparison</li>
                  <li>Choose what fits your environment</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-blue-200 shadow-sm">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-neutral-900 flex items-center gap-2 mb-2">
                  <FlaskConical className="h-5 w-5 text-blue-600 shrink-0" />
                  Evidence-based comparison
                </h3>
                <p className="text-neutral-600 text-sm mb-2">
                  We are working on benchmarking tools against curated vulnerability datasets.
                </p>
                <ul className="list-disc list-inside text-neutral-600 text-sm space-y-1">
                  <li>Objective comparisons on real codebases and issues</li>
                  <li>Work in progress—we will share results as they mature</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default About;
