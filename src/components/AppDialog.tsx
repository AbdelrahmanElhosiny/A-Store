import { useId } from "react";
import styled from "@emotion/styled";
import { Dialog, useMediaQuery } from "@mui/material";
import DialogHeader from "./DialogHeader";
import useSide from "../hooks/useSide";
import { color } from "../styles/tokens";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string | null; // e.g. the item's name
  width?: number; // px, on screens wide enough
  children: React.ReactNode;
}

// Every dialog in the app: MUI Dialog (focus trap, Esc, backdrop click,
// scrolls when taller than the screen) with the sharp Gruvbox look
const AppDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  width = 480,
  children,
}) => {
  // the dialog renders outside the page, so it takes the side colour itself
  const { side } = useSide();
  const titleId = useId();
  const isReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  return (
    <Holder
      open={isOpen}
      onClose={onClose}
      aria-labelledby={titleId}
      transitionDuration={isReducedMotion ? 0 : undefined}
      PaperProps={{
        className: side,
        style: { "--dialog-width": `${width}px` } as React.CSSProperties,
      }}
    >
      <DialogHeader
        title={title}
        subtitle={subtitle}
        titleId={titleId}
        onClose={onClose}
      />
      {children}
    </Holder>
  );
};

const Holder = styled(Dialog)`
  .MuiBackdrop-root {
    background-color: rgb(0 0 0 / 0.55);
  }

  .MuiDialog-paper {
    font-family: var(--font-sans);
    background-color: ${color.bg1};
    color: ${color.fg};
    border: 1px solid ${color.bg2};
    box-shadow: var(--shadow-2);
    width: min(calc(100vw - 2 * var(--page-gutter)), var(--dialog-width));
    max-width: none;
    margin: var(--page-gutter);
    max-height: calc(100% - 2 * var(--page-gutter));
    padding: var(--space-l);
  }

  @media (max-width: 599px) {
    .MuiDialog-paper {
      padding: var(--space-m);
    }
  }
`;

export default AppDialog;
