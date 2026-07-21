
Action: file_editor create /app/frontend/src/pages/Shop.jsx --file-text "import { useEffect, useState } from \"react\";
import { useSearchParams } from \"react-router-dom\";
import { productsApi } from \"@/lib/api\";
import ProductCard from \"@/components/ProductCard\";
import { X } from \"lucide-react\";

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const category = params.get(\"category\") || \"\";
  const anime = params.get(\"anime\") || \"\";
  const search = params.get(\"search\") || \"\";

  const [meta, setMeta] = useState({ categories: [], animes: [] });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(search);

  useEffect(() => { productsApi.meta().then((r) => setMeta(r.data)); }, []);

  useEffect(() => {
    setLoading(true);
    const p = {};
    if (category) p.category = category;
    if (anime) p.anime = anime;
    if (search) p.search = search;
    productsApi.list(p)
      .then((r) => setProducts(r.data))
      .finally(() => setLoading(false));
  }, [category, anime, search]);

  const update = (key, val) => {
    const next = new URLSearchParams(params);
    if (val) next.set(key, val); else next.delete(key);
    setParams(next);
  };

  const clearAll = () => setParams(new URLSearchParams());

  const submitSearch = (e) => { e.preventDefault(); update(\"search\", q); };

  const activeFilters = [category, anime, search].filter(Boolean);

  return (
    <div className=\"max-w-7xl mx-auto px-4 md:px-8 py-10\" data-testid=\"shop-page\">
      <div className=\"mb-8\">
        <span className=\"font-mono text-xs uppercase tracking-widest text-[#FF2A2A]\">◆ Catalog</span>
        <h1 className=\"font-anton text-5xl md:text-6xl uppercase mt-1\">
          {category || anime || \"All Merch\"}
        </h1>
      </div>

      <div className=\"grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8\">
        <aside className=\"border-2 border-black p-5 bg-white h-fit shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]\">
          <form onSubmit={submitSearch} className=\"mb-5\">
            <label className=\"font-mono text-[10px] uppercase tracking-widest block mb-1.5\">Search</label>
            <input
              data-testid=\"filter-search\"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder=\"Naruto figure...\"
              className=\"w-full border-2 border-black px-2 py-1.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-[#FF2A2A]\"
            />
          </form>

          <div className=\"mb-5\">
            <h4 className=\"font-anton text-lg uppercase mb-2\">Category</h4>
            <ul className=\"space-y-1\">
              <li>
                <button
                  data-testid=\"filter-category-all\"
                  onClick={() => update(\"category\", \"\")}
                  className={`text-sm font-mono uppercase ${!category ? \"text-[#FF2A2A] underline\" : \"hover:text-[#FF2A2A]\"}`}
                >All</button>
              </li>
              {meta.categories.map((c) => (
                <li key={c}>
                  <button
                    data-testid={`filter-category-${c}`}
                    onClick={() => update(\"category\", c)}
                    className={`text-sm font-mono uppercase ${category === c ? \"text-[#FF2A2A] underline\" : \"hover:text-[#FF2A2A]\"}`}
                  >{c}</button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className=\"font-anton text-lg uppercase mb-2\">Anime</h4>
            <ul className=\"space-y-1 max-h-64 overflow-y-auto pr-1\">
              <li>
                <button
                  data-testid=\"filter-anime-all\"
                  onClick={() => update(\"anime\", \"\")}
                  className={`text-sm font-mono uppercase ${!anime ? \"text-[#FF2A2A] underline\" : \"hover:text-[#FF2A2A]\"}`}
                >All</button>
              </li>
              {meta.animes.map((a) => (
                <li key={a}>
                  <button
                    data-testid={`filter-anime-${a.replace(/\s+/g, \"-\")}`}
                    onClick={() => update(\"anime\", a)}
                    className={`text-sm font-mono uppercase ${anime === a ? \"text-[#FF2A2A] underline\" : \"hover:text-[#FF2A2A]\"}`}
                  >{a}</button>
                </li>
              ))}
            </ul>
          </div>

          {activeFilters.length > 0 && (
            <button
              data-testid=\"filter-clear\"
              onClick={clearAll}
              className=\"mt-5 w-full font-mono text-xs uppercase border-2 border-black py-1.5 hover:bg-black hover:text-white transition-colors\"
            >Clear filters</button>
          )}
        </aside>

        <section>
          {loading ? (
            <div className=\"font-mono uppercase text-sm\">Loading...</div>
          ) : products.length === 0 ? (
            <div className=\"border-2 border-black p-10 text-center\">
              <p className=\"font-anton text-2xl uppercase\">No products found</p>
              <p className=\"font-mono text-xs text-[#555] mt-2\">Try adjusting filters.</p>
            </div>
          ) : (
            <div className=\"grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6\" data-testid=\"shop-grid\">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
"
Observation: Create successful: /app/frontend/src/pages/Shop.jsx