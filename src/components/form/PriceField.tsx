import { TextField as MUITextFiled, TextFieldProps } from "@mui/material";
import { useField } from "formik";
import { useState } from "react";
import { InputAdornment } from "@mui/material";

type Props = TextFieldProps & {
  name: string;
};

// A money field with a "$" in front. The label sits inside the box while it's
// empty and moves up when the field has focus or a value (MUI would keep it up
// all the time because of the "$").
const PriceField = ({ name, ...rest }: Props) => {
  const [field, meta] = useField<string>(name);
  const [isFocused, setIsFocused] = useState(false);

  const isShrunk = isFocused || String(field.value ?? "") !== "";
  const hasError = Boolean(meta.touched && meta.error);

  return (
    <MUITextFiled
      variant="outlined"
      fullWidth
      {...field}
      {...rest}
      error={hasError}
      helperText={hasError ? meta.error : rest.helperText}
      onFocus={() => setIsFocused(true)}
      onBlur={(event) => {
        setIsFocused(false);
        field.onBlur(event);
      }}
      sx={{
        // while it's inside the box, the label starts after the "$"
        "& .MuiInputLabel-root:not(.MuiInputLabel-shrink)": {
          transform: "translate(34px, 16px) scale(1)",
        },
      }}
      InputLabelProps={{ shrink: isShrunk }}
      InputProps={{
        startAdornment: <InputAdornment position="start">$</InputAdornment>,
      }}
      // text, not number: no spinner, and the wheel can't change a price
      inputProps={{ inputMode: "decimal", autoComplete: "off" }}
    />
  );
};

export default PriceField;
