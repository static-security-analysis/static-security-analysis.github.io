import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { papersByYear, toolsByYearParadigm, latestYear } from "@/lib/trends-data";
import { paperTypeLabel } from "@/lib/constants";

const PAPER_COLORS: Record<string, string> = {
  tool: "#38bdf8",
  method: "#8b5cf6",
  empirical: "#10b981",
  survey: "#f59e0b",
  motivation: "#94a3b8",
};

const Trends = () => {
  const papersData = papersByYear();
  const toolsData = toolsByYearParadigm();
  const last = latestYear();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="container py-8 flex-grow">
        <h1 className="text-3xl font-bold text-gray-900">Trends</h1>
        <p className="text-gray-600 mt-2 max-w-2xl">
          How the field has evolved over time, from the {papersData.length}-year
          catalogue of papers and tools. {last} is a partial year.
        </p>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Papers per year, by type</h2>
          <p className="text-sm text-gray-500 mb-4">
            Growth and shifting composition of the literature.
          </p>
          <div className="w-full h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={papersData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} minTickGap={16} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                {(["tool", "method", "empirical", "survey", "motivation"] as const).map((t) => (
                  <Bar key={t} dataKey={t} stackId="p" fill={PAPER_COLORS[t]} name={paperTypeLabel[t]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            Tools introduced per year: classic vs learning-based
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            The rise of learning-based analysis (deep learning, GNNs, LLMs) against
            classic static analysis.
          </p>
          <div className="w-full h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={toolsData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} minTickGap={16} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="classic" stackId="t" fill="#1d4ed8" name="Classic" />
                <Bar dataKey="learning" stackId="t" fill="#db2777" name="Learning-based" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Trends;
