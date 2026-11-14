import { useEffect, useId, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "@emotion/styled";
import { IconButton } from "@mui/material";
import Search from "@mui/icons-material/Search";
import { CATEGORIES, CategoryId } from "../../constant/categories";
import { ROUTES } from "../../constant/routes";
import { color } from "../../styles/tokens";
import { media } from "../../styles/breakpoints";
import { SearchScope, sellerSearchPath, storeSearchPath } from "./searchPaths";

// The category the current page is about: /c/<id> or /search?category=<id>.
const routeCategory = (pathname: string, search: string): CategoryId | null => {
  const path = pathname.toLowerCase().replace(/\/+$/, "");
  const param = path === ROUTES.search() ? new URLSearchParams(search).get("category") : null;
  return CATEGORIES.find(({ id }) => ROUTES.category(id) === path || id === param)?.id ?? null;
};

const HeaderSearch: React.FC<{ mode: "buyer" | "seller"; showScope?: boolean; className?: string }> = ({ mode, showScope = true, className }) => {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const scopeId = useId();
  const [query, setQuery] = useState("");
  useEffect(() => {
    const onSearch = pathname.toLowerCase().replace(/\/+$/, "") === ROUTES.search();
    setQuery(onSearch ? new URLSearchParams(search).get("q") ?? "" : "");
  }, [pathname, search]);
  const [scope, setScope] = useState<SearchScope>("all");
  const buyer = mode === "buyer";

  // A category page sets the scope; a picked scope stays until the route
  // leaves a category page, then it resets to "all".
  const category = routeCategory(pathname, search);
  const lastCategory = useRef<CategoryId | null>(null);
  useEffect(() => {
    if (category) setScope(category);
    else if (lastCategory.current) setScope("all");
    lastCategory.current = category;
  }, [category]);

  return (
    <Holder role="search" className={className} onSubmit={(event) => {
      event.preventDefault();
      const path = buyer ? storeSearchPath(query, showScope ? scope : "all") : sellerSearchPath(query);
      if (path) navigate(path);
    }}>
      <input type="search" aria-label={buyer ? "Search A-Store" : "Search orders and products"}
        placeholder={buyer ? "Search products and stores" : "Order number, buyer or product"}
        value={query} onChange={(event) => setQuery(event.target.value)} />
      {buyer && showScope && <>
        <label htmlFor={scopeId} className="visually-hidden">Search in</label>
        <select id={scopeId} value={scope} onChange={(event) => setScope(event.target.value as SearchScope)}>
          <option value="all">All categories</option>
          {CATEGORIES.map(({ id, label }) => <option key={id} value={id}>{label}</option>)}
        </select>
      </>}
      <IconButton type="submit" aria-label="Search"><Search /></IconButton>
    </Holder>
  );
};

const Holder = styled.form`
  flex: 1;
  width: 100%;
  min-width: 0;
  max-width: 640px;
  height: 40px;
  box-sizing: border-box;
  display: flex;
  background: ${color.bg};
  border: 1px solid ${color.bg2};
  border-radius: 0;
  &:focus-within { outline: 2px solid ${color.primary}; outline-offset: 2px; }
  input, select {
    min-width: 0;
    color: ${color.fg};
    background: ${color.bg};
    font: inherit;
    border: 0;
    border-radius: 0;
    padding-inline: var(--space-s);
    /* the ring sits on the whole form */
    &:focus { outline: none; }
  }
  input { flex: 1; width: 0; }
  input::placeholder { color: ${color.fgMuted}; opacity: 1; }
  select { max-width: 11rem; border-left: 1px solid ${color.bg2}; }
  .MuiIconButton-root { flex-shrink: 0; color: ${color.fg}; border-radius: 0; }
  ${media.narrow} { select { max-width: 8rem; } }
`;

export default HeaderSearch;
