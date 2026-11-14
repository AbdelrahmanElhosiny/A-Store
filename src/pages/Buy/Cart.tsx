import { useState } from "react";
import { Link } from "react-router-dom";
import styled from "@emotion/styled";
import { Button } from "@mui/material";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import CheckIcon from "@mui/icons-material/Check";
import CartStepper from "../../components/CartStepper";
import ProductThumb from "../../components/ProductThumb";
import EmptyState from "../../components/EmptyState";
import { BUY_ROUTE, ROUTE_INDEX } from "../../constant/routeConstant";
import { color } from "../../styles/tokens";
import font from "../../styles/font";
import formatPrice from "../../utils/formatPrice";
import useBuy from "./useBuy";
import { useAppSelector } from "../../app/hooks";
import { selectActiveBuyer } from "../../features/selectors";
import { Address, GUEST_ID } from "../../features/types";
import { AnimatePresence, m } from "motion/react";
import { listItem } from "../../styles/motion";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const TRACK_PATH = `${ROUTE_INDEX.BUY}/${BUY_ROUTE.TRACK_BOUGHT}`;

// a guest has no address yet; checkout asks for one from Phase D on
const GUEST_ADDRESS: Address = {
  id: GUEST_ID,
  label: "",
  name: "",
  line1: "",
  city: "",
  zipCode: "",
  phoneNum: "",
  isDefault: false,
};

// -----------------
// JSX
// -----------------
const Cart = () => {
  const { cartRows, setCartQuantity, placeOrder } = useBuy();
  const buyer = useAppSelector(selectActiveBuyer);
  const [placedOrderNumber, setPlacedOrderNumber] = useState<string | null>(
    null,
  );
  useDocumentTitle("Cart");

  const units = cartRows.reduce((sum, row) => sum + row.orderableNum, 0);
  const subtotal = cartRows.reduce(
    (sum, { item, orderableNum }) => sum + item.price * orderableNum,
    0,
  );

  const handleOrder = () => {
    const shipTo =
      buyer?.addresses.find(({ isDefault }) => isDefault) ?? GUEST_ADDRESS;
    const order = placeOrder({
      shipTo,
      payment: { kind: "cod", label: "Cash on delivery" },
    });
    if (order) setPlacedOrderNumber(order.number);
  };

  // nothing in the cart: either the order just went through, or it's empty
  if (cartRows.length === 0) {
    return (
      <Holder>
        <h2>Cart</h2>
        {placedOrderNumber ? (
          <EmptyState
            icon={<CheckIcon />}
            title={`Order ${placedOrderNumber} placed`}
            text="It ships in a few seconds. Follow it on Track Shipment."
          >
            <Button variant="contained" component={Link} to={TRACK_PATH}>
              Track shipment
            </Button>
            <Button variant="outlined" component={Link} to={ROUTE_INDEX.BUY}>
              Keep shopping
            </Button>
          </EmptyState>
        ) : (
          <EmptyState
            icon={<ShoppingCartOutlinedIcon />}
            title="Your cart is empty"
            text="Find something you like in the shop."
          >
            <Button variant="contained" component={Link} to={ROUTE_INDEX.BUY}>
              Browse the shop
            </Button>
          </EmptyState>
        )}
      </Holder>
    );
  }

  return (
    <Holder>
      <h2>Cart</h2>
      <div className="layout">
        <ul className="lines">
          {/* a removed line shrinks away and the ones below move up */}
          <AnimatePresence initial={false} mode="popLayout">
            {cartRows.map(({ item, quantity, orderableNum }) => (
              <m.li className="line" key={item.id} {...listItem()}>
                <ProductThumb
                  className="thumb"
                  name={item.name}
                  image={item.image}
                />
                <div className="info">
                  <h3 className="name">{item.name}</h3>
                  <span className="each">{formatPrice(item.price)} each</span>
                  {orderableNum < quantity && (
                    <span className="warning">
                      {item.stockNum > 0
                        ? `Only ${item.stockNum} in stock: ${orderableNum} will be ordered`
                        : "Sold out: won't be ordered"}
                    </span>
                  )}
                </div>
                <CartStepper
                  className="stepper"
                  itemName={item.name}
                  value={quantity}
                  max={Math.max(item.stockNum, quantity)}
                  onChange={(next) => setCartQuantity(item.id, next)}
                />
                <span className="line-total">
                  {formatPrice(item.price * orderableNum)}
                </span>
              </m.li>
            ))}
          </AnimatePresence>
        </ul>

        <aside className="summary" aria-label="Order summary">
          <h3>Summary</h3>
          <dl>
            <div>
              <dt>Items</dt>
              <dd>{units}</dd>
            </div>
            <div>
              <dt>Delivery</dt>
              <dd>Free</dd>
            </div>
            <div className="subtotal">
              <dt>Subtotal</dt>
              <dd>{formatPrice(subtotal)}</dd>
            </div>
          </dl>
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleOrder}
            disabled={units === 0}
          >
            Place order
          </Button>
          <p className="note">Demo store: no payment is taken.</p>
        </aside>
      </div>
    </Holder>
  );
};

