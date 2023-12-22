import { Form, Formik, FormikConfig } from "formik";
import * as yup from "yup";
import TextFiled from "../../components/form/TextFiled";
import { Button } from "@mui/material";
import PriceField from "../../components/form/PriceField";

interface FormFields {
  id: string;
  name: string;
  description: string;
  price: number | string;
  stockNum: number | string;
  image?: File;
}
const initialValues: FormFields = {
  id: "",
  name: "",
  description: "",
  price: "",
  stockNum: "",
};
const validationSchema = yup.object({
  name: yup.string().required("Required"),
  description: yup.string().required("Required"),
  price: yup
    .number()
    .min(1, "Price can't be less than or equal to 0")
    .required("Required"),
  stockNum: yup
    .number()
    .min(10, "At least 10 units must be in stock for new items")
    .required("Required"),
});

const onSubmit = (values: FormFields) => console.log(values);

//------------------
// JSX
//------------------
const AddItem = () => {
  const FormProps: FormikConfig<FormFields> = {
    initialValues,
    validationSchema,
    onSubmit,
  };

  return (
    <>
      <h1>Add new item</h1>
      <Formik {...FormProps}>
        <Form>
          <TextFiled name="name" label="Name" />
          <TextFiled
            name="description"
            label="Description"
            multiline
            minRows={2}
          />
          <TextFiled
            name="price"
            label="Price"
            InputProps={{ startAdornment: "$", type: "number" }}
          />
          {/* <PriceField name="price" label="Price2222" /> */}
          <TextFiled name="stockNum" label="Stock" type="number" />
          <div className="buttons">
            <Button
              variant="contained"
              size="large"
              type="submit"
              className="submit-button"
            >
              Submit
            </Button>
            <Button
              variant="contained"
              size="large"
              type="reset"
              className="clear-button"
            >
              Clear
            </Button>
          </div>
        </Form>
      </Formik>
    </>
  );
};

export default AddItem;
