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
  display: grid;
  grid-template-rows: 3em auto 3em;
  min-height: 100vh;
  --padding-inline: 3em;

  .main-component {
    padding-inline: var(--padding-inline);
  }

  .nav-bar {
  }

  footer {
    background-color: ${colorD.bg};
    display: flex;
    justify-content: space-between;
    padding-inline: var(--padding-inline);
    color: ${colorD.fg};
    ${font.Bold}
  }
`;

export default Layout;
