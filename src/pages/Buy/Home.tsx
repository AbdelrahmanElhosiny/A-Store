import { useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import { Button } from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import CheckIcon from "@mui/icons-material/Check";
import { Item } from "../../features/itemSlice";
import ProductCard from "../../components/ProductCard";
import CartStepper from "../../components/CartStepper";
import { color } from "../../styles/tokens";
import useBuy from "./useBuy";
import { AnimatePresence, m } from "motion/react";
import { listItem } from "../../styles/motion";
import useDocumentTitle from "../../hooks/useDocumentTitle";

// how long "Added" shows (it fades out at the end) before the stepper
const ADDED_MS = 1200;

interface CardProps {
  item: Item;
  inCartNum: number;
  onAdd: (item: Item) => void;
  onChangeNum: (item: Item, inCartNum: number) => void;
}

// One card. Not in the cart: "Add to cart". After a click: "Added",
// which fades into − n + and a clear button. Back at 0: "Add to cart".
const BuyCard: React.FC<CardProps> = ({
  item,
  inCartNum,
  onAdd,
  onChangeNum,
}) => {
  const [isJustAdded, setIsJustAdded] = useState(false);
  const addRef = useRef<HTMLButtonElement>(null);
  const plusRef = useRef<HTMLButtonElement>(null);
  // where keyboard focus goes after the button and the stepper swap
  const focusNext = useRef<"plus" | "add" | null>(null);
  const showStepper = inCartNum > 0 && !isJustAdded;

  useEffect(() => {
    if (!isJustAdded) return;
    const timer = setTimeout(() => {
      if (document.activeElement === addRef.current) focusNext.current = "plus";
      setIsJustAdded(false);
    }, ADDED_MS);
    return () => clearTimeout(timer);
  }, [isJustAdded]);

  useEffect(() => {
    if (focusNext.current === "plus") plusRef.current?.focus();
    if (focusNext.current === "add") addRef.current?.focus();
    focusNext.current = null;
  }, [showStepper]);

  const handleAdd = () => {
    if (isJustAdded) return;
    onAdd(item);
    setIsJustAdded(true);
  };

  const handleChangeNum = (next: number) => {
    if (next <= 0) focusNext.current = "add";
    onChangeNum(item, next);
  };

  return (
    <ProductCard item={item}>
      {showStepper ? (
        <CartStepper
          ref={plusRef}
          className="stepper-in"
          itemName={item.name}
          value={inCartNum}
          max={item.stockNum}
          onChange={handleChangeNum}
        />
      ) : (
        <Button
          ref={addRef}
          variant="contained"
          className={`add-button${isJustAdded ? " added" : ""}`}
          startIcon={isJustAdded ? <CheckIcon /> : <AddShoppingCartIcon />}
          onClick={handleAdd}
        >
          {isJustAdded ? (
            <span className="added-label">Added</span>
          ) : (
            "Add to cart"
          )}
        </Button>
      )}
    </ProductCard>
  );
};

// -----------------
// JSX
// -----------------
const BuyHome = () => {
  const { items, addItemToUserCart, setCartItemNum, users, activeUserIndex } =
    useBuy();
  const [announcement, setAnnouncement] = useState("");
  useDocumentTitle("Shop");
  const cart = users[activeUserIndex].cart;
  const inCartNum = (id: string) =>
    cart.find(({ itemId }) => itemId === id)?.inCartNum ?? 0;

  const handleAdd = (item: Item) => {
    addItemToUserCart(item);
    // screen readers hear what the button shows
    setAnnouncement(`${item.name} added to cart`);
  };

  const handleChangeNum = (item: Item, next: number) => {
    setCartItemNum(item.id, next);
    setAnnouncement(
      next > 0
        ? `${next} ${item.name} in cart`
        : `${item.name} removed from cart`,
    );
  };

  const inStock = items.filter(({ stockNum }) => stockNum > 0);

  return (
    <Holder>
      <h2>Buy items</h2>
      <p className="visually-hidden" aria-live="polite">
        {announcement}
      </p>
      {inStock.length === 0 && (
        <p className="empty">Nothing in stock right now. Check back soon.</p>
      )}
      <div className="container">
        {/* items that sell out leave, new ones pop in */}
        <AnimatePresence initial={false} mode="popLayout">
          {inStock.map((item) => (
            <m.div className="cell" key={item.id} {...listItem}>
              <BuyCard
                item={item}
                inCartNum={inCartNum(item.id)}
                onAdd={handleAdd}
                onChangeNum={handleChangeNum}
              />
            </m.div>
          ))}
        </AnimatePresence>
      </div>
    </Holder>
  );
};

// -----------------
// Styled component
// -----------------
// "Added" holds, then fades; the stepper fades in after it
const fadeOut = keyframes`
  0%, 70% { opacity: 1; }
  100% { opacity: 0; }
`;
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const Holder = styled.div`
  .container {
    position: relative; /* for the leaving item (popLayout) */
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(220px, 100%), 1fr));
    gap: var(--space-l);
  }
  /* the card fills its cell, so cards in a row stay the same height */
  .cell {
    display: grid;
  }

  .add-button {
    flex: 1;
    white-space: nowrap;

    /* "Added" is the inverse of "Add to cart": page colour fill, accent text.
       An inset outline instead of a border keeps the size the same. */
    &.added,
    &.added:hover {
      background-color: ${color.bg};
      color: ${color.primary};
      box-shadow: inset 0 0 0 2px ${color.primary};
    }
  }

  .MuiButton-startIcon:has(+ .added-label),
  .added-label {
    animation: ${fadeOut} ${ADDED_MS}ms ease forwards;
  }

  .stepper-in {
    animation: ${fadeIn} 0.25s ease;
  }

  .empty {
    color: ${color.fgMuted};
  }

  @media (prefers-reduced-motion: reduce) {
    .MuiButton-startIcon,
    .added-label,
    .stepper-in {
      animation: none;
    }
  }
`;

export default BuyHome;
