import styled from "@emotion/styled";
import font from "../styles/font";
import colorD from "../styles/colorD";
import { ThemeType } from "../styles/GlobalStyle";

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
      <div className="nav-bar">{NavBar}</div>
      <div className="main-component">{MainComponent}</div>
      <footer>
        <div className="copy-rights">All rights reserved.</div>
        <div className="links-holder">
          <a href="#" className="link">
            Help
          </a>
          <a href="#" className="link">
            Privacy
          </a>
          <a href="#" className="link">
            Contact
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
  position: relative;
  min-height: calc(100vh - 5em);
  --padding-inline: 3em;
  padding: 4em 0em 1em;

  .main-component {
    padding-inline: var(--padding-inline);
    padding-bottom: 3em;
  }

  .nav-bar {
    position: fixed;
    top: 0em;
    width: 100%;
    height: 3em;
    z-index: 100;
  }

  footer {
    background-color: ${colorD.bg};
    display: flex;
    justify-content: space-between;
    padding-inline: var(--padding-inline);
    color: ${colorD.fg};
    ${font.Bold}
    position: absolute;
    width: calc(100% - 6em);
    bottom: 0em;
    height: 3em;
  }
`;

export default Layout;
