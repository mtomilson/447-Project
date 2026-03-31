import { createContext, useContext, useState } from "react";

type AuthContextType = {
  user: any | null; // profile data from your profiles table
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null); //auth context allows all children to use the data from this file
                                                                 // important for authentication purposes

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState<string | null>(null);

  async function login(email: string, password: string) {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, { // calls api and returns token and user data
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      console.log("error: ", data.error);
    } else {
      console.log(data.user);
      console.log(data.token);
      setUser(data.user);
      setToken(data.token);
    }
  }

  function logout() {
    setUser(null);
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// useAuth function is able to be used in any children component as long as it's wrapped in
// the <AuthProvider> tags. It gives access to login, logout, user and token.
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
