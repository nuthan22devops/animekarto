
Action: file_editor create /app/frontend/src/pages/Cart.jsx --file-text "import { Link, useNavigate } from \"react-router-dom\";
import { useCart } from \"@/context/CartContext\";
import { useAuth } from \"@/context/AuthContext\";
import { Trash2, Minus, Plus, ShoppingBag } from \"lucide-react\";

export default function Cart() {
  const { cart, updateItem, removeItem } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();

  if (!user) {
    return (
      <div className=\"max-w-2xl mx-auto text-center py-20 px-4\" data-testid=\"cart-empty-guest\">
        <h1 className=\"font-anton text-5xl uppercase\">Login to view your cart</h1>
        <Link data-testid=\"cart-login-cta\" to=\"/login?next=/cart\" className=\"mt-6 inline-block bg-[#FF2A2A] text-white font-mono text-sm uppercase tracking-widest border-2 border-black px-6 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-transform\">Login</Link>
      </div>
    );
  }

  const empty = cart.items.length === 0;

  return (
    <div className=\"max-w-6xl mx-auto px-4 md:px-8 py-10\" data-testid=\"cart-page\">
      <h1 className=\"font-anton text-5xl md:text-6xl uppercase mb-8\">Your Cart</h1>

      {empty ? (
        <div className=\"border-2 border-black p-10 text-center bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]\" data-testid=\"cart-empty\">
          <ShoppingBag size={40} className=\"mx-auto\" />
          <p className=\"font-anton text-2xl uppercase mt-4\">Your cart is empty</p>
          <Link to=\"/shop\" data-testid=\"cart-shop-cta\" className=\"mt-6 inline-block bg-black text-white font-mono text-xs uppercase tracking-widest border-2 border-black px-6 py-3\">Start shopping</Link>
        </div>
      ) : (
        <div className=\"grid grid-cols-1 md:grid-cols-[1fr_320px] gap-8\">
          <ul className=\"space-y-4\" data-testid=\"cart-items\">
            {cart.items.map((it) => (
              <li key={it.product_id} data-testid={`cart-item-${it.product_id}`} className=\"border-2 border-black bg-white flex gap-4 p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]\">
                <img src={it.image} alt={it.name} className=\"w-24 h-24 object-cover border-2 border-black\" />
                <div className=\"flex-1\">
                  <h3 className=\"font-anton uppercase text-lg leading-tight\">{it.name}</h3>
                  <p className=\"font-anton text-xl mt-1\">${it.price.toFixed(2)}</p>
                  <div className=\"mt-2 flex items-center gap-4\">
                    <div className=\"flex items-center border-2 border-black\">
                      <button data-testid={`cart-decrement-${it.product_id}`} onClick={() => updateItem(it.product_id, Math.max(1, it.quantity - 1))} className=\"px-2 py-1 hover:bg-black hover:text-white transition-colors\"><Minus size={12} /></button>
                      <span className=\"px-3 font-mono text-sm\" data-testid={`cart-qty-${it.product_id}`}>{it.quantity}</span>
                      <button data-testid={`cart-increment-${it.product_id}`} onClick={() => updateItem(it.product_id, it.quantity + 1)} className=\"px-2 py-1 hover:bg-black hover:text-white transition-colors\"><Plus size={12} /></button>
                    </div>
                    <button data-testid={`cart-remove-${it.product_id}`} onClick={() => removeItem(it.product_id)} className=\"flex items-center gap-1 text-xs font-mono uppercase text-[#FF2A2A] hover:underline\">
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                </div>
                <div className=\"font-anton text-xl self-start\">${(it.price * it.quantity).toFixed(2)}</div>
              </li>
            ))}
          </ul>

          <aside className=\"border-2 border-black bg-white p-6 h-fit shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]\">
            <h2 className=\"font-anton text-2xl uppercase mb-4\">Summary</h2>
            <div className=\"flex justify-between font-mono text-sm mb-2\">
              <span>Items ({cart.total_items})</span>
              <span data-testid=\"cart-subtotal\">${cart.subtotal.toFixed(2)}</span>
            </div>
            <div className=\"flex justify-between font-mono text-sm mb-2\">
              <span>Shipping</span>
              <span>$5.99</span>
            </div>
            <div className=\"border-t-2 border-black mt-4 pt-4 flex justify-between\">
              <span className=\"font-anton text-lg uppercase\">Total</span>
              <span data-testid=\"cart-total\" className=\"font-anton text-lg\">${(cart.subtotal + 5.99).toFixed(2)}</span>
            </div>
            <button
              data-testid=\"cart-checkout-btn\"
              onClick={() => nav(\"/checkout\")}
              className=\"mt-6 w-full bg-[#FF2A2A] text-white font-mono text-sm uppercase tracking-widest border-2 border-black py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-transform\"
            >Checkout</button>
          </aside>
        </div>
      )}
    </div>
  );
}
"
Observation: Create successful: /app/frontend/src/pages/Cart.jsx