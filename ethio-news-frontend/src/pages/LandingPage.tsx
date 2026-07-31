import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-24 gap-6">
        <h1 className="text-4xl md:text-6xl font-bold">
          Welcome to <span className="text-[#38bdf8]">Ethio</span>News
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">Your daily Ethiopian news — summarized, translated, and delivered in one place.</p>
        <div className="flex gap-4 mt-4">
          <button onClick={() => navigate("/signup")} className="px-6 py-2.5 border border-[#38bdf8] text-[#38bdf8] rounded-full font-semibold hover:bg-[#38bdf8] hover:text-[#0f172a] transition">
            Sign Up
          </button>
          <button onClick={() => navigate("/signin")} className="px-6 py-2.5 bg-[#38bdf8] text-[#0f172a] rounded-full font-semibold hover:bg-sky-400 transition">
            Sign In
          </button>
        </div>
        <button onClick={() => navigate("/feed")} className="text-slate-400 text-sm hover:text-white transition underline underline-offset-4">
          Continue without signing in →
        </button>
      </section>

      {/* Easy to use Section */}
      <section className="bg-[#1e293b] px-4 md:px-6 py-16">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8">
          {/* Text */}
          <div className="w-full md:w-1/2">
            <h2 className="text-3xl font-bold mb-4">
              "Easy to <span className="text-[#38bdf8]">use</span>"
            </h2>
            <ul className="text-slate-400 space-y-3 text-base list-none">
              <li>✅ Daily news from 7+ Ethiopian sources</li>
              <li>✅ AI summaries in English and አማርኛ</li>
              <li>✅ Filter by category — Politics, Sports, Business and more</li>
              <li>✅ Auto-updates every hour</li>
            </ul>
          </div>

          {/* Image */}
          <div className="w-full md:w-1/2 h-48 md:h-64 bg-[#0f172a] rounded-2xl border border-slate-700 flex items-center justify-center">
            <span className="text-slate-600 text-sm">App preview image</span>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="px-4 md:px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-[#38bdf8]">About</h2>
          <p className="text-slate-400 leading-relaxed">
            EthioNews is an AI-powered news aggregator built for Ethiopians at home and abroad. We gather news from trusted Ethiopian sources every hour, summarize them using AI, and present them in a
            clean, easy-to-read format — in both English and Amharic.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-[#1e293b] px-4 md:px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-[#38bdf8]">Contact</h2>
          <p className="text-slate-400 mb-4">Have feedback or want to suggest a news source? Reach out to us.</p>
          <a href="mailto:contact@ethionews.com" className="text-[#38bdf8] hover:underline">
            contact@ethionews.com
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-slate-600 text-sm border-t border-slate-800">© 2026 EthioNews. All rights reserved.</footer>
    </div>
  );
};

export default LandingPage;
