import React, { useState } from "react";
import { Button } from "@mui/material";
import { MdLightMode } from "react-icons/md";


const ThemeToggleButton = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);

    // Alterar a classe do body
    if (!isDarkMode) {
      document.body.classList.remove("dark");
      document.body.classList.add("light");
    } else {
      document.body.classList.remove("light");
      document.body.classList.add("dark");
    }
  };

  return (
    <Button variant="contained" onClick={toggleTheme} className="ToogleTheme">
        <MdLightMode />
    </Button>
  );
};

export default ThemeToggleButton;
