import { Global, css } from "@emotion/react";
import colorD from "./colorD";
import size from "./size";

type ThemeType = "sell" | "buy";

const GlobalStyle = () => {
  return <Global styles={style} />;
};

const style = css`
  :root {
    --sell-color: ${colorD.purple};
    --buy-color: ${colorD.blue};

    /* sizes */
    --size-xs: 14px;
    --size-s: 16px;
    --size-m: 20px;
    --size-l: 30px;
    --size-xl: 40px;
  }

  h1 {
    font-size: ${size.xl};
  }
  h2 {
    font-size: ${size.l};
  }

  p {
  }

  .buy {
    --primary-color: var(--buy-color);
  }

  .sell {
    --primary-color: var(--sell-color);
  }

  dialog {
    &::backdrop {
    }
  }
`;

export type { ThemeType };
export default GlobalStyle;
