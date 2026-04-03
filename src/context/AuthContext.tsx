import { createContext, useContext, useState } from "react";

type AuthContextType = {
  user: any | null; // profile data from your profiles table
  token: string | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null); //auth context allows all children to use the data from this file
                                                                 // important for authentication purposes

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user"); // stores user in the browser's local storage
    return stored ? JSON.parse(stored) : null;   // if user exists parse it, if not return null ( no user )
  });
  const [token, setToken] = useState<string | null>(null);

  async function login(email: string, password: string) {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, { // calls api and returns token and user data
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error)
    } else {
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("token", data.token); // create an object in local storage with the value of token
      localStorage.setItem("user", JSON.stringify(data.user));
      return data.user;
    }
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
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
