import { useState } from "react";
import { useLocation } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import styled from "@emotion/styled";
import font from "../styles/font";
import { color } from "../styles/tokens";
import { ThemeType } from "../styles/GlobalStyle";
import { EXTERNAL_LINK } from "../constant/linkConstant";
import ResetDemoDialog from "../components/ResetDemoDialog";
import Toaster from "../components/Toaster";
import ErrorFallback from "../components/ErrorFallback";
import PageTransition from "../components/PageTransition";

interface Props {
  NavBar: React.ReactElement;
  MainComponent: React.ReactElement;
  Theme: ThemeType;
}
// -----------------
// JSX
// -----------------
const Layout: React.FC<Props> = ({ NavBar, MainComponent, Theme }) => {
  const [isResetOpen, setIsResetOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <Holder className={`${Theme}`}>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="nav-bar">
        {/* every page's title is an h2, under this one for the whole side */}
        <h1 className="visually-hidden">
          {Theme === "buy" ? "A-Store shop" : "A-Store seller tools"}
        </h1>
        {NavBar}
      </header>
      <main className="main-component" id="main" tabIndex={-1}>
        {/* a crashed page keeps the nav; going to another page clears it */}
        <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[pathname]}>
          <PageTransition>{MainComponent}</PageTransition>
        </ErrorBoundary>
      </main>
      <footer>
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
      </footer>
      <ResetDemoDialog
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
      />
      <Toaster />
    </Holder>
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

  .main-component {
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
