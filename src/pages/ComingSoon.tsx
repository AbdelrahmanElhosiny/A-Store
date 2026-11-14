import { Button } from "@mui/material";
import { Link } from "react-router-dom";
import useSide from "../hooks/useSide";
import useDocumentTitle from "../hooks/useDocumentTitle";

const ComingSoon: React.FC<{ title: string; phase: string }> = ({ title, phase }) => {
  const { side, homePath } = useSide();
  useDocumentTitle(title);

  return (
    <section>
      <h2>{title}</h2>
      <p>Arrives in {phase}.</p>
      <Button variant="outlined" component={Link} to={homePath}>
        {side === "buy" ? "Go to the shop" : "Go to the seller centre"}
      </Button>
    </section>
  );
};

export default ComingSoon;
