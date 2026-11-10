import { useState } from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { Link } from "react-router-dom";
import { color } from "../styles/tokens";
import font from "../styles/font";
import SVG from "../assets/svg";
import ThemeSwitch from "../components/ThemeSwitch";
import { ROUTE_INDEX } from "../constant/routeConstant";
import sell640Avif from "../assets/home/sell-640.avif";
import sell1200Avif from "../assets/home/sell-1200.avif";
import sell640Webp from "../assets/home/sell-640.webp";
import sell1200Webp from "../assets/home/sell-1200.webp";
import buy640Avif from "../assets/home/buy-640.avif";
import buy1200Avif from "../assets/home/buy-1200.avif";
import buy640Webp from "../assets/home/buy-640.webp";
import buy1200Webp from "../assets/home/buy-1200.webp";
import useDocumentTitle from "../hooks/useDocumentTitle";

// each half is half the screen wide on desktop, full width on phones
const SIZES = "(max-width: 767px) 100vw, 50vw";

const sides = [
  {
    side: "sell",
    path: ROUTE_INDEX.SELL,
    label: "Sell",
    tagline: "List items, update stock, track what sold.",
    cta: "Start selling",
    avif: `${sell640Avif} 640w, ${sell1200Avif} 1200w`,
    webp: `${sell640Webp} 640w, ${sell1200Webp} 1200w`,
    fallback: sell640Webp,
  },
  {
    side: "buy",
    path: ROUTE_INDEX.BUY,
    label: "Buy",
    tagline: "Browse the shop, fill your cart, follow your order.",
    cta: "Start shopping",
    avif: `${buy640Avif} 640w, ${buy1200Avif} 1200w`,
    webp: `${buy640Webp} 640w, ${buy1200Webp} 1200w`,
    fallback: buy640Webp,
  },
];

// touch screens can't hover: there the first tap shows the hover state
// and the second tap opens the side
const TOUCH_QUERY = "(hover: none)";
const isTouchScreen = () => window.matchMedia?.(TOUCH_QUERY).matches ?? false;

// -----------------
// JSX
// -----------------
const HomePage = () => {
  useDocumentTitle();
  const [activeSide, setActiveSide] = useState<string | null>(null);

  const handleClick = (event: React.MouseEvent, side: string) => {
    // event.detail is 0 for Enter on a keyboard: open straight away
    if (event.detail === 0 || !isTouchScreen() || activeSide === side) return;
    event.preventDefault();
    setActiveSide(side);
  };

  return (
    <Holder>
      <header className="top-bar">
        <div className="brand">
          <SVG.Icons.logo />
          <span>A-Store</span>
        </div>
        <ThemeSwitch className="switch" />
      </header>

      <main className="sides">
        <h1 className="visually-hidden">A-Store: sell or buy</h1>
        {sides.map(
          ({ side, path, label, tagline, cta, avif, webp, fallback }) => (
            // the whole half is one link: no button inside a link
            <Link
              to={path}
              className={`side ${side}${activeSide === side ? " active" : ""}`}
              key={side}
              draggable={false}
              onClick={(event) => handleClick(event, side)}
            >
              <picture>
                <source type="image/avif" srcSet={avif} sizes={SIZES} />
                <source type="image/webp" srcSet={webp} sizes={SIZES} />
                <img
                  src={fallback}
                  alt=""
                  className="photo"
                  decoding="async"
                  draggable={false}
                />
              </picture>
              <div className="content">
                <span className="label">{label}</span>
                <span className="tagline">{tagline}</span>
                <span className="cta">
                  {cta} <span aria-hidden="true">→</span>
                </span>
              </div>
            </Link>
          ),
        )}
      </main>
    </Holder>
  );
};

