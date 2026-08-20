import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signUp } from "../services/api";

const SignUpPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await signUp(username, email, password);
      navigate("/feed");
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
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

        <h2 className="text-white text-2xl font-bold mb-2">Create Account</h2>
        <p className="text-slate-400 text-sm mb-6">Join EthioNews today</p>

        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-slate-400 text-sm mb-1 block">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="johndoe"
              className="w-full bg-[#0f172a] border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#38bdf8] transition"
            />
          </div>
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

          <div>
            <label className="text-slate-400 text-sm mb-1 block">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-[#0f172a] border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#38bdf8] transition"
            />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-[#38bdf8] text-[#0f172a] py-2.5 rounded-xl font-semibold hover:bg-sky-400 transition disabled:opacity-50">
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-slate-400 text-sm text-center mt-6">
          Already have an account?{" "}
          <Link to="/signin" className="text-[#38bdf8] hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
