import {
  BuyerAccount,
  Item,
  Order,
  OrderLine,
  Shipment,
  ShipmentStatus,
} from "../features/types";

// The past orders of the starter world. Every time is an offset from "now",
// so the seed never ages. Seed orders don't lower stock: the stock in
// catalogue.ts is the stock now.

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
// a shipment moves one step this often, starting when the order is placed
const STEP_MS = 6 * HOUR_MS;

const STORE_IDS: Record<string, string> = {
  tt: "store-tick-tock",
  cc: "store-carry-co",
  ps: "store-pocket-signal",
  hl: "store-hearth-lane",
};

const STEPS: ShipmentStatus[] = ["placed", "packed", "shipped", "delivered"];

interface SeedShipment {
  store: keyof typeof STORE_IDS;
  lines: [itemId: string, quantity: number][];
  status: "placed" | "packed" | "shipped" | "delivered";
  // set for shipments that have left the store (shipped and delivered)
  carrier?: string;
  trackingNo?: string;
}

interface SeedOrder {
  number: string;
  buyerId: string;
  ago: number; // ms before "now"
  shipments: SeedShipment[];
}

const NILE = "Nile Express";
const DELTA = "Delta Post";

const SEED_ORDERS: SeedOrder[] = [
  {
    number: "A-10001",
    buyerId: "acc-ahmed",
    ago: 25 * DAY_MS,
    shipments: [
      {
        store: "tt",
        lines: [["item-tt-field-watch-38-mm", 1]],
        status: "delivered",
        carrier: NILE,
        trackingNo: "NE482915063",
      },
    ],
  },
  {
    number: "A-10002",
    buyerId: "acc-omar",
    ago: 22 * DAY_MS,
    shipments: [
      {
        store: "cc",
        lines: [["item-cc-canvas-tote", 2]],
        status: "delivered",
        carrier: DELTA,
        trackingNo: "DP730184952",
      },
      {
        store: "hl",
        lines: [["item-hl-ceramic-mug", 4]],
        status: "delivered",
        carrier: NILE,
        trackingNo: "NE915260378",
      },
    ],
  },
  {
    number: "A-10003",
    buyerId: "acc-nour",
    ago: 20 * DAY_MS,
    shipments: [
      {
        store: "ps",
        lines: [["item-ps-wireless-earbuds", 1]],
        status: "delivered",
        carrier: DELTA,
        trackingNo: "DP264071839",
      },
    ],
  },
  {
    number: "A-10004",
    buyerId: "acc-ahmed",
    ago: 16 * DAY_MS,
    shipments: [
      {
        store: "ps",
        lines: [["item-ps-clear-phone-case", 2]],
        status: "delivered",
        carrier: NILE,
        trackingNo: "NE603847215",
      },
      {
        store: "cc",
        lines: [["item-cc-leather-wallet", 1]],
        status: "delivered",
        carrier: DELTA,
        trackingNo: "DP158392604",
      },
    ],
  },
  {
    number: "A-10005",
    buyerId: "acc-omar",
    ago: 12 * DAY_MS,
    shipments: [
      {
        store: "tt",
        lines: [["item-tt-minimal-quartz-watch", 1]],
        status: "delivered",
        carrier: NILE,
        trackingNo: "NE397026481",
      },
    ],
  },
  {
    number: "A-10006",
    buyerId: "acc-nour",
    ago: 9 * DAY_MS,
    shipments: [
      {
        store: "hl",
        lines: [
          ["item-hl-pour-over-coffee-set", 1],
          ["item-hl-desk-lamp", 1],
        ],
        status: "delivered",
        carrier: DELTA,
        trackingNo: "DP842150697",
      },
    ],
  },
  {
    number: "A-10007",
    buyerId: "acc-ahmed",
    ago: 6 * DAY_MS,
    shipments: [
      {
        store: "cc",
        lines: [["item-cc-city-backpack", 1]],
        status: "delivered",
        carrier: NILE,
        trackingNo: "NE571309846",
      },
    ],
  },
  {
    number: "A-10008",
    buyerId: "acc-omar",
    ago: 4 * DAY_MS,
    shipments: [
      {
        store: "ps",
        lines: [["item-ps-budget-smartphone-128-gb", 1]],
        status: "shipped",
        carrier: DELTA,
        trackingNo: "DP219486037",
      },
      {
        store: "tt",
        lines: [["item-tt-leather-watch-strap-20-mm", 2]],
        status: "delivered",
        carrier: NILE,
        trackingNo: "NE860317592",
      },
    ],
  },
  {
    number: "A-10009",
    buyerId: "acc-nour",
    ago: 3 * DAY_MS,
    shipments: [
      {
        store: "tt",
        lines: [["item-tt-diver-watch-steel", 1]],
        status: "shipped",
        carrier: DELTA,
        trackingNo: "DP405782913",
      },
    ],
  },
  {
    number: "A-10010",
    buyerId: "acc-ahmed",
    ago: 2 * DAY_MS,
    shipments: [
      {
        store: "hl",
        lines: [["item-hl-cast-iron-skillet-26-cm", 1]],
        status: "packed",
      },
    ],
  },
  {
    number: "A-10011",
    buyerId: "acc-omar",
    ago: 1 * DAY_MS,
    shipments: [
      {
        store: "cc",
        lines: [["item-cc-crossbody-sling", 1]],
        status: "placed",
      },
      {
        store: "hl",
        lines: [["item-hl-scented-candle", 2]],
        status: "packed",
      },
    ],
  },
  {
    number: "A-10012",
    buyerId: "acc-nour",
    ago: 6 * HOUR_MS,
    shipments: [
      {
        store: "tt",
        lines: [["item-tt-smart-watch", 1]],
        status: "placed",
      },
      {
        store: "ps",
        lines: [["item-ps-power-bank-10-000-mah", 1]],
        status: "placed",
      },
    ],
  },
  {
    number: "A-10013",
    buyerId: "acc-ahmed",
    ago: 2 * HOUR_MS,
    shipments: [
      {
        store: "tt",
        lines: [["item-tt-kids-digital-watch", 2]],
        status: "placed",
      },
    ],
  },
];

