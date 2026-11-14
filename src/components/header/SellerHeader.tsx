import { Suspense } from "react";
import { Link } from "react-router-dom";
import styled from "@emotion/styled";
import SVG from "../../assets/svg";
import { useAppSelector } from "../../app/hooks";
import { selectActiveStore } from "../../features/selectors";
import { ROUTES } from "../../constant/routes";
import { media } from "../../styles/breakpoints";
import ModeSwitch from "../ModeSwitch";
import HeaderSearch from "./HeaderSearch";
import AccountMenu from "./AccountMenu";
import { HeaderBar, truncate } from "./headerStyles";
import useHeaderLogin, { HeaderLoginDialog } from "./useHeaderLogin";

const SellerHeader: React.FC = () => {
  const store = useAppSelector(selectActiveStore);
  const { isLoginOpen, hasOpened, openLogin, closeLogin } = useHeaderLogin();
  return <>
    <Holder>
      <Link className="logo" to={ROUTES.seller} aria-label="A-Store seller centre home"><SVG.Icons.logo />Seller centre</Link>
      {store && <span className="truncate" title={store.name}>{store.name}</span>}
      {store ? <HeaderSearch mode="seller" /> : <span className="spacer" />}
      <ModeSwitch />
      <AccountMenu compact onLogIn={openLogin} />
    </Holder>
    {hasOpened && <Suspense fallback={null}><HeaderLoginDialog isOpen={isLoginOpen} onClose={closeLogin} /></Suspense>}
  </>;
};
const Holder = styled(HeaderBar)`
  display: flex;
  .truncate { ${truncate} max-width: 24ch; min-width: 0; flex-shrink: 2; }
  .spacer { flex: 1; }
  .logo, > .MuiButton-root { flex-shrink: 0; }
  ${media.narrow} { .truncate { max-width: 12ch; } }
`;
export default SellerHeader;