// -----------------
// Styled component
// -----------------
// the "selected" look of a half: colour back, label lifted, CTA filled
const highlighted = css`
  .photo {
    filter: saturate(100%);
    transform: scale(1.04);
  }
  .label {
    transform: translate(-4px, -4px);
    box-shadow: var(--shadow-3);
  }
  .cta {
    background-color: var(--primary-color);
    color: ${color.bg};
    span {
      transform: translateX(4px);
    }
  }
`;

const Holder = styled.div`
  position: relative;
  height: 100vh;
  height: 100dvh;

  /* logo and theme switch float over the photos */
  .top-bar {
    user-select: none;
    position: absolute;
    inset: 0 0 auto;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-m) var(--page-gutter);
    pointer-events: none;

    .brand,
    .switch {
      pointer-events: auto;
      background-color: ${color.bg1};
      border: 1px solid ${color.bg2};
      box-shadow: var(--shadow-1);
      padding: var(--space-xs) var(--space-s);
    }

    .brand {
      ${font.Bold}
      display: flex;
      align-items: center;
      gap: var(--space-s);
      color: ${color.fg};
      svg {
        width: 2em;
      }
    }
  }

  .sides {
    display: grid;
    grid-template-columns: 1fr 1fr;
    height: 100%;
  }

  /* -------- one half -------- */
  .side {
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: flex-end;
    padding: var(--space-xxl) var(--page-gutter);
    text-decoration: none;
    color: ${color.fg};
    outline-offset: -6px;
    /* a tap or long press doesn't select the text or the photo */
    user-select: none;
    -webkit-user-drag: none;

    &.sell {
      --primary-color: ${color.sell};
    }
    &.buy {
      --primary-color: ${color.buy};
    }
  }

  .photo {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    /* long press acts on the link, not the photo */
    pointer-events: none;
    filter: saturate(0%) contrast(1.05);
    transform: scale(1);
    transition:
      filter 0.6s ease,
      transform 0.8s ease;
  }

  /* darkens the bottom so the text stays readable on any photo */
  .side::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 1;
    background: linear-gradient(to top, ${color.bg} 0%, transparent 70%);
    opacity: 0.85;
  }

  .content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-s);
    max-width: 26em;
  }

  .label {
    ${font.ItalicBold}
    font-size: clamp(2.6rem, 7vw, 5rem);
    line-height: 1;
    background-color: var(--primary-color);
    color: ${color.bg};
    padding: 0.1em 0.35em 0.15em;
    box-shadow: var(--shadow-2);
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;
  }

  .tagline {
    font-size: clamp(1rem, 2.2vw, 1.2rem);
    font-weight: 500;
    background-color: ${color.bg};
    padding: var(--space-xs) var(--space-s);
  }

  .cta {
    ${font.Bold}
    background-color: ${color.bg1};
    border: 2px solid var(--primary-color);
    padding: var(--space-s) var(--space-m);
    transition:
      background-color 0.3s ease,
      color 0.3s ease;

    span {
      display: inline-block;
      transition: transform 0.3s ease;
    }
  }

  /* hover, keyboard focus and the first tap on touch screens:
     colour comes back, the label lifts.
     :hover only where a real pointer hovers, so a tap doesn't leave it stuck */
  @media (hover: hover) {
    .side:hover {
      ${highlighted}
    }
  }
  .side.active,
  .side:focus-visible {
    ${highlighted}
  }

  /* phones: Sell on top, Buy below */
  @media (max-width: 767px) {
    .sides {
      grid-template-columns: 1fr;
      grid-template-rows: 1fr 1fr;
    }
    .side {
      padding: var(--space-l) var(--page-gutter);
    }
    .side.sell {
      padding-top: calc(var(--space-l) + 56px);
    }
    .content {
      gap: var(--space-xs);
    }
    .tagline {
      font-size: 0.95rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .photo,
    .label,
    .cta,
    .cta span {
      transition: none;
    }
    .side:hover .photo,
    .side.active .photo,
    .side:focus-visible .photo {
      transform: none;
    }
  }
`;

export default HomePage;
