
Action: file_editor create /app/frontend/src/pages/Register.jsx --file-text "import { useState } from \"react\";
import { Link, useNavigate } from \"react-router-dom\";
import { useAuth } from \"@/context/AuthContext\";
import { formatApiError } from \"@/lib/api\";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: \"\", email: \"\", password: \"\" });
  const [err, setErr] = useState(\"\");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(\"\"); setBusy(true);
    try { await register(form.name, form.email, form.password); nav(\"/\"); }
    catch (e) { setErr(formatApiError(e)); }
    finally { setBusy(false); }
  };

  return (
    <div className=\"max-w-md mx-auto px-4 py-16\" data-testid=\"register-page\">
      <h1 className=\"font-anton text-5xl uppercase mb-2\">Join Us</h1>
      <p className=\"font-mono text-xs uppercase text-[#555] mb-6\">Create your OtakuKart account.</p>
      <form onSubmit={submit} className=\"border-2 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4\">
        <div>
          <label className=\"font-mono text-[10px] uppercase block mb-1\">Name</label>
          <input data-testid=\"register-name\" required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className=\"w-full border-2 border-black px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF2A2A]\" />
        </div>
        <div>
          <label className=\"font-mono text-[10px] uppercase block mb-1\">Email</label>
          <input data-testid=\"register-email\" type=\"email\" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className=\"w-full border-2 border-black px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF2A2A]\" />
        </div>
        <div>
          <label className=\"font-mono text-[10px] uppercase block mb-1\">Password (min 6)</label>
          <input data-testid=\"register-password\" type=\"password\" required minLength={6} value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className=\"w-full border-2 border-black px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF2A2A]\" />
        </div>
        {err && <p data-testid=\"register-error\" className=\"font-mono text-xs text-[#FF2A2A]\">{err}</p>}
        <button data-testid=\"register-submit\" disabled={busy}
          className=\"w-full bg-[#FF2A2A] text-white font-mono text-sm uppercase tracking-widest border-2 border-black py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-transform disabled:opacity-50\">
          {busy ? \"Creating...\" : \"Create Account\"}
        </button>
      </form>
      <p className=\"font-mono text-xs mt-4 text-center\">
        Already have one? <Link data-testid=\"link-to-login\" to=\"/login\" className=\"underline underline-offset-4\">Log in</Link>
      </p>
    </div>
  );
}
"
Observation: Create successful: /app/frontend/src/pages/Register.jsx