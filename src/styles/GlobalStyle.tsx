import { Global, css } from "@emotion/react";
import colorD from "./colorD";

type ThemeType = "sell" | "buy";

const GlobalStyle = () => {
  return <Global styles={style} />;
};

const style = css`
  :root {
    --sell-color: ${colorD.orange};
    --buy-color: ${colorD.green};
  }

  h1 {
  }

  p {
  }

  .buy {
    --primary-color: var(--buy-color);
  }

  .sell {
    --primary-color: var(--sell-color);
  }
`;

export type { ThemeType };
export default GlobalStyle;
