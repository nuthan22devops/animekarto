
Action: file_editor create /app/frontend/src/components/Navbar.jsx --file-text "import { Link, useNavigate } from \"react-router-dom\";
import { ShoppingBag, Package, LogOut, User, Menu } from \"lucide-react\";
import { useAuth } from \"@/context/AuthContext\";
import { useCart } from \"@/context/CartContext\";
import { useState } from \"react\";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className=\"sticky top-0 z-40 bg-white border-b-4 border-black\">
      <div className=\"max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between\">
        <Link to=\"/\" data-testid=\"nav-logo\" className=\"flex items-center gap-2\">
          <span className=\"font-anton text-2xl md:text-3xl tracking-tight leading-none\">OTAKU<span className=\"text-[#FF2A2A]\">/</span>KART</span>
          <span className=\"hidden md:inline text-[10px] font-mono bg-[#FFD700] border-2 border-black px-1.5 py-0.5\">アニメ</span>
        </Link>

        <nav className=\"hidden md:flex items-center gap-8 font-mono text-xs uppercase tracking-widest\">
          <Link data-testid=\"nav-shop\" to=\"/shop\" className=\"hover:text-[#FF2A2A] transition-colors\">Shop</Link>
          <Link data-testid=\"nav-shop-figures\" to=\"/shop?category=Figures\" className=\"hover:text-[#FF2A2A] transition-colors\">Figures</Link>
          <Link data-testid=\"nav-shop-apparel\" to=\"/shop?category=Apparel\" className=\"hover:text-[#FF2A2A] transition-colors\">Apparel</Link>
          <Link data-testid=\"nav-shop-manga\" to=\"/shop?category=Manga\" className=\"hover:text-[#FF2A2A] transition-colors\">Manga</Link>
          <Link data-testid=\"nav-shop-posters\" to=\"/shop?category=Posters\" className=\"hover:text-[#FF2A2A] transition-colors\">Posters</Link>
        </nav>

        <div className=\"flex items-center gap-2 md:gap-3\">
          {user ? (
            <>
              <Link data-testid=\"nav-orders\" to=\"/orders\" className=\"hidden md:flex items-center gap-1.5 text-sm font-mono uppercase hover:text-[#FF2A2A] transition-colors\">
                <Package size={16} /> Orders
              </Link>
              <span data-testid=\"nav-user-name\" className=\"hidden md:flex items-center gap-1.5 text-sm font-mono\">
                <User size={14} /> {user.name}
              </span>
              <button
                data-testid=\"nav-logout\"
                onClick={async () => { await logout(); nav(\"/\"); }}
                className=\"hidden md:flex items-center gap-1 text-xs font-mono uppercase border-2 border-black px-3 py-1.5 hover:bg-black hover:text-white transition-colors\"
              >
                <LogOut size={14} /> Out
              </button>
            </>
          ) : (
            <Link
              data-testid=\"nav-login\"
              to=\"/login\"
              className=\"hidden md:inline-block text-xs font-mono uppercase border-2 border-black px-3 py-1.5 hover:bg-black hover:text-white transition-colors\"
            >
              Login
            </Link>
          )}

          <Link
            data-testid=\"nav-cart\"
            to=\"/cart\"
            className=\"relative flex items-center gap-1 border-2 border-black bg-[#FFD700] px-3 py-1.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-transform\"
          >
            <ShoppingBag size={16} />
            <span className=\"font-mono text-xs font-bold\" data-testid=\"nav-cart-count\">{cart.total_items}</span>
          </Link>

          <button
            className=\"md:hidden border-2 border-black p-1.5\"
            onClick={() => setOpen(!open)}
            data-testid=\"nav-mobile-toggle\"
            aria-label=\"Menu\"
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      {open && (
        <div className=\"md:hidden border-t-2 border-black bg-white px-4 py-3 flex flex-col gap-3 font-mono text-xs uppercase\">
          <Link onClick={() => setOpen(false)} to=\"/shop\">Shop</Link>
          <Link onClick={() => setOpen(false)} to=\"/shop?category=Figures\">Figures</Link>
          <Link onClick={() => setOpen(false)} to=\"/shop?category=Apparel\">Apparel</Link>
          <Link onClick={() => setOpen(false)} to=\"/shop?category=Manga\">Manga</Link>
          <Link onClick={() => setOpen(false)} to=\"/shop?category=Posters\">Posters</Link>
          {user ? (
            <>
              <Link onClick={() => setOpen(false)} to=\"/orders\">Orders</Link>
              <button data-testid=\"nav-mobile-logout\" onClick={async () => { await logout(); setOpen(false); nav(\"/\"); }} className=\"text-left\">Logout</button>
            </>
          ) : (
            <Link onClick={() => setOpen(false)} to=\"/login\">Login</Link>
          )}
        </div>
      )}
    </header>
  );
}
"
Observation: Create successful: /app/frontend/src/components/Navbar.jsx