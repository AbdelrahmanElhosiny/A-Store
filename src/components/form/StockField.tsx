import styled from "@emotion/styled";
import {
  IconButton,
  InputAdornment,
  TextField as MUITextFiled,
  TextFieldProps,
} from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useField } from "formik";
import { color } from "../../styles/tokens";

type Props = TextFieldProps & {
  name: string;
  min?: number;
  max?: number;
};

// A whole-number field with up / down arrows on the right. The arrow keys do
// the same while typing, so the buttons stay out of the Tab order.
const StockField = ({ name, min = 0, max = 9999, ...rest }: Props) => {
  const [field, meta, helpers] = useField<string>(name);
  const hasError = Boolean(meta.touched && meta.error);

  const text = String(field.value ?? "").trim();
  const current = /^\d+$/.test(text) ? Number(text) : null;

  // an empty or invalid value counts as 0
  const step = (by: 1 | -1) => {
    const next = Math.min(Math.max((current ?? 0) + by, min), max);
    helpers.setValue(String(next));
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowUp") step(1);
    else if (event.key === "ArrowDown") step(-1);
    else return;
    event.preventDefault();
  };

  return (
    <Holder
      variant="outlined"
      fullWidth
      {...field}
      {...rest}
      error={hasError}
      helperText={hasError ? meta.error : rest.helperText}
      onKeyDown={handleKeyDown}
      inputProps={{
        inputMode: "numeric",
        autoComplete: "off",
        role: "spinbutton",
        "aria-valuenow": current ?? undefined,
        "aria-valuemin": min,
        "aria-valuemax": max,
      }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end" className="arrows">
            <IconButton
              aria-label="One more in stock"
              tabIndex={-1}
              disabled={current !== null && current >= max}
              onClick={() => step(1)}
            >
              <KeyboardArrowUpIcon fontSize="small" />
            </IconButton>
            <IconButton
              aria-label="One less in stock"
              tabIndex={-1}
              disabled={current === null || current <= min}
              onClick={() => step(-1)}
            >
              <KeyboardArrowDownIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
};

const Holder = styled(MUITextFiled)`
  .MuiOutlinedInput-root {
    padding-right: 0;
  }

  /* two square buttons stacked against the right edge, full height */
  .arrows {
    align-self: stretch;
    height: auto;
    max-height: none;
    margin-left: 0;
    display: flex;
    flex-direction: column;
    border-left: 1px solid ${color.bg2};

    .MuiIconButton-root {
      flex: 1;
      width: 36px;
      padding: 0;
      color: ${color.fgMuted};

      &:hover {
        color: var(--primary-color);
        background-color: ${color.bg2};
      }
      &.Mui-disabled {
        opacity: 0.4;
      }
    }
    .MuiIconButton-root + .MuiIconButton-root {
      border-top: 1px solid ${color.bg2};
    }
  }
`;

export default StockField;
