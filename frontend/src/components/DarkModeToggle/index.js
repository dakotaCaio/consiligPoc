import React, { useContext } from "react";
import { IconButton } from "@material-ui/core";
import Brightness4Icon from "@material-ui/icons/Brightness4";
import Brightness7Icon from "@material-ui/icons/Brightness7";
import ColorModeContext from "../../layout/themeContext";
const DarkModeToggle = () => {
  const { colorMode } = useContext(ColorModeContext); 
  const { toggleColorMode } = colorMode;

  return (
    <div>
      <IconButton onClick={toggleColorMode}>
        {colorMode.mode === "light" ? <Brightness4Icon /> : <Brightness7Icon />}
      </IconButton>
    </div>
  );
};

export default DarkModeToggle;
