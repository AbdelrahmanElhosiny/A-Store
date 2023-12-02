import styled from "@emotion/styled";
import { Link } from "react-router-dom";
import colorD from "../styles/colorD";
import sellImage from "../assets/sell.jpg";
import buyImage from "../assets/buy.jpg";
import font from "../styles/font";

// -----------------
// TSX
// -----------------
const HomePage = () => {
  return (
    <Holder>
      <div className="sell-section">
        <Link to="/sell">
          <button className="sell-button">Sell</button>
        </Link>
      </div>
      <div className="buy-section">
        <Link to="/buy">
          <button className="buy-button">Buy</button>
        </Link>
      </div>
    </Holder>
  );
};

// -----------------
// Styled component
// -----------------
const Holder = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 100vh;
  overflow: hidden;
  background-color: ${colorD.bg};

  /* main style of the sides */
  .sell-section,
  .buy-section {
    display: flex;
    justify-content: center;
    align-items: center;
    background-size: cover;
    transition: all 0.7s;
    filter: saturate(0%);
    &:hover {
      filter: none;
      scale: 102%;
    }
  }

  /* add background images to the sides */
  .sell-section {
    background-image: url(${sellImage});
  }
  .buy-section {
    background-image: url(${buyImage});
  }

  /* shared buttons style */
  button {
    scale: 150%;
    ${font.ItalicBold}
    cursor: pointer;
    color: ${colorD.bg};
    border: double;
    font-size: 2em;
    padding: 0.7em 1.2em;
    transition: all 0.4s;
    border-width: 0.3em;
    border-color: rgba(255, 255, 255, 0);
    outline: 0.2em solid rgba(255, 255, 255, 0);
    &:hover {
      padding: 1.4em 2em;
    }
  }

  /* buttons separated style to specify colors */
  .buy-button {
    background-color: ${colorD.blue};
    &:hover {
      border-color: ${colorD.bg};
      outline: 0.5em solid ${colorD.blue};
    }
  }
  .sell-button {
    background-color: ${colorD.orange};
    &:hover {
      border-color: ${colorD.bg};
      outline: 0.5em solid ${colorD.orange};
    }
  }
`;

export default HomePage;
