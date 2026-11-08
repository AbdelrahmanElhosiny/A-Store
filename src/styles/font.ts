import { css } from "@emotion/react";

// Body text is sans; JetBrains Mono is for prices, numbers, labels and navigation.
const font = {
  Sans: css`
    font-family: var(--font-sans);
  `,
  Regular: css`
    font-family: var(--font-mono);
    font-weight: 400;
    font-style: normal;
  `,
  Bold: css`
    font-family: var(--font-mono);
    font-weight: 700;
    font-style: normal;
  `,
  ItalicBold: css`
    font-family: var(--font-mono);
    font-weight: 700;
    font-style: italic;
  `,
};

export default font;
