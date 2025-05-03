import { createTheme } from "@mui/material/styles";
import { blueGrey, teal } from "@mui/material/colors";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: blueGrey[800],
    },
    secondary: {
      main: teal[500],
    },
    background: {
      default: blueGrey[50],
      paper: "#ffffff",
    },
  },
  typography: {
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {},
      },
    },
  },
});

export default theme;
