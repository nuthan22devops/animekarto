
Action: file_editor create /app/frontend/src/pages/Checkout.jsx --file-text "import { useState } from \"react\";
import { useNavigate } from \"react-router-dom\";
import { useCart } from \"@/context/CartContext\";
import { ordersApi, formatApiError } from \"@/lib/api\";
import { toast } from \"sonner\";

export default function Checkout() {
  const nav = useNavigate();
  const { cart, refresh } = useCart();
  const [form, setForm] = useState({ full_name: \"\", address_line: \"\", city: \"\", postal_code: \"\", country: \"\" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(\"\");

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErr(\"\");
    setBusy(true);
    try {
      const r = await ordersApi.checkout(form);
      await refresh();
      toast.success(\"Order placed!\");
      nav(`/orders/${r.data.id}`);
    } catch (e) {
      setErr(formatApiError(e));
    } finally { setBusy(false); }
  };

  if (cart.items.length === 0) {
    return (
      <div className=\"max-w-2xl mx-auto text-center py-20 px-4\" data-testid=\"checkout-empty\">
        <h1 className=\"font-anton text-4xl uppercase\">Cart is empty</h1>
        <button onClick={() => nav(\"/shop\")} className=\"mt-6 bg-black text-white font-mono text-xs uppercase tracking-widest border-2 border-black px-6 py-3\">Browse shop</button>
      </div>
    );
  }

  return (
    <div className=\"max-w-5xl mx-auto px-4 md:px-8 py-10\" data-testid=\"checkout-page\">
      <h1 className=\"font-anton text-5xl md:text-6xl uppercase mb-8\">Checkout</h1>
      <div className=\"grid grid-cols-1 md:grid-cols-[1fr_320px] gap-8\">
        <form onSubmit={submit} className=\"border-2 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4\" data-testid=\"checkout-form\">
          <h2 className=\"font-anton text-2xl uppercase\">Shipping Address</h2>
          {[
            [\"full_name\", \"Full name\"],
            [\"address_line\", \"Address\"],
            [\"city\", \"City\"],
            [\"postal_code\", \"Postal code\"],
            [\"country\", \"Country\"],
          ].map(([k, label]) => (
            <div key={k}>
              <label className=\"font-mono text-[10px] uppercase tracking-widest block mb-1\">{label}</label>
              <input
                data-testid={`checkout-${k}`}
                value={form[k]}
                onChange={update(k)}
                required
                className=\"w-full border-2 border-black px-3 py-2 font-body focus:outline-none focus:ring-2 focus:ring-[#FF2A2A]\"
              />
            </div>
          ))}
          {err && <p data-testid=\"checkout-error\" className=\"font-mono text-xs text-[#FF2A2A]\">{err}</p>}
          <button
            data-testid=\"checkout-submit\"
            type=\"submit\"
            disabled={busy}
            className=\"w-full bg-[#FF2A2A] text-white font-mono text-sm uppercase tracking-widest border-2 border-black py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-transform disabled:opacity-50\"
          >{busy ? \"Placing order...\" : \"Place Order\"}</button>
          <p className=\"font-mono text-[10px] uppercase text-[#555] text-center\">Payment simulated — no charge will be made.</p>
        </form>

        <aside className=\"border-2 border-black bg-white p-6 h-fit shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]\">
          <h2 className=\"font-anton text-2xl uppercase mb-4\">Order</h2>
          <ul className=\"space-y-2 max-h-64 overflow-y-auto pr-1\">
            {cart.items.map((it) => (
              <li key={it.product_id} className=\"flex justify-between text-sm font-mono\">
                <span className=\"pr-2 truncate\">{it.name} ×{it.quantity}</span>
                <span>${(it.price * it.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className=\"border-t-2 border-black mt-4 pt-4 space-y-2 text-sm font-mono\">
            <div className=\"flex justify-between\"><span>Subtotal</span><span>${cart.subtotal.toFixed(2)}</span></div>
            <div className=\"flex justify-between\"><span>Shipping</span><span>$5.99</span></div>
            <div className=\"flex justify-between font-anton text-lg uppercase pt-2 border-t border-black\"><span>Total</span><span>${(cart.subtotal + 5.99).toFixed(2)}</span></div>
          </div>
        </aside>
      </div>
    </div>
  );
}
"
Observation: Create successful: /app/frontend/src/pages/Checkout.jsx