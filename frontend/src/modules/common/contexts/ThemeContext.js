import { createContext, useContext, useEffect, useState } from "react";
import { THEME } from "../../common/styles/theme";

const ThemeContext = createContext(undefined);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  const changeTheme = (newTheme) => {
    if (newTheme === "light" || newTheme === "dark") {
      setTheme(newTheme);
      localStorage.setItem("theme", newTheme);
    } else {
      console.error("Invalid theme value:", newTheme);
    }
  };

  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem("theme");
      if (storedTheme === "light" || storedTheme === "dark") {
        setTheme(storedTheme);
      }
    } catch (error) {
      console.error("Failed to load theme from localStorage", error);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, changeTheme, colors: THEME[theme] }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
