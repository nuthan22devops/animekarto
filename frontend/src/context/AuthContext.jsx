
Action: file_editor create /app/frontend/src/context/AuthContext.jsx --file-text "import { createContext, useContext, useEffect, useState, useCallback } from \"react\";
import { authApi, formatApiError } from \"@/lib/api\";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = checking
  const [ready, setReady] = useState(false);

  useEffect(() => {
    authApi.me()
      .then((r) => setUser(r.data))
      .catch(() => setUser(false))
      .finally(() => setReady(true));
  }, []);

  const login = useCallback(async (email, password) => {
    const r = await authApi.login({ email, password });
    setUser(r.data);
    return r.data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const r = await authApi.register({ name, email, password });
    setUser(r.data);
    return r.data;
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    setUser(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout, formatApiError }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
"
Observation: Create successful: /app/frontend/src/context/AuthContext.jsx