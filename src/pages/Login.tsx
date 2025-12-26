import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User, AlertCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(username, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center transition-all duration-700 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `
          linear-gradient(to bottom right, rgba(228,216,240,0.75), rgba(241,233,247,0.75), rgba(228,216,240,0.75)),
          url("https://images.pexels.com/photos/7579831/pexels-photo-7579831.jpeg?auto=compress&cs=tinysrgb&w=1600")
        `,
      }}
    >

      {/* 2 COLUMN HERO */}
      <div className="grid grid-cols-1 md:grid-cols-2 w-[90%] max-w-5xl rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.25)] animate-fadeIn">

        {/* LEFT PANEL */}
        <div
          className="hidden md:flex flex-col justify-center items-center p-12 text-center text-white"
          style={{
            background: "linear-gradient(135deg,#5a1f70,#7a3f93,#9c63b8)",
          }}
        >
          <img
            src="https://voaxktqgbljtsattacbn.supabase.co/storage/v1/object/sign/aayush-hospital/Header-Bar-Images/Skin-pages-image/Aayush-logo.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhYXl1c2gtaG9zcGl0YWwvSGVhZGVyLUJhci1JbWFnZXMvU2tpbi1wYWdlcy1pbWFnZS9BYXl1c2gtbG9nby5wbmciLCJpYXQiOjE3NDM2OTk3MzAsImV4cCI6MTkwMTM3OTczMH0.pg25T9SRSiXE0jn46_vxVzTK_vlJGURYwbeRpbjnIF0"
            className="w-24 h-24 mb-5 drop-shadow-2xl"
          />

          <h1 className="text-3xl font-extrabold drop-shadow-md">AAYUSH HMS</h1>
          <p className="text-sm opacity-90 mt-1">Hospital Management System</p>

          <div className="mt-6 px-5 py-3 rounded-xl backdrop-blur-xl bg-white/20 border border-white/30 shadow-lg">
            <p className="text-sm leading-6">
              A secure & smart platform for managing patient care,
              admissions, billing & hospital operations with ease.
            </p>
          </div>
        </div>

        {/* RIGHT LOGIN SIDE */}
        <div
          className="flex items-center justify-center p-10"
          style={{ backgroundColor: "#e9d4e5" }}
        >
          <div className="w-full max-w-sm animate-slideUp">
            <h2 className="text-xl font-bold text-center mb-1 text-gray-900">
              Welcome Back
            </h2>
            <p className="text-sm text-center mb-6 text-gray-700">
              Sign in to access your dashboard
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-200/50 border-l-4 border-red-600 rounded-lg flex gap-2">
                <AlertCircle className="text-red-700" />
                <p className="text-red-800 text-xs">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* USERNAME */}
              <div>
                <label className="text-xs font-medium text-gray-800">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    className="w-full pl-9 py-2 rounded-lg bg-white border focus:ring-2 focus:ring-purple-500 text-sm"
                    placeholder="Enter your username"
                    required
                    value={username}
                    onChange={(e)=>setUsername(e.target.value)}
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="text-xs font-medium text-gray-800">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="password"
                    className="w-full pl-9 py-2 rounded-lg bg-white border focus:ring-2 focus:ring-purple-500 text-sm"
                    required
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              {/* SIGN-IN */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg text-white font-semibold shadow-lg hover:scale-[1.02] transition text-sm"
                style={{ backgroundColor: "#7a3f93" }}
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