// -----------------
// Styled component
// -----------------
const Holder = styled.div`
  .layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 300px;
    align-items: start;
    gap: var(--space-l);
  }

  /* -------- line items -------- */
  .lines {
    position: relative; /* for the leaving item (popLayout) */
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-m);
  }

  .line {
    display: grid;
    grid-template-columns: 112px minmax(0, 1fr) 200px 6em;
    grid-template-areas: "thumb info stepper total";
    align-items: center;
    gap: var(--space-m);
    padding: var(--space-m);
    background-color: ${color.bg1};
    border: 1px solid ${color.bg2};
  }

  .thumb {
    grid-area: thumb;
  }

  .info {
    grid-area: info;
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    min-width: 0;
  }

  .name {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 600;
    overflow-wrap: anywhere;
  }

  .each {
    ${font.Regular}
    font-size: 0.9rem;
    color: ${color.fgMuted};
  }

  .warning {
    font-size: 0.85rem;
    color: ${color.orange};
  }

  .stepper {
    grid-area: stepper;
  }

  .line-total {
    ${font.Bold}
    grid-area: total;
    text-align: right;
    font-size: 1.1rem;
  }

  /* -------- summary -------- */
  .summary {
    position: sticky;
    top: calc(var(--nav-height) + var(--space-m));
    display: flex;
    flex-direction: column;
    gap: var(--space-m);
    padding: var(--space-l);
    background-color: ${color.bg1};
    border: 1px solid ${color.bg2};
    box-shadow: var(--shadow-2);

    h3 {
      margin: 0;
    }
    dl {
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-s);
    }
    dl div {
      display: flex;
      justify-content: space-between;
      gap: var(--space-m);
    }
    dt {
      color: ${color.fgMuted};
    }
    dd {
      ${font.Bold}
      margin: 0;
    }
    .subtotal {
      padding-top: var(--space-s);
      border-top: 1px solid ${color.bg2};
      dt {
        color: ${color.fg};
        font-weight: 600;
      }
      dd {
        font-size: 1.35rem;
      }
    }
  }

  .note {
    margin: 0;
    font-size: 0.85rem;
    color: ${color.fgMuted};
    text-align: center;
  }

  /* tablets: summary under the lines */
  @media (max-width: 1023px) {
    .layout {
      grid-template-columns: minmax(0, 1fr);
    }
    .summary {
      position: static;
    }
  }

  /* phones: picture and name on top, stepper and total below them */
  @media (max-width: 599px) {
    .line {
      grid-template-columns: 88px minmax(0, 1fr) auto;
      grid-template-areas:
        "thumb info info"
        "stepper stepper total";
      gap: var(--space-m);
    }
  }
`;

export default Cart;
