import { useState } from "react";
import styled from "@emotion/styled";
import CloseIcon from "@mui/icons-material/Close";
import { EXTERNAL_LINK } from "../constant/linkConstant";
import { color } from "../styles/tokens";
import font from "../styles/font";

const STORAGE_KEY = "a-store-chip-hidden";

// storage can be blocked (private windows): then the chip just shows
const readHidden = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

// A small fixed note that this is the AI-enhanced version, with links to the
// classic one and to everything that changed. Can be hidden for good.
const VersionChip = () => {
  const [isHidden, setIsHidden] = useState(readHidden);

  const hide = () => {
    setIsHidden(true);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // hidden until the next visit
    }
  };

  if (isHidden) return null;
  return (
    <Holder aria-label="About this version">
      <span className="name">AI-enhanced</span>
      <span className="dot" aria-hidden="true">
        ·
      </span>
      <a href={EXTERNAL_LINK.CLASSIC_SITE} target="_blank" rel="noreferrer">
        <span className="long">See the classic version</span>
        <span className="short">Classic version</span>
      </a>
      <span className="dot" aria-hidden="true">
        ·
      </span>
      <a href={EXTERNAL_LINK.AI_COMPARE} target="_blank" rel="noreferrer">
        Changes
      </a>
      <button type="button" className="hide" aria-label="Hide" onClick={hide}>
        <CloseIcon />
      </button>
    </Holder>
  );
};

const Holder = styled.aside`
  ${font.Bold}
  position: fixed;
  left: var(--space-s);
  bottom: var(--space-s);
  z-index: 90; /* under the navbar (100) and dialogs */
  display: flex;
  align-items: center;
  gap: var(--space-xs) var(--space-s);
  max-width: calc(100vw - 2 * var(--space-s));
  padding: var(--space-xs) var(--space-xs) var(--space-xs) var(--space-s);
  font-size: 0.75rem;
  background-color: ${color.fg};
  color: ${color.bg};
  box-shadow: var(--shadow-2);

  .name {
    white-space: nowrap;
  }

  .dot {
    opacity: 0.6;
  }

  a {
    color: inherit;
    white-space: nowrap;
    text-underline-offset: 3px;
    &:hover {
      text-decoration-thickness: 2px;
    }
  }

  .hide {
    display: grid;
    place-items: center;
    width: 24px;
    height: 24px;
    padding: 0;
    border: 0;
    background: none;
    color: inherit;
    cursor: pointer;
    .MuiSvgIcon-root {
      font-size: 16px;
    }
  }

  .short {
    display: none;
  }
  /* phones: shorter link text so it fits on one line at 360 px */
  @media (max-width: 599px) {
    .long {
      display: none;
    }
    .short {
      display: inline;
    }
  }
`;

export default VersionChip;
