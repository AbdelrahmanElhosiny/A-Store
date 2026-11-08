import styled from "@emotion/styled";
import { Link } from "react-router-dom";
import { color } from "../styles/tokens";
import sellImage from "../assets/sell.jpg";
import buyImage from "../assets/buy.jpg";
import font from "../styles/font";

// -----------------
// JSX
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
  height: 100dvh;
  overflow: hidden;


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
    color: ${color.bg};
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
    background-color: var(--buy-color);
    &:hover {
      border-color: ${color.bg};
      outline: 0.5em solid var(--buy-color);
    }
  }
  .sell-button {
    background-color: var(--sell-color);
    &:hover {
      border-color: ${color.bg};
      outline: 0.5em solid var(--sell-color);
    }
  }
  /* phones: Sell on top, Buy below */
  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;

    button {
      scale: 100%;
      font-size: 1.6em;
      &:hover {
        padding: 0.9em 1.5em;
      }
    }
  }
`;

export default HomePage;
