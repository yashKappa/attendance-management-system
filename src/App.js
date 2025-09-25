import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Admin from "./components/Admin/Admin";
import AdminLogin from "./components/Admin/AdminLogin";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedIn = Cookies.get("adminLoggedIn");
    if (loggedIn === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <div>
      {isLoggedIn ? (
        <Admin />
      ) : (
        <AdminLogin onLogin={() => setIsLoggedIn(true)} />
      )}
    </div>
  );
}

export default App;
