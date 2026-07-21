Backend is up with 24 seeded products and admin. Now let's build the frontend.
Action: file_editor create /app/frontend/src/lib/api.js --file-text "import axios from \"axios\";

const BASE = process.env.REACT_APP_BACKEND_URL;
export const API = `${BASE}/api`;

export const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

export const authApi = {
  register: (data) => api.post(\"/auth/register\", data),
  login: (data) => api.post(\"/auth/login\", data),
  logout: () => api.post(\"/auth/logout\"),
  me: () => api.get(\"/auth/me\"),
};

export const productsApi = {
  list: (params = {}) => api.get(\"/products\", { params }),
  meta: () => api.get(\"/products/meta\"),
  get: (id) => api.get(`/products/${id}`),
};

export const cartApi = {
  get: () => api.get(\"/cart\"),
  add: (product_id, quantity = 1) => api.post(\"/cart/items\", { product_id, quantity }),
  update: (product_id, quantity) => api.put(`/cart/items/${product_id}`, { product_id, quantity }),
  remove: (product_id) => api.delete(`/cart/items/${product_id}`),
  clear: () => api.delete(\"/cart\"),
};

export const ordersApi = {
  checkout: (address) => api.post(\"/orders/checkout\", address),
  list: () => api.get(\"/orders\"),
  get: (id) => api.get(`/orders/${id}`),
};

export function formatApiError(err) {
  const detail = err?.response?.data?.detail;
  if (detail == null) return err?.message || \"Something went wrong.\";
  if (typeof detail === \"string\") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e && typeof e.msg === \"string\" ? e.msg : JSON.stringify(e))).join(\" \");
  if (detail && typeof detail.msg === \"string\") return detail.msg;
  return String(detail);
}
"
Observation: Create successful: /app/frontend/src/lib/api.js