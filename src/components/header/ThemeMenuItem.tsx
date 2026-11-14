import styled from "@emotion/styled";
import { MenuItem } from "@mui/material";
import DarkModeOutlined from "@mui/icons-material/DarkModeOutlined";
import useThemeMode from "../../hooks/useThemeMode";
import { color } from "../../styles/tokens";

const ThemeMenuItem: React.FC = () => {
  const { mode, setPreference } = useThemeMode();
  const dark = mode === "dark";
  return (
    <Holder role="menuitemcheckbox" aria-checked={dark} className="secondary"
      onClick={() => setPreference(dark ? "light" : "dark")}>
      Dark mode
      <span className="track" aria-hidden="true" />
      <DarkModeOutlined />
    </Holder>
  );
};
const Holder = styled(MenuItem)`
  gap: var(--space-s);
  .track {
    position: relative;
    box-sizing: border-box;
    margin-left: auto;
    width: 46px;
    height: 26px;
    border: 1px solid ${color.fg};
    background: ${color.bg2};
    &::after {
      content: "";
      position: absolute;
      top: 3px;
      left: 3px;
      width: 18px;
      height: 18px;
      background: ${color.fg};
    }
  }
  &[aria-checked="true"] .track {
    background: ${color.fg};
    &::after { background: ${color.bg}; transform: translateX(20px); }
  }
`;
export default ThemeMenuItem;
