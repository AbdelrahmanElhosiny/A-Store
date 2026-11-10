import styled from "@emotion/styled";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import font from "../styles/font";
import { color } from "../styles/tokens";

interface Props {
  title: string;
  subtitle?: string | null; // e.g. the item's name
  titleId?: string; // for the dialog's aria-labelledby
  onClose: () => void;
}

// Title row of a dialog: title, optional subtitle, and an X to close
const DialogHeader: React.FC<Props> = ({
  title,
  subtitle,
  titleId,
  onClose,
}) => {
  return (
    <Holder>
      <div className="titles">
        <h3 className="title" id={titleId}>
          {title}
        </h3>
        {subtitle && <div className="subtitle">{subtitle}</div>}
      </div>
      <IconButton
        className="close"
        aria-label="Close"
        onClick={onClose}
        edge="end"
      >
        <CloseIcon />
      </IconButton>
    </Holder>
  );
};

const Holder = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-m);
  padding-bottom: var(--space-m);
  border-bottom: 1px solid ${color.bg2};

  .titles {
    min-width: 0;
  }

  .title {
    margin: 0;
    font-size: 1.35em;
    font-weight: 600;
    line-height: 1.2;
  }

  .subtitle {
    ${font.Bold}
    margin-top: var(--space-xs);
    color: ${color.primary};
    overflow-wrap: anywhere;
  }

  .close {
    color: ${color.fg};
    margin-top: -6px;
  }
`;

export default DialogHeader;
