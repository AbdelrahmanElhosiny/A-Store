import { useId } from "react";
import styled from "@emotion/styled";
import { Switch } from "@mui/material";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import useThemeMode from "../hooks/useThemeMode";
import { color } from "../styles/tokens";
import font from "../styles/font";

interface Props {
  className?: string;
  label?: string;
}

// Light/dark switch. Starts from the browser/system setting;
// once flipped, the choice is remembered.
const ThemeSwitch: React.FC<Props> = ({ className, label }) => {
  const id = useId();
  const { mode, setPreference } = useThemeMode();
  const isDark = mode === "dark";

  return (
    <Holder className={className || ""}>
      {label && <label className="label" htmlFor={id}>{label}</label>}
      <LightModeOutlinedIcon className={`icon ${isDark ? "" : "on"}`} />
      <Switch
        id={id}
        className="switch"
        checked={isDark}
        onChange={(event) =>
          setPreference(event.target.checked ? "dark" : "light")
        }
        inputProps={{ "aria-label": "Dark mode" }}
        disableRipple
      />
      <DarkModeOutlinedIcon className={`icon ${isDark ? "on" : ""}`} />
    </Holder>
  );
};

// Square track and thumb to match the sharp-edged design
const Holder = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  .label { ${font.Bold} margin-right: var(--space-s); }

  .icon {
    font-size: 1.15em;
    color: ${color.fgMuted};
    &.on {
      color: ${color.fg};
    }
  }

  .switch {
    width: 46px;
    height: 26px;
    padding: 0;

    .MuiSwitch-switchBase {
      padding: 4px;
      color: ${color.fg};
      &.Mui-checked {
        transform: translateX(20px);
        color: ${color.bg};
      }
      &.Mui-checked + .MuiSwitch-track {
        background-color: ${color.fg};
        opacity: 1;
      }
      &.Mui-focusVisible .MuiSwitch-thumb {
        outline: 2px solid ${color.primary};
        outline-offset: 2px;
      }
    }

    .MuiSwitch-thumb {
      width: 18px;
      height: 18px;
      border-radius: 0;
      box-shadow: none;
    }

    .MuiSwitch-track {
      border-radius: 0;
      border: 1px solid ${color.fg};
      background-color: ${color.bg2};
      opacity: 1;
    }
  }
`;

export default ThemeSwitch;
