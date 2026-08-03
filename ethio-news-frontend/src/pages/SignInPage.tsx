import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signIn } from "../services/api";

const SignInPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      navigate("/feed");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#1e293b] rounded-2xl border border-slate-700 p-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mb-8">
          <span className="text-[#38bdf8] font-bold text-xl">Ethio</span>
          <span className="text-white font-bold text-xl">News</span>
        </Link>

        <h2 className="text-white text-2xl font-bold mb-2">Sign In</h2>
        <p className="text-slate-400 text-sm mb-6">Welcome back!</p>

        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-slate-400 text-sm mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full bg-[#0f172a] border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#38bdf8] transition"
            />
          </div>

          <div>
            <label className="text-slate-400 text-sm mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-[#0f172a] border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#38bdf8] transition"
            />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-[#38bdf8] text-[#0f172a] py-2.5 rounded-xl font-semibold hover:bg-sky-400 transition disabled:opacity-50">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-slate-400 text-sm text-center mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-[#38bdf8] hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignInPage;
