import { describe, expect, it } from "vitest";
import { effectiveStatus, orderSummaryStatus } from "../shipmentStatus";
import { Order, Shipment, ShipmentStatus } from "../types";

const shipment = (status: ShipmentStatus, deliverAt?: number) =>
  ({ id: status, storeId: "s", lines: [], status, history: [], deliverAt, deliveryFee: 0 }) as Shipment;
const order = (...statuses: ShipmentStatus[]) =>
  ({ shipments: statuses.map((s) => shipment(s)) }) as Order;

describe("effectiveStatus", () => {
  it("turns shipped into delivered once deliverAt has passed", () => {
    expect(effectiveStatus(shipment("shipped", 1000), 999)).toBe("shipped");
    expect(effectiveStatus(shipment("shipped", 1000), 1000)).toBe("delivered");
  });

  it("keeps a shipped shipment with no deliverAt waiting", () =>
    expect(effectiveStatus(shipment("shipped"), 1e12)).toBe("shipped"));

  it("leaves other statuses alone", () =>
    expect(effectiveStatus(shipment("packed", 0), 1000)).toBe("packed"));
});

describe("orderSummaryStatus", () => {
  it("sums up the shipments", () => {
    expect(orderSummaryStatus(order("shipped", "placed"), 0)).toBe("partly-shipped");
    expect(orderSummaryStatus(order("packed", "placed"), 0)).toBe("in-progress");
    expect(orderSummaryStatus(order("placed", "placed"), 0)).toBe("placed");
    expect(orderSummaryStatus(order("shipped", "shipped"), 0)).toBe("shipped");
  });

  it("is delivered when every shipment that isn't cancelled is delivered", () => {
    expect(orderSummaryStatus(order("delivered", "cancelled"), 0)).toBe("delivered");
    expect(orderSummaryStatus(order("returned", "return-requested", "delivered"), 0)).toBe(
      "delivered",
    );
  });

  it("is cancelled only when every shipment is", () => {
    expect(orderSummaryStatus(order("cancelled", "cancelled"), 0)).toBe("cancelled");
    expect(orderSummaryStatus(order("cancelled", "placed"), 0)).toBe("placed");
  });

  it("uses the effective status (a delivery that's due counts)", () => {
    const o = { shipments: [shipment("shipped", 100), shipment("delivered")] } as Order;
    expect(orderSummaryStatus(o, 50)).toBe("shipped");
    expect(orderSummaryStatus(o, 100)).toBe("delivered");
  });
});
