import { Link } from "react-router-dom";
import styled from "@emotion/styled";
import { Button } from "@mui/material";
import useSide from "../hooks/useSide";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { ROUTE_INDEX } from "../constant/routeConstant";
import { color } from "../styles/tokens";
import font from "../styles/font";

// Shown inside the side's layout, so the nav is there to find the way back
const Error404 = () => {
  const { side, homePath, pathname } = useSide();
  useDocumentTitle("Page not found");

  return (
    <Holder>
      <p className="code" aria-hidden="true">
        404
      </p>
      <h2>Page not found</h2>
      <p className="text">
        Nothing lives at <code>{pathname}</code>. The link may be old or have a
        typo.
      </p>
      <div className="buttons">
        <Button variant="contained" component={Link} to={homePath}>
          {side === "buy" ? "Go to the shop" : "Go to your items"}
        </Button>
        <Button variant="outlined" component={Link} to={ROUTE_INDEX.HOME}>
          Home page
        </Button>
      </div>
    </Holder>
  );
};

const Holder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-s);
  max-width: 560px;
  padding-block: var(--space-xl);

  .code {
    ${font.ItalicBold}
    margin: 0 0 var(--space-m);
    padding: 0 var(--space-m);
    font-size: clamp(64px, 18vw, 120px);
    line-height: 1.1;
    background-color: ${color.primary};
    color: ${color.bg};
    box-shadow: var(--shadow-3);
  }

  h2 {
    margin: 0;
  }

  .text {
    margin: 0;
    color: ${color.fgMuted};
    overflow-wrap: anywhere;

    code {
      ${font.Bold}
      color: ${color.fg};
    }
  }

  .buttons {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-s);
    margin-top: var(--space-m);
  }
`;

export default Error404;
