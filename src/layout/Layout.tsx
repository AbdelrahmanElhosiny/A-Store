import { Suspense, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import styled from "@emotion/styled";
import useIsPhone from "../hooks/useIsPhone";
import { CATEGORIES } from "../constant/categories";
import { ROUTES } from "../constant/routes";
import font from "../styles/font";
import { color } from "../styles/tokens";
import { ThemeType } from "../styles/GlobalStyle";
import { EXTERNAL_LINK } from "../constant/linkConstant";
import ResetDemoDialog from "../components/ResetDemoDialog";
import Toaster from "../components/Toaster";
import ErrorFallback from "../components/ErrorFallback";
import PageTransition from "../components/PageTransition";
import MotionProvider from "../components/MotionProvider";

interface LayoutProps {
  NavBar: React.ReactElement;
  MainComponent: React.ReactElement;
  Theme: ThemeType;
  Sidebar?: React.ReactElement;
}
// -----------------
// JSX
// -----------------
const Layout: React.FC<LayoutProps> = ({ NavBar, MainComponent, Theme, Sidebar }) => {
  const [isResetOpen, setIsResetOpen] = useState(false);
  const { pathname } = useLocation();
  const isPhone = useIsPhone();
  const wideBuyer = Theme === "buy" && !isPhone;

  return (
    // animations live here, not around the whole app: the home page has
    // none, so it doesn't download the animation code
    <MotionProvider>
      <Holder className={`${Theme}`}>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <header className="nav-bar">
          {/* every page's title is an h2, under this one for the whole side */}
          <h1 className="visually-hidden">
            {Theme === "buy" ? "A-Store shop" : "A-Store seller centre"}
          </h1>
          {NavBar}
        </header>
        <div className={`body${Sidebar ? " with-sidebar" : ""}`}>
        {Sidebar && <aside className="sidebar">{Sidebar}</aside>}
        <main className="main-component" id="main" tabIndex={-1}>
          {/* a crashed page keeps the nav; going to another page clears it */}
          <ErrorBoundary
            FallbackComponent={ErrorFallback}
            resetKeys={[pathname]}
          >
            {/* a page inside the side is loading: the nav and footer stay */}
            <Suspense fallback={null}>
              <PageTransition>{MainComponent}</PageTransition>
            </Suspense>
          </ErrorBoundary>
        </main>
        </div>
        <footer className={wideBuyer ? "columns" : undefined}>
          {wideBuyer && <>
            <section>
              <h2 className="footer-heading">Shop by category</h2>
              <div className="links-holder">
                <Link className="link" to={ROUTES.search()}>All categories</Link>
                {CATEGORIES.map(({ id, label }) => <Link className="link" key={id} to={ROUTES.category(id)}>{label}</Link>)}
              </div>
            </section>
            <section>
              <h2 className="footer-heading">Help</h2>
              <div className="links-holder">
                <Link className="link" to={ROUTES.accountOrders}>Your orders</Link>
                <Link className="link" to={ROUTES.seller}>Sell on A-Store</Link>
                <a className="link" href={EXTERNAL_LINK.AI_LOG}>How this demo was built</a>
              </div>
            </section>
          </>}
          <section className="footer-about">
          {wideBuyer && <h2 className="footer-heading">About</h2>}
          <div className="about">
            A-Store <span className="note">· rebuilt with AI</span>
          </div>
          <div className="links-holder">
            <a href={EXTERNAL_LINK.REPO} className="link">
              Source
            </a>
            <a href={EXTERNAL_LINK.CLASSIC_SOURCE} className="link">
              Classic version
            </a>
            <a href={EXTERNAL_LINK.AI_COMPARE} className="link">
              What AI changed
            </a>
            <button
              type="button"
              className="link reset"
              onClick={() => setIsResetOpen(true)}
            >
              Reset demo data
            </button>
          </div>
          </section>
        </footer>
        <ResetDemoDialog
          isOpen={isResetOpen}
          onClose={() => setIsResetOpen(false)}
        />
        <Toaster />
      </Holder>
    </MotionProvider>
  );
};

// -----------------
// Styled component
// -----------------
const Holder = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;

  .nav-bar {
    position: sticky;
    top: 0;
    height: var(--nav-height);
    z-index: 100;
  }

  /* hidden until a keyboard user tabs to it */
  .skip-link {
    ${font.Bold}
    position: absolute;
    top: var(--space-s);
    left: var(--space-s);
    z-index: 200;
    padding: var(--space-s) var(--space-m);
    background-color: var(--primary-color);
    color: ${color.bg};
    box-shadow: var(--shadow-2);
    transform: translateY(-200%);
    &:focus-visible {
      transform: none;
    }
  }

  /* main still fills the column between header and footer */
  .body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    &.with-sidebar { display: grid; grid-template-columns: 200px minmax(0, 1fr); }
  }
  .sidebar {
    position: sticky;
    top: var(--nav-height);
    height: calc(100dvh - var(--nav-height));
    overflow-y: auto;
    background: ${color.bg1};
    border-right: 1px solid ${color.bg2};
    box-sizing: border-box;
    align-self: start;
  }

  .main-component {
    min-width: 0;
    flex: 1;
    &:focus {
      outline: none;
    }
    padding: var(--space-l) var(--page-gutter) var(--space-xxl);
  }

  footer {
    ${font.Bold}
    background-color: ${color.bg1};
    border-top: 1px solid ${color.bg2};
    color: ${color.fg};
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-s) var(--space-l);
    padding: var(--space-m) var(--page-gutter);
    font-size: 0.9em;

    .footer-heading { ${font.Bold} font-size: 0.9rem; margin: 0 0 var(--space-m); }
    .footer-about {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-s) var(--space-l);
      width: 100%;
    }
    &.columns {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      align-items: start;
      .footer-about { display: block; }
      .about { margin-bottom: var(--space-s); }
      .links-holder { flex-direction: column; align-items: flex-start; }
    }

    .note {
      color: ${color.fgMuted};
    }

    .links-holder {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-s) var(--space-l);
    }

    .link {
      color: ${color.fg};
      text-decoration: none;
      border-bottom: 2px solid var(--primary-color);
      &:hover,
      &:focus-visible {
        color: var(--primary-color);
      }
    }

    /* a button that looks like the links next to it */
    .reset {
      font: inherit;
      background: none;
      border-width: 0 0 2px;
      border-color: ${color.red};
      padding: 0;
      cursor: pointer;
      &:hover,
      &:focus-visible {
        color: ${color.red};
      }
    }
  }
`;

export default Layout;
