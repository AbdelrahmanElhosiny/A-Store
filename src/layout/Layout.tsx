import styled from "@emotion/styled";
import font from "../styles/font";
import { color } from "../styles/tokens";
import { ThemeType } from "../styles/GlobalStyle";
import { EXTERNAL_LINK } from "../constant/linkConstant";

interface Props {
  NavBar: React.ReactElement;
  MainComponent: React.ReactElement;
  Theme: ThemeType;
}
// -----------------
// JSX
// -----------------
const Layout: React.FC<Props> = ({ NavBar, MainComponent, Theme }) => {
  return (
    <Holder className={`${Theme}`}>
      <header className="nav-bar">{NavBar}</header>
      <main className="main-component">{MainComponent}</main>
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
        </div>
      </footer>
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

  .main-component {
    flex: 1;
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
  }
`;

export default Layout;
