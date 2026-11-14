import { Order, Shipment, ShipmentStatus } from "./types";

// a shipped parcel arrives this long after it ships
export const DELIVER_AFTER_MS = 30_000;
// a placed shipment the seller hasn't sent by then is late
export const LATE_AFTER_MS = 60_000;
// Auto-ship (demo) moves a shipment one step this often
export const AUTO_SHIP_STEP_MS = 20_000;

// Delivery isn't stored as an event: a shipped shipment reads as delivered
// once its time comes. Without a deliverAt it waits (seeded shipped orders).
export const effectiveStatus = (s: Shipment, now: number): ShipmentStatus =>
  s.status === "shipped" && s.deliverAt !== undefined && now >= s.deliverAt
    ? "delivered"
    : s.status;

export type OrderStatus =
  | "placed"
  | "in-progress"
  | "partly-shipped"
  | "shipped"
  | "delivered"
  | "cancelled";

// One status for the whole order. Cancelled shipments don't count unless
// every one is; a return happens after delivery, so it counts as delivered.
export const orderSummaryStatus = (o: Order, now: number): OrderStatus => {
  const statuses = o.shipments.map((s) => effectiveStatus(s, now));
  const live = statuses
    .filter((status) => status !== "cancelled")
    .map((status) =>
      status === "return-requested" || status === "returned"
        ? "delivered"
        : status,
    );
  if (statuses.length > 0 && live.length === 0) return "cancelled";

  const isSent = (status: ShipmentStatus) =>
    status === "shipped" || status === "delivered";
  if (live.every((status) => status === "delivered")) return "delivered";
  if (live.every(isSent)) return "shipped";
  if (live.some(isSent)) return "partly-shipped";
  if (live.every((status) => status === "placed")) return "placed";
  return "in-progress";
};
