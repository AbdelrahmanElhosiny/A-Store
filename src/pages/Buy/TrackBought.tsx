import { Link } from "react-router-dom";
import styled from "@emotion/styled";
import { Button } from "@mui/material";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ProductThumb from "../../components/ProductThumb";
import EmptyState from "../../components/EmptyState";
import { ROUTES } from "../../constant/routes";
import useNow from "../../hooks/useNow";
import { color } from "../../styles/tokens";
import font from "../../styles/font";
import formatPrice from "../../utils/formatPrice";
import {
  DELIVERED_AFTER,
  IN_DELIVERY_AFTER,
  STEPS,
  formatTime,
  orderProgress,
  orderStatus,
  secondsUntil,
} from "../../utils/orders";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { useAppSelector } from "../../app/hooks";
import { lineKey } from "../../features/cart";
import { selectOrdersForBuyer } from "../../features/selectors";
import { GUEST_ID } from "../../features/types";

// one line under the order's title, e.g. "In delivery · arrives in 12 s"
// (the status still comes from the clock; sellers move it from Phase D on)
const statusText = (orderedAt: number, now: number) => {
  const status = orderStatus(orderedAt, now);
  if (status === "ordered")
    return `Packing · ships in ${secondsUntil(orderedAt, IN_DELIVERY_AFTER, now)} s`;
  if (status === "delivery")
    return `On its way · arrives in ${secondsUntil(orderedAt, DELIVERED_AFTER, now)} s`;
  return `Delivered at ${formatTime(orderedAt + DELIVERED_AFTER)}`;
};

