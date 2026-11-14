import { css } from "@emotion/react";
import styled from "@emotion/styled";
import font from "../../styles/font";
import { color } from "../../styles/tokens";
import { media } from "../../styles/breakpoints";
import { NAV_ROW } from "../../styles/navHeight";

// The original navbar's filling link bar, shared by category navigation.
export const linkStyle = css`
  .link {
    --color: ${color.fg};
    user-select: none;
    -webkit-user-drag: none;
    position: relative;
    text-decoration: none;
    color: var(--color);
    transition: color 0.3s;
    z-index: 0;
    padding: 0.15em 0.6em;
    white-space: nowrap;
    &::after {
      content: "";
      position: absolute;
      background-color: var(--color);
      width: 0.3em;
      inset: 0;
      z-index: -1;
      transition: width 0.4s;
    }
    &:hover, &:focus-visible {
      color: ${color.bg};
      &::after { width: 100%; }
    }
    &.active { --color: ${color.primary}; }
  }
`;

export const truncate = css`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const HeaderBar = styled.div`
  box-sizing: border-box;
  height: ${NAV_ROW.bar}px;
  background: ${color.bg1};
  border-bottom: 1px solid ${color.bg2};
  display: flex;
  flex-wrap: nowrap;
  > * { flex-shrink: 0; }
  > form { flex-shrink: 1; margin-right: auto; }
  .spacer { flex: 1; min-width: 0; }
  align-items: center;
  gap: var(--space-m);
  padding-inline: var(--page-gutter);
  min-width: 0;
  .logo {
    ${font.Bold}
    display: flex;
    align-items: center;
    gap: var(--space-s);
    color: ${color.fg};
    text-decoration: none;
    white-space: nowrap;
    svg { width: 2.6em; flex-shrink: 0; }
  }
  .cart {
    ${font.Bold}
    display: flex;
    align-items: center;
    gap: var(--space-s);
    padding: var(--space-s);
    color: ${color.fg};
    text-decoration: none;
  }
  ${media.narrow} {
    gap: var(--space-s);
    .cart-label { display: none; }
  }
  &.phone {
    gap: var(--space-xs);
    .spacer { min-width: 0; }
    .logo { min-width: 44px; min-height: 44px; justify-content: center; }
    .MuiButton-root, .MuiIconButton-root { min-width: 44px; min-height: 44px; border-radius: 0; }
    .MuiIconButton-root { color: ${color.fg}; }
    .MuiSvgIcon-root { font-size: 28px; }
  }
`;

export const PhoneSearchRow = styled.div`
  box-sizing: border-box;
  height: ${NAV_ROW.search}px;
  display: flex;
  align-items: center;
  padding-inline: var(--page-gutter);
  background: ${color.bg1};
  border-bottom: 1px solid ${color.bg2};
  form { max-width: none; height: 46px; }
  .MuiIconButton-root { min-width: 44px; min-height: 44px; padding: 8px; }
  .MuiSvgIcon-root { font-size: 28px; }
`;
