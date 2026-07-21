
Action: file_editor create /app/frontend/src/pages/Orders.jsx --file-text "import { useEffect, useState } from \"react\";
import { Link, useParams } from \"react-router-dom\";
import { ordersApi, formatApiError } from \"@/lib/api\";
import { useAuth } from \"@/context/AuthContext\";

function StatusBadge({ status }) {
  return (
    <span className=\"text-[10px] font-mono uppercase tracking-widest bg-[#FFD700] border-2 border-black px-2 py-0.5\">
      {status}
    </span>
  );
}

export default function Orders() {
  const { id } = useParams();
  const { user, ready } = useAuth();
  const [orders, setOrders] = useState([]);
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState(\"\");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    if (!user) { setLoading(false); return; }
    if (id) {
      ordersApi.get(id).then((r) => setOrder(r.data)).catch((e) => setErr(formatApiError(e))).finally(() => setLoading(false));
    } else {
      ordersApi.list().then((r) => setOrders(r.data)).catch((e) => setErr(formatApiError(e))).finally(() => setLoading(false));
    }
  }, [id, user, ready]);

  if (!ready || loading) return <div className=\"max-w-3xl mx-auto p-10 font-mono\">Loading...</div>;
  if (!user) {
    return (
      <div className=\"max-w-2xl mx-auto text-center py-20\" data-testid=\"orders-guest\">
        <h1 className=\"font-anton text-4xl uppercase\">Log in to view orders</h1>
        <Link to=\"/login?next=/orders\" className=\"mt-6 inline-block bg-[#FF2A2A] text-white font-mono text-sm uppercase border-2 border-black px-6 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]\">Login</Link>
      </div>
    );
  }
  if (err) return <div className=\"max-w-3xl mx-auto p-10 font-mono text-[#FF2A2A]\">{err}</div>;

  if (id && order) {
    return (
      <div className=\"max-w-4xl mx-auto px-4 md:px-8 py-10\" data-testid=\"order-detail\">
        <Link to=\"/orders\" className=\"text-xs font-mono uppercase underline underline-offset-4\">← All orders</Link>
        <div className=\"mt-4 flex flex-wrap items-center justify-between gap-3\">
          <h1 className=\"font-anton text-4xl md:text-5xl uppercase\">Order #{order.id.slice(0, 8)}</h1>
          <StatusBadge status={order.status} />
        </div>
        <p className=\"font-mono text-xs text-[#555] mt-1\">Placed {new Date(order.created_at).toLocaleString()}</p>

        <div className=\"grid grid-cols-1 md:grid-cols-[1fr_300px] gap-8 mt-8\">
          <ul className=\"space-y-3\" data-testid=\"order-items\">
            {order.items.map((it) => (
              <li key={it.product_id} className=\"flex gap-4 border-2 border-black bg-white p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]\">
                <img src={it.image} alt={it.name} className=\"w-20 h-20 object-cover border-2 border-black\" />
                <div className=\"flex-1\">
                  <h3 className=\"font-anton uppercase text-lg\">{it.name}</h3>
                  <p className=\"font-mono text-xs\">Qty: {it.quantity}</p>
                </div>
                <div className=\"font-anton text-lg\">${(it.price * it.quantity).toFixed(2)}</div>
              </li>
            ))}
          </ul>
          <aside className=\"border-2 border-black bg-white p-5 h-fit shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]\">
            <h3 className=\"font-anton text-xl uppercase mb-3\">Shipping</h3>
            <div className=\"font-mono text-xs space-y-1 text-[#333]\">
              <p>{order.shipping_address.full_name}</p>
              <p>{order.shipping_address.address_line}</p>
              <p>{order.shipping_address.city}, {order.shipping_address.postal_code}</p>
              <p>{order.shipping_address.country}</p>
            </div>
            <div className=\"border-t-2 border-black mt-4 pt-3 space-y-1 font-mono text-sm\">
              <div className=\"flex justify-between\"><span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
              <div className=\"flex justify-between\"><span>Shipping</span><span>${order.shipping.toFixed(2)}</span></div>
              <div className=\"flex justify-between font-anton text-lg uppercase pt-2 border-t border-black\"><span>Total</span><span>${order.total.toFixed(2)}</span></div>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className=\"max-w-5xl mx-auto px-4 md:px-8 py-10\" data-testid=\"orders-page\">
      <h1 className=\"font-anton text-5xl md:text-6xl uppercase mb-8\">Your Orders</h1>
      {orders.length === 0 ? (
        <div className=\"border-2 border-black p-10 text-center bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]\" data-testid=\"orders-empty\">
          <p className=\"font-anton text-2xl uppercase\">No orders yet</p>
          <Link to=\"/shop\" className=\"mt-4 inline-block font-mono text-xs uppercase underline underline-offset-4\">Start shopping →</Link>
        </div>
      ) : (
        <ul className=\"space-y-4\" data-testid=\"orders-list\">
          {orders.map((o) => (
            <li key={o.id} data-testid={`order-row-${o.id}`}>
              <Link to={`/orders/${o.id}`} className=\"block border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-transform\">
                <div className=\"flex flex-wrap justify-between items-center gap-3\">
                  <div>
                    <div className=\"flex items-center gap-3\">
                      <h3 className=\"font-anton text-xl uppercase\">#{o.id.slice(0, 8)}</h3>
                      <StatusBadge status={o.status} />
                    </div>
                    <p className=\"font-mono text-xs text-[#555] mt-1\">
                      {new Date(o.created_at).toLocaleDateString()} — {o.items.length} item(s)
                    </p>
                  </div>
                  <span className=\"font-anton text-2xl\">${o.total.toFixed(2)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
"
Observation: Create successful: /app/frontend/src/pages/Orders.jsx