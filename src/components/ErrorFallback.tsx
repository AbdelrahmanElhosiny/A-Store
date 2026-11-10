import { useDispatch } from "react-redux";
import { FallbackProps } from "react-error-boundary";
import styled from "@emotion/styled";
import { Button } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import resetDemoData from "../app/resetDemoData";
import { AppDispatch } from "../app/store";
import { color } from "../styles/tokens";
import font from "../styles/font";

type Props = FallbackProps & {
  // the app-wide boundary fills the screen; the page one sits under the nav
  isFullPage?: boolean;
};

// What shows instead of a page that crashed
const ErrorFallback: React.FC<Props> = ({
  error,
  resetErrorBoundary,
  isFullPage = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  // saved data from an older version is the likeliest cause, so the reset
  // puts the shop back to its starter data before trying again
  const handleReset = () => {
    dispatch(resetDemoData());
    resetErrorBoundary();
  };

  return (
    <Holder className={isFullPage ? "full-page buy" : ""}>
      <div className="box" role="alert">
        <span className="icon" aria-hidden="true">
          <ErrorOutlineIcon />
        </span>
        <h2>Something went wrong</h2>
        <p>
          This page hit an error. Trying again usually fixes it. If it keeps
          happening, reset the demo data: that clears what this browser saved
          for the shop.
        </p>
        {import.meta.env.DEV && error instanceof Error && (
          <pre className="details">{error.message}</pre>
        )}
        <div className="buttons">
          <Button variant="contained" onClick={resetErrorBoundary}>
            Try again
          </Button>
          <Button variant="outlined" color="error" onClick={handleReset}>
            Reset demo data
          </Button>
        </div>
      </div>
    </Holder>
  );
};

const Holder = styled.div`
  &.full-page {
    min-height: 100vh;
    min-height: 100dvh;
    display: grid;
    place-items: center;
    padding: var(--space-xl) var(--page-gutter);
  }

  .box {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-s);
    max-width: 560px;
    padding: var(--space-xl) var(--space-l);
    background-color: ${color.bg1};
    border: 1px solid ${color.bg2};
    border-left: 6px solid ${color.red};
  }

  .icon {
    display: grid;
    place-items: center;
    width: 56px;
    height: 56px;
    background-color: ${color.red};
    color: ${color.bg};
    box-shadow: var(--shadow-2);
    .MuiSvgIcon-root {
      font-size: 32px;
    }
  }

  h2 {
    margin: var(--space-s) 0 0;
  }

  p {
    margin: 0;
    color: ${color.fgMuted};
  }

  .details {
    ${font.Regular}
    margin: 0;
    padding: var(--space-s) var(--space-m);
    max-width: 100%;
    overflow-x: auto;
    font-size: 0.85rem;
    background-color: ${color.bg2};
    color: ${color.fg};
  }

  .buttons {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-s);
    margin-top: var(--space-m);
  }
`;

export default ErrorFallback;
