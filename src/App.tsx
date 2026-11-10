import RootApp from "./layout/RootApp";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./app/store";
import "./App.css";
import GlobalStyle from "./styles/GlobalStyle";
import ThemeModeProvider from "./styles/ThemeModeProvider";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "./components/ErrorFallback";
import MotionProvider from "./components/MotionProvider";

function App() {
  return (
    <BrowserRouter>
      <Provider store={store}>
        <ThemeModeProvider>
          <GlobalStyle />
          <MotionProvider>
            {/* last line of defence: a crash in the nav or layout */}
            <ErrorBoundary
              fallbackRender={(props) => (
                <ErrorFallback {...props} isFullPage />
              )}
            >
              <RootApp />
            </ErrorBoundary>
          </MotionProvider>
        </ThemeModeProvider>
      </Provider>
    </BrowserRouter>
  );
}

export default App;
