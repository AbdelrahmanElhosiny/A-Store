import { createTheme } from "@mui/material";
import colorD from "./colorD";

const buyTheme = createTheme({
  palette: {
    primary: {
      main: `${colorD.blue}`,
    },
    error: {
      main: `${colorD.red}`,
    },
  },
  shape: {
    borderRadius: 0,
  },
});

export default buyTheme;
