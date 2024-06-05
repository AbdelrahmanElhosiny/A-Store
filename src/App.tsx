import RootApp from "./layout/RootApp";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./app/store";
import "./App.css";
import GlobalStyle from "./styles/GlobalStyle";
import { ThemeProvider } from "@mui/material";
import sellTheme from "./styles/sellTheme";

function App() {
  return (
    <BrowserRouter>
      <Provider store={store}>
        <GlobalStyle />
        <RootApp />
      </Provider>
    </BrowserRouter>
  );
}

export default App;