// -----------------
// JSX
// -----------------
const TrackBought = () => {
  useDocumentTitle("Track shipment");
  const buyerId = useAppSelector((state) => state.session.buyerId);
  const orders = useAppSelector((state) =>
    selectOrdersForBuyer(state, buyerId ?? GUEST_ID),
  );
  // the clock only ticks while something is still on its way
  const now = useNow(
    orders.some(({ placedAt }) => Date.now() - placedAt < DELIVERED_AFTER),
  );

  return (
    <Holder>
      <h2>Track shipment</h2>

      {orders.length === 0 ? (
        <EmptyState
          icon={<LocalShippingOutlinedIcon />}
          title="No orders yet"
          text="When you place an order, you can follow it here."
        >
          <Button variant="contained" component={Link} to={ROUTES.home}>
            Browse the shop
          </Button>
        </EmptyState>
      ) : (
        <>
          <p className="intro">
            Delivery is simulated: an order ships after{" "}
            {IN_DELIVERY_AFTER / 1000} seconds and arrives after{" "}
            {DELIVERED_AFTER / 1000}.
          </p>
          <ol className="orders">
            {orders.map((order) => {
              const lines = order.shipments.flatMap((shipment) => shipment.lines);
              const units = lines.reduce((sum, line) => sum + line.quantity, 0);
              const total = lines.reduce(
                (sum, line) => sum + line.quantity * line.price,
                0,
              );
              const status = orderStatus(order.placedAt, now);
              const currentStep = STEPS.findIndex(
                (step) => step.status === status,
              );
              return (
                <li className={`order ${status}`} key={order.id}>
                  <header className="order-head">
                    <div>
                      <h3>Order {order.number}</h3>
                      <span className="meta">
                        Placed at {formatTime(order.placedAt)} · {units}{" "}
                        {units === 1 ? "item" : "items"} · {formatPrice(total)}
                      </span>
                    </div>
                    <span className="status-text">
                      {statusText(order.placedAt, now)}
                    </span>
                    {/* screen readers hear the step changes, not every second */}
                    <span className="visually-hidden" aria-live="polite">
                      {`Order ${order.number}: ${STEPS[currentStep].label}`}
                    </span>
                  </header>

                  {/* status line: three evenly spaced steps, the bar fills between them */}
                  <div
                    className="progress"
                    style={
                      {
                        "--progress": orderProgress(order.placedAt, now),
                      } as React.CSSProperties
                    }
                  >
                    <div className="track" aria-hidden="true">
                      <div className="fill" />
                    </div>
                    <ol className="steps" aria-label="Delivery status">
                      {STEPS.map((step, index) => (
                        <li
                          key={step.status}
                          className={index <= currentStep ? "done" : ""}
                          style={
                            {
                              "--at": index / (STEPS.length - 1),
                            } as React.CSSProperties
                          }
                          aria-current={
                            index === currentStep ? "step" : undefined
                          }
                        >
                          <span className="marker" aria-hidden="true" />
                          <span className="step-label">{step.label}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <ul className="lines">
                    {lines.map((line) => (
                      <li className="line" key={lineKey(line)}>
                        <ProductThumb
                          className="thumb"
                          name={line.name}
                          image={line.image}
                        />
                        <span className="name">{line.name}</span>
                        <span className="qty">
                          {line.quantity} × {formatPrice(line.price)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </Holder>
  );
};

// -----------------
// Styled component
// -----------------
const Holder = styled.div`
  .intro {
    margin: 0 0 var(--space-l);
    color: ${color.fgMuted};
  }

  .orders {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-l);
    max-width: 800px;
  }

  .order {
    display: flex;
    flex-direction: column;
    gap: var(--space-l);
    padding: var(--space-l);
    background-color: ${color.bg1};
    border: 1px solid ${color.bg2};
  }

  .order-head {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--space-s) var(--space-m);

    h3 {
      ${font.Bold}
      margin: 0;
      font-size: 1.15rem;
    }
  }

  .meta {
    font-size: 0.9rem;
    color: ${color.fgMuted};
  }

  .status-text {
    ${font.Bold}
    font-size: 0.9rem;
    color: ${color.primary};
  }
  .order.delivered .status-text {
    color: ${color.green};
  }

  /* -------- status line -------- */
  .progress {
    position: relative;
    padding-top: 6px;
  }

  .track {
    height: 4px;
    background-color: ${color.bg2};

    .fill {
      height: 100%;
      width: calc(var(--progress) * 100%);
      background-color: ${color.primary};
      transition: width 1s linear;
    }
  }
  .order.delivered .fill {
    background-color: ${color.green};
  }

  .steps {
    list-style: none;
    margin: 0;
    padding: 0;
    position: relative;
    height: 2.4em;

    li {
      position: absolute;
      top: 0;
      left: calc(var(--at) * 100%);
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    /* the first and last labels stay inside the box */
    li:first-of-type {
      transform: none;
      align-items: flex-start;
    }
    li:last-of-type {
      transform: translateX(-100%);
      align-items: flex-end;
    }
  }

  .marker {
    width: 14px;
    height: 14px;
    /* centred on the 4px bar above */
    margin-top: -9px;
    background-color: ${color.bg1};
    border: 2px solid ${color.bg2};
  }
  li.done .marker {
    background-color: ${color.primary};
    border-color: ${color.primary};
  }
  .order.delivered li.done .marker {
    background-color: ${color.green};
    border-color: ${color.green};
  }

  .step-label {
    ${font.Bold}
    margin-top: var(--space-xs);
    font-size: 0.8rem;
    white-space: nowrap;
    color: ${color.fgMuted};
  }
  li[aria-current="step"] .step-label {
    color: ${color.fg};
  }

  /* -------- items in the order -------- */
  .lines {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-s);
  }

  .line {
    display: grid;
    grid-template-columns: 64px minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--space-m);
  }

  .name {
    overflow-wrap: anywhere;
  }

  .qty {
    ${font.Bold}
    font-size: 0.95rem;
  }

  @media (max-width: 599px) {
    .order {
      padding: var(--space-m);
    }
    .line {
      grid-template-columns: 56px minmax(0, 1fr) auto;
      gap: var(--space-s);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .track .fill {
      transition: none;
    }
  }
`;

export default TrackBought;
