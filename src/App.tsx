import RootApp from "./layout/RootApp";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./app/store";
import "./App.css";
import GlobalStyle from "./styles/GlobalStyle";

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
