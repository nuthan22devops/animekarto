
Action: file_editor create /app/frontend/src/pages/Home.jsx --file-text "import { Link } from \"react-router-dom\";
import { useEffect, useState } from \"react\";
import Marquee from \"react-fast-marquee\";
import { productsApi } from \"@/lib/api\";
import ProductCard from \"@/components/ProductCard\";
import { ArrowRight, Zap, Truck, ShieldCheck } from \"lucide-react\";

const CATEGORY_IMG = {
  Figures: \"https://images.pexels.com/photos/34956928/pexels-photo-34956928.jpeg\",
  Apparel: \"https://images.pexels.com/photos/36025541/pexels-photo-36025541.jpeg\",
  Manga: \"https://images.pexels.com/photos/18848524/pexels-photo-18848524.jpeg\",
  Posters: \"https://images.unsplash.com/photo-1755756383664-af3cf523242b\",
  Accessories: \"https://images.pexels.com/photos/34956928/pexels-photo-34956928.jpeg\",
};

export default function Home() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    productsApi.list().then((r) => setFeatured(r.data.slice(0, 8)));
  }, []);

  return (
    <div data-testid=\"home-page\">
      {/* HERO */}
      <section className=\"border-b-4 border-black bg-white relative overflow-hidden\">
        <div className=\"max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 px-4 md:px-8 py-10 md:py-16\">
          <div className=\"md:col-span-7 flex flex-col justify-center\">
            <span className=\"font-mono text-xs uppercase tracking-[0.3em] bg-black text-[#FFD700] w-fit px-2 py-1 mb-6\">
              ✦ 限定 / Est. 2026 / Otaku Kart ✦
            </span>
            <h1 className=\"font-anton uppercase text-6xl md:text-8xl leading-[0.9] tracking-tight\">
              Gear up.<br />
              Level up.<br />
              <span className=\"text-[#FF2A2A]\">Stay weird.</span>
            </h1>
            <p className=\"mt-6 max-w-lg font-body text-lg text-[#333]\">
              Figures, apparel, manga & posters straight from your favorite arcs.
              Shipped worldwide, packed with attitude.
            </p>
            <div className=\"mt-8 flex flex-wrap gap-4\">
              <Link
                data-testid=\"hero-cta-shop\"
                to=\"/shop\"
                className=\"bg-[#FF2A2A] text-white font-mono text-sm uppercase tracking-widest border-2 border-black px-6 py-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-transform inline-flex items-center gap-2\"
              >
                Shop All <ArrowRight size={16} />
              </Link>
              <Link
                data-testid=\"hero-cta-figures\"
                to=\"/shop?category=Figures\"
                className=\"bg-white text-black font-mono text-sm uppercase tracking-widest border-2 border-black px-6 py-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-transform\"
              >
                Browse Figures
              </Link>
            </div>
          </div>
          <div className=\"md:col-span-5 relative\">
            <div className=\"halftone-bg border-2 border-black aspect-square md:aspect-auto md:h-full relative\">
              <img
                src=\"https://images.pexels.com/photos/1510610/pexels-photo-1510610.jpeg\"
                alt=\"Neon Tokyo streets\"
                className=\"absolute inset-0 w-full h-full object-cover mix-blend-multiply\"
              />
              <div className=\"absolute bottom-4 right-4 bg-[#FFD700] border-2 border-black px-3 py-2 font-mono text-xs uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]\">
                NEW / DROP 03
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className=\"bg-black text-[#FFD700] border-b-4 border-black py-3\">
        <Marquee gradient={false} speed={40} pauseOnHover>
          <span className=\"font-anton text-2xl uppercase mx-8 tracking-wider\">✦ FREE SHIPPING OVER $75</span>
          <span className=\"font-anton text-2xl uppercase mx-8 tracking-wider text-white\">◆ NEW ARRIVALS WEEKLY</span>
          <span className=\"font-anton text-2xl uppercase mx-8 tracking-wider\">✦ LIMITED EDITIONS DAILY</span>
          <span className=\"font-anton text-2xl uppercase mx-8 tracking-wider text-white\">◆ 全国配送 / SHIPPED WORLDWIDE</span>
          <span className=\"font-anton text-2xl uppercase mx-8 tracking-wider\">✦ 100% OFFICIAL MERCH</span>
        </Marquee>
      </div>

      {/* CATEGORIES */}
      <section className=\"max-w-7xl mx-auto px-4 md:px-8 py-14\">
        <div className=\"flex items-end justify-between mb-8\">
          <h2 className=\"font-anton text-4xl md:text-5xl uppercase\">Shop by Category</h2>
          <Link to=\"/shop\" className=\"hidden md:inline text-sm font-mono uppercase underline underline-offset-4\">See all →</Link>
        </div>
        <div className=\"grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6\">
          {[\"Figures\", \"Apparel\", \"Manga\", \"Posters\"].map((cat) => (
            <Link
              key={cat}
              data-testid={`category-tile-${cat.toLowerCase()}`}
              to={`/shop?category=${cat}`}
              className=\"group relative aspect-[3/4] border-2 border-black overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-transform\"
            >
              <img src={CATEGORY_IMG[cat]} alt={cat} className=\"absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300\" />
              <div className=\"absolute inset-0 bg-black/30\" />
              <div className=\"absolute bottom-0 left-0 right-0 bg-white border-t-2 border-black p-3 flex items-center justify-between\">
                <span className=\"font-anton text-xl uppercase\">{cat}</span>
                <ArrowRight size={16} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className=\"max-w-7xl mx-auto px-4 md:px-8 pb-14\">
        <div className=\"flex items-end justify-between mb-8\">
          <div>
            <span className=\"font-mono text-xs uppercase tracking-widest text-[#FF2A2A]\">◆ Trending Now</span>
            <h2 className=\"font-anton text-4xl md:text-5xl uppercase mt-1\">Featured Drops</h2>
          </div>
          <Link to=\"/shop\" className=\"hidden md:inline text-sm font-mono uppercase underline underline-offset-4\">See all →</Link>
        </div>
        <div className=\"grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6\" data-testid=\"featured-grid\">
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* PROMISES */}
      <section className=\"border-t-4 border-black bg-[#F4F4F0]\">
        <div className=\"max-w-7xl mx-auto px-4 md:px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-6\">
          {[
            { icon: Zap, title: \"Fast Dispatch\", desc: \"Orders packed within 24 hrs.\" },
            { icon: Truck, title: \"Worldwide Shipping\", desc: \"Tracked delivery to 60+ countries.\" },
            { icon: ShieldCheck, title: \"100% Authentic\", desc: \"Only officially licensed merch.\" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className=\"bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]\">
              <Icon size={28} strokeWidth={2.5} />
              <h3 className=\"font-anton text-2xl uppercase mt-3\">{title}</h3>
              <p className=\"font-body text-sm text-[#555] mt-1\">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className=\"bg-black text-white py-8 border-t-4 border-black\">
        <div className=\"max-w-7xl mx-auto px-4 md:px-8 flex flex-wrap items-center justify-between gap-4\">
          <span className=\"font-anton text-2xl\">OTAKU<span className=\"text-[#FF2A2A]\">/</span>KART</span>
          <span className=\"font-mono text-xs uppercase tracking-widest text-white/60\">© 2026 — Built for otaku, by otaku.</span>
        </div>
      </footer>
    </div>
  );
}
"
Observation: Create successful: /app/frontend/src/pages/Home.jsx