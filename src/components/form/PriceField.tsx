import { TextField as MUITextFiled, TextFieldProps } from "@mui/material";
import { useField } from "formik";
import { useState } from "react";
import { InputAdornment } from "@mui/material";

type Props = TextFieldProps & {
  name: string;
};

const TextFiled = ({ name, ...rest }: Props) => {
  const [shrink, setShrink] = useState(false);

  const [field, meta] = useField(name);
  const configuredTextField = {
    ...field,
    ...rest,
    fullWidth: true,
  };

  if (meta && meta.touched && meta.error) {
    configuredTextField.error = true;
    configuredTextField.helperText = meta.error;
  }

  return (
    <MUITextFiled
      sx={() => ({
        "& .MuiOutlinedInput-notchedOutline": {
          px: 2.7,
        },
      })}
      variant="outlined"
      InputLabelProps={{ sx: { ml: 1.8 }, shrink }}
      onFocus={() => setShrink(true)}
      // onBlur={(e) => setShrink(!!e.target.value)}
      InputProps={{
        startAdornment: <InputAdornment position="start">$</InputAdornment>,
        type: "number",
      }}
      {...configuredTextField}
    />
  );
};

export default TextFiled;