// The buyer's default address and payment method are the ones each order
// used. Lines copy the item's name, price and picture, as a real order does.
export const buildSeedOrders = (
  now: number,
  items: Item[],
  buyers: BuyerAccount[],
): Order[] =>
  SEED_ORDERS.map(({ number, buyerId, ago, shipments }) => {
    const buyer = buyers.find(({ id }) => id === buyerId);
    if (!buyer) throw new Error(`Seed order ${number}: no buyer ${buyerId}`);
    const address = buyer.addresses.find(({ isDefault }) => isDefault)!;
    const method = buyer.paymentMethods.find(({ isDefault }) => isDefault)!;
    const placedAt = now - ago;

    const built: Shipment[] = shipments.map((row) => {
      const lines: OrderLine[] = row.lines.map(([itemId, quantity]) => {
        const item = items.find(({ id }) => id === itemId);
        if (!item) throw new Error(`Seed order ${number}: no item ${itemId}`);
        return {
          itemId,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity,
        };
      });
      const steps = STEPS.slice(0, STEPS.indexOf(row.status) + 1);
      const shipment: Shipment = {
        id: `ship-${number}-${row.store}`,
        storeId: STORE_IDS[row.store],
        lines,
        status: row.status,
        history: steps.map((status, index) => ({
          status,
          at: placedAt + index * STEP_MS,
        })),
        deliveryFee: 0,
      };
      if (row.carrier) shipment.carrier = row.carrier;
      if (row.trackingNo) shipment.trackingNo = row.trackingNo;
      return shipment;
    });

    return {
      id: `order-${number}`,
      number,
      buyerId,
      placedAt,
      shipTo: { ...address },
      payment: {
        kind: method.kind,
        label:
          method.kind === "cod"
            ? "Cash on delivery"
            : `${method.brand === "visa" ? "Visa" : "Mastercard"} ending ${method.last4}`,
      },
      shipments: built,
      isSeed: true,
    };
  });
