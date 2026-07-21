
Action: file_editor create /app/frontend/src/components/ProductCard.jsx --file-text "import { Link } from \"react-router-dom\";

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/product/${product.id}`}
      data-testid={`product-card-${product.id}`}
      className=\"group block border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-transform\"
    >
      <div className=\"aspect-[4/5] overflow-hidden border-b-2 border-black bg-[#F4F4F0]\">
        <img
          src={product.image}
          alt={product.name}
          loading=\"lazy\"
          className=\"w-full h-full object-cover group-hover:scale-105 transition-transform duration-200\"
        />
      </div>
      <div className=\"p-4\">
        <div className=\"flex items-center gap-2 mb-2\">
          <span className=\"text-[10px] font-mono uppercase tracking-widest bg-[#FFD700] border border-black px-1.5 py-0.5\">
            {product.category}
          </span>
          <span className=\"text-[10px] font-mono uppercase text-[#555]\">{product.anime}</span>
        </div>
        <h3 className=\"font-anton text-lg leading-tight uppercase mb-2 line-clamp-2 min-h-[3rem]\">
          {product.name}
        </h3>
        <div className=\"flex items-baseline justify-between\">
          <span className=\"font-anton text-2xl\">${product.price.toFixed(2)}</span>
          {product.stock <= 10 && (
            <span className=\"text-[10px] font-mono uppercase text-[#FF2A2A]\">Only {product.stock} left</span>
          )}
        </div>
      </div>
    </Link>
  );
}
"
Observation: Create successful: /app/frontend/src/components/ProductCard.jsx