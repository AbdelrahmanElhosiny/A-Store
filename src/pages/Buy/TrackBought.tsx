import { Link } from "react-router-dom";
import styled from "@emotion/styled";
import { Button } from "@mui/material";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ProductThumb from "../../components/ProductThumb";
import EmptyState from "../../components/EmptyState";
import { ROUTE_INDEX } from "../../constant/routeConstant";
import useNow from "../../hooks/useNow";
import { color } from "../../styles/tokens";
import font from "../../styles/font";
import formatPrice from "../../utils/formatPrice";
import {
  DELIVERED_AFTER,
  IN_DELIVERY_AFTER,
  Order,
  STEPS,
  formatTime,
  groupOrders,
  orderProgress,
  orderStatus,
  secondsUntil,
  shortOrderId,
} from "../../utils/orders";
import useBuy from "./useBuy";
import useDocumentTitle from "../../hooks/useDocumentTitle";

// one line under the order's title, e.g. "In delivery · arrives in 12 s"
const statusText = ({ orderedAt }: Order, now: number) => {
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
  const { orderedItems } = useBuy();
  const orders = groupOrders(orderedItems);
  // the clock only ticks while something is still on its way
  const now = useNow(
    orders.some(({ orderedAt }) => Date.now() - orderedAt < DELIVERED_AFTER),
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
          <Button variant="contained" component={Link} to={ROUTE_INDEX.BUY}>
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
              const status = orderStatus(order.orderedAt, now);
              const currentStep = STEPS.findIndex(
                (step) => step.status === status,
              );
              return (
                <li className={`order ${status}`} key={order.orderId}>
                  <header className="order-head">
                    <div>
                      <h3>Order {shortOrderId(order.orderId)}</h3>
                      <span className="meta">
                        Placed at {formatTime(order.orderedAt)} · {order.units}{" "}
                        {order.units === 1 ? "item" : "items"} ·{" "}
                        {formatPrice(order.total)}
                      </span>
                    </div>
                    <span className="status-text">
                      {statusText(order, now)}
                    </span>
                    {/* screen readers hear the step changes, not every second */}
                    <span className="visually-hidden" aria-live="polite">
                      {`Order ${shortOrderId(order.orderId)}: ${STEPS[currentStep].label}`}
                    </span>
                  </header>

                  {/* status line: three evenly spaced steps, the bar fills between them */}
                  <div
                    className="progress"
                    style={
                      {
                        "--progress": orderProgress(order.orderedAt, now),
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
                    {order.lines.map((line) => (
                      <li className="line" key={line.itemId}>
                        <ProductThumb
                          className="thumb"
                          name={line.name}
                          image={line.image}
                        />
                        <span className="name">{line.name}</span>
                        <span className="qty">
                          {line.orderedNum} × {formatPrice(line.price)}
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
