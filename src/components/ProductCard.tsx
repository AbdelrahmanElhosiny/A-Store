import { useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import { Item } from "../features/itemSlice";
import { color } from "../styles/tokens";
import font from "../styles/font";
import formatPrice from "../utils/formatPrice";
import { LOW_STOCK } from "../constant/stockConstant";

interface Props {
  item: Item;
  children?: React.ReactNode; // the buttons at the bottom of the card
  // the first cards are on screen right away: load their pictures first
  isPriority?: boolean;
}

const stockInfo = (stockNum: number) => {
  if (stockNum <= 0) return { label: "Sold out", level: "out" };
  if (stockNum <= LOW_STOCK)
    return { label: `Only ${stockNum} left`, level: "low" };
  return { label: `${stockNum} in stock`, level: "ok" };
};

// -----------------
// JSX
// -----------------
// One product: picture, name, description, price and stock.
// Buy and Sell pass their own buttons as children.
const ProductCard: React.FC<Props> = ({
  item,
  children,
  isPriority = false,
}) => {
  const { name, description, price, stockNum, image } = item;
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const stock = stockInfo(stockNum);

  // a cached picture can finish before React sees the load event
  useEffect(() => {
    setIsLoaded(!!imgRef.current?.complete);
    setHasFailed(false);
  }, [image]);

  const showImage = image && !hasFailed;

  return (
    <Holder>
      <div className={`frame${showImage && !isLoaded ? " loading" : ""}`}>
        {showImage ? (
          <img
            ref={imgRef}
            src={image}
            alt=""
            loading={isPriority ? "eager" : "lazy"}
            decoding="async"
            // lowercase: React 18 doesn't know fetchPriority yet
            {...{ fetchpriority: isPriority ? "high" : "auto" }}
            draggable={false}
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasFailed(true)}
          />
        ) : (
          // no picture (or it failed to load): the first letter
          <span className="placeholder" aria-hidden="true">
            {name.trim().charAt(0).toUpperCase() || "?"}
          </span>
        )}
        <span className={`stock ${stock.level}`}>{stock.label}</span>
      </div>

      <div className="body">
        <h3 className="name">{name}</h3>
        <p className="description">{description}</p>
        <div className="price">{formatPrice(price)}</div>
        {children && <div className="actions">{children}</div>}
      </div>
    </Holder>
  );
};

// -----------------
// Styled component
// -----------------
const shimmer = keyframes`
  from {
    background-position: 100% 0;
  }
  to {
    background-position: -150% 0;
  }
`;

const Holder = styled.article`
  display: flex;
  flex-direction: column;
  min-width: 0;
  background-color: ${color.bg1};
  border: 1px solid ${color.bg2};
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  @media (hover: hover) {
    &:hover {
      transform: translate(-2px, -2px);
      box-shadow: var(--shadow-2);
    }
  }

  /* -------- picture -------- */
  .frame {
    position: relative;
    aspect-ratio: 4 / 3;
    overflow: hidden;
    background-color: ${color.bg2};
    border-bottom: 1px solid ${color.bg2};

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: opacity 0.3s ease;
    }

    /* skeleton while the picture loads */
    &.loading {
      background-image: linear-gradient(
        100deg,
        transparent 30%,
        ${color.bg1} 50%,
        transparent 70%
      );
      background-size: 250% 100%;
      animation: ${shimmer} 1.4s linear infinite;
      img {
        opacity: 0;
      }
    }
  }

  .placeholder {
    ${font.ItalicBold}
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    font-size: 4rem;
    color: ${color.primary};
  }

  /* -------- stock chip on the picture -------- */
  .stock {
    ${font.Bold}
    position: absolute;
    top: var(--space-s);
    left: var(--space-s);
    font-size: 0.8rem;
    padding: 2px var(--space-s);
    background-color: ${color.bg};
    color: ${color.fg};
    border: 1px solid ${color.bg2};
    box-shadow: var(--shadow-1);

    &.low {
      background-color: ${color.orange};
      border-color: ${color.orange};
      color: ${color.bg};
    }
    &.out {
      background-color: ${color.red};
      border-color: ${color.red};
      color: ${color.bg};
    }
  }

  /* -------- text -------- */
  .body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    padding: var(--space-m);
  }

  .name {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    line-height: 1.25;
    overflow-wrap: anywhere;
  }

  .description {
    margin: 0;
    color: ${color.fgMuted};
    font-size: 0.95rem;
    line-height: 1.4;
    overflow-wrap: anywhere;
    /* two lines at most, so the cards in a row line up */
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .price {
    ${font.Bold}
    font-size: 1.35rem;
    margin-top: var(--space-xs);
  }

  /* buttons sit at the bottom even when the text is short */
  .actions {
    margin-top: auto;
    padding-top: var(--space-s);
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-s);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    .frame.loading {
      animation: none;
    }
    .frame img {
      transition: none;
    }
  }
`;

export default ProductCard;
