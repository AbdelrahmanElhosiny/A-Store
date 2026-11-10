import { OrderedItemStatus } from "../features/userSlice";

// Delivery is simulated from the time the order was placed:
// it ships after IN_DELIVERY_AFTER and arrives after DELIVERED_AFTER.
const IN_DELIVERY_AFTER = 15_000;
const DELIVERED_AFTER = 45_000;

type Status = "ordered" | "delivery" | "delivered";

const STEPS: { status: Status; label: string }[] = [
  { status: "ordered", label: "Ordered" },
  { status: "delivery", label: "In delivery" },
  { status: "delivered", label: "Delivered" },
];

const orderStatus = (orderedAt: number, now: number): Status => {
  const elapsed = now - orderedAt;
  if (elapsed >= DELIVERED_AFTER) return "delivered";
  if (elapsed >= IN_DELIVERY_AFTER) return "delivery";
  return "ordered";
};

// 0 to 1 along the status line. The steps are evenly spaced, so each
// stage fills its own half: packing 0 to 0.5, delivery 0.5 to 1.
const orderProgress = (orderedAt: number, now: number) => {
  const elapsed = now - orderedAt;
  if (elapsed <= 0) return 0;
  if (elapsed < IN_DELIVERY_AFTER) return (elapsed / IN_DELIVERY_AFTER) * 0.5;
  if (elapsed < DELIVERED_AFTER)
    return (
      0.5 +
      ((elapsed - IN_DELIVERY_AFTER) / (DELIVERED_AFTER - IN_DELIVERY_AFTER)) *
        0.5
    );
  return 1;
};

// seconds until the next step, rounded up
const secondsUntil = (orderedAt: number, step: number, now: number) =>
  Math.max(Math.ceil((orderedAt + step - now) / 1000), 0);

// "#3F9A1C": short enough to read out, from the uuid
const shortOrderId = (orderId: string) =>
  `#${orderId.replace(/-/g, "").slice(0, 6).toUpperCase()}`;

const formatTime = (time: number) =>
  new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

interface Order {
  orderId: string;
  orderedAt: number;
  lines: OrderedItemStatus[];
  units: number;
  total: number;
}

// order lines grouped into orders, newest first
const groupOrders = (lines: OrderedItemStatus[]): Order[] => {
  const orders = new Map<string, Order>();
  lines.forEach((line) => {
    const order = orders.get(line.orderId) ?? {
      orderId: line.orderId,
      orderedAt: line.orderedAt,
      lines: [],
      units: 0,
      total: 0,
    };
    order.lines.push(line);
    order.units += line.orderedNum;
    order.total += line.orderedNum * line.price;
    orders.set(line.orderId, order);
  });
  return [...orders.values()].sort((a, b) => b.orderedAt - a.orderedAt);
};

export type { Status, Order };
export {
  IN_DELIVERY_AFTER,
  DELIVERED_AFTER,
  STEPS,
  orderStatus,
  orderProgress,
  secondsUntil,
  shortOrderId,
  formatTime,
  groupOrders,
};
