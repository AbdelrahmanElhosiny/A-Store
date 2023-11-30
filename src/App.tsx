import RootApp from "./layout/RootApp";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./app/store";
import "./App.css";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <RootApp />
      </BrowserRouter>
    </Provider>
  );
}

export default App;
