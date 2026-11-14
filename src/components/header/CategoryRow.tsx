import styled from "@emotion/styled";
import { Link, NavLink } from "react-router-dom";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import { useAppSelector } from "../../app/hooks";
import { CATEGORIES } from "../../constant/categories";
import { ROUTES } from "../../constant/routes";
import { selectDefaultAddress } from "../../features/selectors";
import { media } from "../../styles/breakpoints";
import { NAV_ROW } from "../../styles/navHeight";
import { color } from "../../styles/tokens";
import font from "../../styles/font";
import { linkStyle } from "./headerStyles";

const CategoryRow: React.FC = () => {
  const address = useAppSelector(selectDefaultAddress);
  return (
    <Holder>
      <nav aria-label="Categories">
        <NavLink className="link" to={ROUTES.search()}>All categories</NavLink>
        {CATEGORIES.map(({ id, label }) => <NavLink className="link" key={id} to={ROUTES.category(id)}>{label}</NavLink>)}
      </nav>
      {address?.city && <Link className="ship-to" to={ROUTES.accountAddresses}>
        <LocationOnOutlined />Ship to {address.city}
      </Link>}
    </Holder>
  );
};
const Holder = styled.div`
  ${font.Bold}
  ${linkStyle}
  box-sizing: border-box;
  height: ${NAV_ROW.categories}px;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-m);
  padding-inline: var(--page-gutter);
  background: ${color.bg};
  border-bottom: 1px solid ${color.bg2};
  font-size: 0.875rem;
  nav {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: var(--space-m);
    overflow-x: auto;
    white-space: nowrap;
    height: 100%;
  }
  .ship-to {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    white-space: nowrap;
    color: ${color.fg};
    text-decoration-color: ${color.primary};
  }
  ${media.narrow} {
    nav { gap: var(--space-s); }
    .ship-to { display: none; }
  }
`;
export default CategoryRow;
