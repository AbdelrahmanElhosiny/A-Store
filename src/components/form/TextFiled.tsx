import { TextField as MUITextFiled, TextFieldProps } from "@mui/material";
import { useField } from "formik";

type Props = TextFieldProps & {
  name: string;
};

const TextFiled = ({ name, ...rest }: Props) => {
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

  return <MUITextFiled variant="outlined" {...configuredTextField} />;
};

export default TextFiled;
