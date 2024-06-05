import { createTheme } from "@mui/material";
import colorD from "./colorD";

const sellTheme = createTheme({
  palette: {
    primary: {
      main: `${colorD.purple}`,
    },
    error: {
      main: `${colorD.red}`,
    },
  },
  shape: {
    borderRadius: 0,
  },
});

export default sellTheme;
