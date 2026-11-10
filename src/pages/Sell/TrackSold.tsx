import styled from "@emotion/styled";
import ProductThumb from "../../components/ProductThumb";
import { color } from "../../styles/tokens";
import font from "../../styles/font";
import formatPrice from "../../utils/formatPrice";
import { LOW_STOCK } from "../../constant/stockConstant";
import useSell from "./useSell";

interface SoldRow {
  itemId: string;
  name: string;
  image?: string;
  soldNum: number;
  revenue: number; // at the price each order paid
  stockNum: number | null; // null when the item is no longer listed
}

// -----------------
// JSX
// -----------------
const TrackSold = () => {
  const { items, soldLines } = useSell();

  // one row per listed item (sold or not), plus removed items that sold
  const rows = new Map<string, SoldRow>(
    items.map(({ id, name, image, stockNum }) => [
      id,
      { itemId: id, name, image, soldNum: 0, revenue: 0, stockNum },
    ]),
  );
  soldLines.forEach(({ itemId, name, image, orderedNum, price }) => {
    const row = rows.get(itemId) ?? {
      itemId,
      name,
      image,
      soldNum: 0,
      revenue: 0,
      stockNum: null,
    };
    row.soldNum += orderedNum;
    row.revenue += orderedNum * price;
    rows.set(itemId, row);
  });
  const sortedRows = [...rows.values()].sort(
    (a, b) => b.soldNum - a.soldNum || a.name.localeCompare(b.name),
  );

  const totalSold = soldLines.reduce((sum, line) => sum + line.orderedNum, 0);
  const totalRevenue = soldLines.reduce(
    (sum, line) => sum + line.orderedNum * line.price,
    0,
  );
  const orderCount = new Set(soldLines.map(({ orderId }) => orderId)).size;

  return (
    <Holder>
      <h2>Sold items</h2>
      <p className="summary">
        {totalSold === 0 ? (
          "Nothing sold yet. Sales show up here when buyers place orders."
        ) : (
          <>
            <strong>{totalSold}</strong> {totalSold === 1 ? "unit" : "units"}{" "}
            sold in <strong>{orderCount}</strong>{" "}
            {orderCount === 1 ? "order" : "orders"} ·{" "}
            <strong>{formatPrice(totalRevenue)}</strong> revenue
          </>
        )}
      </p>

      <ul className="rows">
        {sortedRows.map((row) => (
          <li
            className={`row${row.soldNum === 0 ? " unsold" : ""}`}
            key={row.itemId}
          >
            <ProductThumb className="thumb" name={row.name} image={row.image} />
            <div className="info">
              <span className="name">{row.name}</span>
              {row.stockNum === null ? (
                <span className="stock removed">No longer listed</span>
              ) : (
                <span
                  className={`stock${row.stockNum === 0 ? " out" : row.stockNum <= LOW_STOCK ? " low" : ""}`}
                >
                  {row.stockNum === 0
                    ? "Sold out"
                    : `${row.stockNum} left in stock`}
                </span>
              )}
            </div>
            <div className="figure sold">
              <span className="value">{row.soldNum}</span>
              <span className="label">sold</span>
            </div>
            <div className="figure revenue">
              <span className="value">{formatPrice(row.revenue)}</span>
              <span className="label">revenue</span>
            </div>
          </li>
        ))}
      </ul>
    </Holder>
  );
};

// -----------------
// Styled component
// -----------------
const Holder = styled.div`
  .summary {
    margin: 0 0 var(--space-l);
    color: ${color.fgMuted};

    strong {
      ${font.Bold}
      color: ${color.fg};
    }
  }

  .rows {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-s);
    max-width: 800px;
  }

  .row {
    display: grid;
    grid-template-columns: 80px minmax(0, 1fr) 5em 7em;
    align-items: center;
    gap: var(--space-m);
    padding: var(--space-s) var(--space-m) var(--space-s) var(--space-s);
    background-color: ${color.bg1};
    border: 1px solid ${color.bg2};
    /* the sell colour marks items that sold */
    border-left: 4px solid ${color.primary};

    &.unsold {
      border-left-color: ${color.bg2};
      .figure .value {
        color: ${color.fgMuted};
      }
    }
  }

  .info {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    min-width: 0;
  }

  .name {
    font-weight: 600;
    overflow-wrap: anywhere;
  }

  .stock {
    font-size: 0.85rem;
    color: ${color.fgMuted};
    &.low {
      color: ${color.orange};
    }
    &.out {
      color: ${color.red};
    }
    &.removed {
      font-style: italic;
    }
  }

  .figure {
    display: flex;
    flex-direction: column;
    align-items: flex-end;

    .value {
      ${font.Bold}
      font-size: 1.2rem;
    }
    .label {
      font-size: 0.8rem;
      color: ${color.fgMuted};
    }
  }

  /* phones: figures move under the name */
  @media (max-width: 599px) {
    .row {
      grid-template-columns: 64px minmax(0, 1fr) auto;
      grid-template-areas:
        "thumb info info"
        "thumb sold revenue";
      gap: var(--space-xs) var(--space-m);
    }
    .thumb {
      grid-area: thumb;
    }
    .info {
      grid-area: info;
    }
    .sold {
      grid-area: sold;
    }
    .revenue {
      grid-area: revenue;
    }
    .figure {
      flex-direction: row;
      align-items: baseline;
      gap: var(--space-xs);
      .value {
        font-size: 1rem;
      }
    }
    .sold {
      justify-self: start;
    }
  }
`;

export default TrackSold;
