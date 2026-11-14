import styled from "@emotion/styled";
import { Button } from "@mui/material";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { ROUTES } from "../../constant/routes";
import { logInAs } from "../../features/cartActions";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { color } from "../../styles/tokens";

const PickStore = () => {
  useDocumentTitle("Pick your store");
  const dispatch = useAppDispatch();
  const stores = useAppSelector((state) => state.stores);
  const items = useAppSelector((state) => state.items);

  return (
    <Holder>
      <h2>Pick your store</h2>
      <p>This is a demo: pick a store to run it, no password needed.</p>
      <div className="stores">
        {stores.map((store) => {
          const count = items.filter(({ storeId }) => storeId === store.id).length;
          return (
            <button key={store.id} type="button" aria-label={store.name} onClick={() => dispatch(logInAs("seller", store.ownerId))}>
              <span className="logo" style={{ backgroundColor: store.logoColor }} aria-hidden="true">{store.logoLetter}</span>
              <strong>{store.name}</strong>
              <span>{store.tagline}</span>
              <span>{count} {count === 1 ? "product" : "products"}</span>
            </button>
          );
        })}
      </div>
      <Button component={Link} to={ROUTES.sellerSignUp} variant="outlined">Create a store</Button>
    </Holder>
  );
};

const Holder = styled.div`
  .stores {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
    gap: var(--space-m);
    margin-block: var(--space-l);
  }
  .stores button {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-s);
    padding: var(--space-l);
    font: inherit;
    text-align: left;
    overflow-wrap: anywhere;
    color: ${color.fg};
    background: ${color.bg1};
    border: 1px solid ${color.bg2};
    border-radius: 0;
    cursor: pointer;
    &:hover, &:focus-visible { border-color: ${color.sell}; }
  }
  .logo {
    display: grid;
    place-items: center;
    width: 48px;
    height: 48px;
    color: ${color.bg};
    font-size: 1.5rem;
    font-weight: 700;
  }
`;

export default PickStore;
