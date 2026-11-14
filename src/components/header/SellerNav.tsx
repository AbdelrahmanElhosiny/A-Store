import { NavLink } from "react-router-dom";
import styled from "@emotion/styled";
import HomeOutlined from "@mui/icons-material/HomeOutlined";
import ReceiptLongOutlined from "@mui/icons-material/ReceiptLongOutlined";
import Inventory2Outlined from "@mui/icons-material/Inventory2Outlined";
import PeopleOutline from "@mui/icons-material/PeopleOutline";
import StorefrontOutlined from "@mui/icons-material/StorefrontOutlined";
import { useAppSelector } from "../../app/hooks";
import { selectActiveStore, selectToShipCount } from "../../features/selectors";
import { ROUTES } from "../../constant/routes";
import { color } from "../../styles/tokens";
import font from "../../styles/font";

const SellerNav: React.FC<{ onNavigate?: () => void }> = ({ onNavigate }) => {
  const store = useAppSelector(selectActiveStore);
  const count = useAppSelector((state) => selectToShipCount(state, store?.id ?? ""));
  const links = [
    { label: "Home", path: ROUTES.seller, icon: <HomeOutlined /> },
    { label: "Orders", path: ROUTES.sellerOrders, icon: <ReceiptLongOutlined /> },
    { label: "Products", path: ROUTES.sellerProducts, icon: <Inventory2Outlined /> },
    { label: "Customers", path: ROUTES.sellerCustomers, icon: <PeopleOutline /> },
    { label: "Store settings", path: ROUTES.sellerStore, icon: <StorefrontOutlined /> },
  ];
  return <Holder aria-label="Seller centre"><ul>
    {links.map(({ label, path, icon }) => <li key={path}>
      <NavLink to={path} end={path === ROUTES.seller} onClick={onNavigate}
        aria-label={label === "Orders" && count > 0 ? `Orders, ${count} open` : undefined}>
        {icon}<span>{label}</span>
        {label === "Orders" && count > 0 && <span className="badge" aria-hidden="true">{count}</span>}
      </NavLink>
    </li>)}
  </ul></Holder>;
};
const Holder = styled.nav`
  ${font.Bold}
  font-size: 0.875rem;
  ul { list-style: none; padding: var(--space-s) 0; margin: 0; }
  a {
    box-sizing: border-box;
    min-height: 44px;
    display: flex;
    align-items: center;
    gap: var(--space-s);
    padding: var(--space-s);
    border-left: 4px solid transparent;
    color: ${color.fg};
    text-decoration: none;
    &.active { border-left-color: ${color.primary}; background: ${color.bg2}; }
    &:hover { background: ${color.bg2}; }
    svg { flex-shrink: 0; }
  }
  .badge { margin-left: auto; padding: 2px 4px; background: ${color.primary}; color: ${color.bg}; }
`;
export default SellerNav;
