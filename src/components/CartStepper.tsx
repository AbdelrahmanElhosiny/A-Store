import { forwardRef, useEffect, useState } from "react";
import styled from "@emotion/styled";
import { IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import font from "../styles/font";
import { color } from "../styles/tokens";

interface Props {
  itemName: string;
  value: number; // how many are in the cart
  max: number; // the stock
  onChange: (value: number) => void; // 0 takes it out of the cart
  className?: string;
}

// -----------------
// JSX
// -----------------
// − [n] + and a clear button for one item in the cart.
// The ref points at the + button, so a parent can move focus there.
const CartStepper = forwardRef<HTMLButtonElement, Props>(
  ({ itemName, value, max, onChange, className }, plusRef) => {
    // what's typed, kept apart from the cart until Enter or leaving the field
    const [draft, setDraft] = useState(String(value));
    useEffect(() => setDraft(String(value)), [value]);

    const commitDraft = () => {
      const typed = parseInt(draft, 10);
      if (Number.isNaN(typed)) return setDraft(String(value));
      const next = Math.min(Math.max(typed, 0), max);
      setDraft(String(next));
      if (next !== value) onChange(next);
    };

    return (
      <Holder
        className={className}
        role="group"
        aria-label={`${itemName} in cart`}
      >
        <div className="stepper">
          <IconButton aria-label="One less" onClick={() => onChange(value - 1)}>
            <RemoveIcon />
          </IconButton>
          <input
            className="count"
            aria-label="Quantity"
            inputMode="numeric"
            value={draft}
            onChange={(event) =>
              setDraft(event.target.value.replace(/\D/g, "").slice(0, 4))
            }
            onBlur={commitDraft}
            onKeyDown={(event) => event.key === "Enter" && commitDraft()}
            onFocus={(event) => event.target.select()}
          />
          <IconButton
            ref={plusRef}
            aria-label="One more"
            onClick={() => onChange(value + 1)}
            disabled={value >= max}
          >
            <AddIcon />
          </IconButton>
        </div>
        <IconButton
          className="clear"
          aria-label={`Remove ${itemName} from cart`}
          onClick={() => onChange(0)}
        >
          <DeleteOutlineIcon />
        </IconButton>
      </Holder>
    );
  },
);
CartStepper.displayName = "CartStepper";

// -----------------
// Styled component
// -----------------
const Holder = styled.div`
  display: flex;
  gap: var(--space-s);
  width: 100%;
  /* same height as the "Add to cart" button it replaces, so nothing jumps */
  height: 36.5px;

  /* one joined box: − | n | + */
  .stepper {
    flex: 1;
    display: flex;
    border: 2px solid ${color.primary};
    min-width: 0;

    .MuiIconButton-root {
      color: ${color.primary};
      padding: 0 6px;
      &.Mui-disabled {
        color: ${color.fgMuted};
        opacity: 0.5;
      }
    }
  }

  .count {
    ${font.Bold}
    flex: 1;
    min-width: 2.5em;
    width: 0;
    text-align: center;
    font-size: 1.05rem;
    color: ${color.fg};
    background-color: ${color.bg};
    border: none;
    border-inline: 2px solid ${color.primary};
    border-radius: 0;
    padding: 0;

    /* the caret and the selected number already show focus here */
    &:focus,
    &:focus-visible {
      outline: none;
    }
  }

  .clear {
    color: ${color.red};
    border: 2px solid ${color.bg2};
    padding: 0 6px;
  }
`;

export default CartStepper;
