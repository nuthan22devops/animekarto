
Action: file_editor create /app/frontend/src/pages/Login.jsx --file-text "import { useState } from \"react\";
import { Link, useNavigate, useSearchParams } from \"react-router-dom\";
import { useAuth } from \"@/context/AuthContext\";
import { formatApiError } from \"@/lib/api\";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const next = params.get(\"next\") || \"/\";
  const [form, setForm] = useState({ email: \"\", password: \"\" });
  const [err, setErr] = useState(\"\");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(\"\"); setBusy(true);
    try { await login(form.email, form.password); nav(next); }
    catch (e) { setErr(formatApiError(e)); }
    finally { setBusy(false); }
  };

  return (
    <div className=\"max-w-md mx-auto px-4 py-16\" data-testid=\"login-page\">
      <h1 className=\"font-anton text-5xl uppercase mb-2\">Log In</h1>
      <p className=\"font-mono text-xs uppercase text-[#555] mb-6\">Welcome back, otaku.</p>
      <form onSubmit={submit} className=\"border-2 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4\">
        <div>
          <label className=\"font-mono text-[10px] uppercase block mb-1\">Email</label>
          <input data-testid=\"login-email\" type=\"email\" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className=\"w-full border-2 border-black px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF2A2A]\" />
        </div>
        <div>
          <label className=\"font-mono text-[10px] uppercase block mb-1\">Password</label>
          <input data-testid=\"login-password\" type=\"password\" required value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className=\"w-full border-2 border-black px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF2A2A]\" />
        </div>
        {err && <p data-testid=\"login-error\" className=\"font-mono text-xs text-[#FF2A2A]\">{err}</p>}
        <button data-testid=\"login-submit\" disabled={busy}
          className=\"w-full bg-[#FF2A2A] text-white font-mono text-sm uppercase tracking-widest border-2 border-black py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-transform disabled:opacity-50\">
          {busy ? \"Signing in...\" : \"Sign In\"}
        </button>
      </form>
      <p className=\"font-mono text-xs mt-4 text-center\">
        No account? <Link data-testid=\"link-to-register\" to=\"/register\" className=\"underline underline-offset-4\">Create one</Link>
      </p>
    </div>
  );
}
"
Observation: Create successful: /app/frontend/src/pages/Login.jsx