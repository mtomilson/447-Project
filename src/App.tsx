import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/login";

function App() {
  // If adding more routes follow login format <Route path="/pathname" element={<page component/>}/>
  // all components inside authprovider component will have access to user data and session token
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="" element={<Login />} /> 
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
