
Action: file_editor create /app/frontend/src/pages/ProductDetail.jsx --file-text "import { useEffect, useState } from \"react\";
import { useParams, useNavigate, Link } from \"react-router-dom\";
import { productsApi, formatApiError } from \"@/lib/api\";
import { useCart } from \"@/context/CartContext\";
import { useAuth } from \"@/context/AuthContext\";
import { toast } from \"sonner\";
import { Minus, Plus, ShoppingBag } from \"lucide-react\";

export default function ProductDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(\"\");

  useEffect(() => {
    productsApi.get(id).then((r) => setProduct(r.data)).catch((e) => setErr(formatApiError(e)));
  }, [id]);

  if (err) return <div className=\"max-w-3xl mx-auto p-10 font-mono\">{err}</div>;
  if (!product) return <div className=\"max-w-3xl mx-auto p-10 font-mono\">Loading...</div>;

  const handleAdd = async () => {
    if (!user) { nav(\"/login?next=/product/\" + id); return; }
    try {
      setBusy(true);
      await addItem(product.id, qty);
      toast.success(`Added ${qty} × ${product.name} to cart`);
    } catch (e) {
      toast.error(formatApiError(e));
    } finally { setBusy(false); }
  };

  return (
    <div className=\"max-w-6xl mx-auto px-4 md:px-8 py-10\" data-testid=\"product-detail\">
      <Link to=\"/shop\" className=\"text-xs font-mono uppercase underline underline-offset-4 mb-6 inline-block\">← Back to shop</Link>
      <div className=\"grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12\">
        <div className=\"border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-[#F4F4F0]\">
          <img src={product.image} alt={product.name} className=\"w-full aspect-square object-cover\" data-testid=\"product-image\" />
        </div>
        <div>
          <div className=\"flex items-center gap-2 mb-3\">
            <span className=\"text-[10px] font-mono uppercase tracking-widest bg-[#FFD700] border border-black px-1.5 py-0.5\">{product.category}</span>
            <span className=\"text-[10px] font-mono uppercase\">{product.anime}</span>
          </div>
          <h1 data-testid=\"product-name\" className=\"font-anton text-4xl md:text-5xl uppercase leading-tight\">{product.name}</h1>
          <p data-testid=\"product-price\" className=\"font-anton text-4xl mt-4\">${product.price.toFixed(2)}</p>
          <p data-testid=\"product-description\" className=\"font-body text-base text-[#333] mt-4\">{product.description}</p>

          <div className=\"mt-6 flex items-center gap-3\">
            <span className=\"font-mono text-xs uppercase\">Qty</span>
            <div className=\"flex items-center border-2 border-black\">
              <button data-testid=\"qty-decrement\" onClick={() => setQty((q) => Math.max(1, q - 1))} className=\"px-3 py-2 hover:bg-black hover:text-white transition-colors\"><Minus size={14} /></button>
              <span data-testid=\"qty-value\" className=\"px-4 font-mono\">{qty}</span>
              <button data-testid=\"qty-increment\" onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className=\"px-3 py-2 hover:bg-black hover:text-white transition-colors\"><Plus size={14} /></button>
            </div>
            <span className=\"text-[10px] font-mono uppercase text-[#555]\">{product.stock} in stock</span>
          </div>

          <button
            data-testid=\"add-to-cart-button\"
            onClick={handleAdd}
            disabled={busy || product.stock === 0}
            className=\"mt-6 w-full md:w-auto inline-flex items-center gap-2 bg-[#FF2A2A] text-white font-mono text-sm uppercase tracking-widest border-2 border-black px-8 py-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-transform disabled:opacity-50 disabled:cursor-not-allowed\"
          >
            <ShoppingBag size={16} /> {busy ? \"Adding...\" : \"Add to Cart\"}
          </button>
        </div>
      </div>
    </div>
  );
}
"
Observation: Create successful: /app/frontend/src/pages/ProductDetail.jsx