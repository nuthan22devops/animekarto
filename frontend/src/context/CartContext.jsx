
Action: file_editor create /app/frontend/src/context/CartContext.jsx --file-text "import { createContext, useContext, useEffect, useState, useCallback } from \"react\";
import { cartApi } from \"@/lib/api\";
import { useAuth } from \"@/context/AuthContext\";

const CartContext = createContext(null);

const empty = { items: [], subtotal: 0, total_items: 0 };

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(empty);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) { setCart(empty); return; }
    try {
      setLoading(true);
      const r = await cartApi.get();
      setCart(r.data);
    } catch {
      setCart(empty);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const addItem = async (product_id, quantity = 1) => {
    const r = await cartApi.add(product_id, quantity);
    setCart(r.data);
    return r.data;
  };
  const updateItem = async (product_id, quantity) => {
    const r = await cartApi.update(product_id, quantity);
    setCart(r.data);
  };
  const removeItem = async (product_id) => {
    const r = await cartApi.remove(product_id);
    setCart(r.data);
  };
  const clear = async () => {
    const r = await cartApi.clear();
    setCart(r.data);
  };

  return (
    <CartContext.Provider value={{ cart, loading, refresh, addItem, updateItem, removeItem, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
"
Observation: Create successful: /app/frontend/src/context/CartContext.jsx