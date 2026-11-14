import { ROUTES } from "../constant/routes";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { RootState, setupStore } from "../app/store";
import ThemeModeProvider from "../styles/ThemeModeProvider";

// Renders a component with its own store (the seed, or preloadedState), the
// app's theme and a router at `route`. Returns the store to dispatch or
// read from.
export const renderWithStore = (
  ui: React.ReactElement,
  opts: { preloadedState?: Partial<RootState>; route?: string } = {},
) => {
  const store = setupStore(opts.preloadedState);
  const result = render(
    <Provider store={store}>
      <ThemeModeProvider>
        <MemoryRouter initialEntries={[opts.route ?? ROUTES.home]}>{ui}</MemoryRouter>
      </ThemeModeProvider>
    </Provider>,
  );
  return { ...result, store };
};
