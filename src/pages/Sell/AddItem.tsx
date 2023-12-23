import { Form, Formik, FormikConfig, FormikHelpers } from "formik";
import * as yup from "yup";
import TextFiled from "../../components/form/TextFiled";
import { Button } from "@mui/material";
import PriceField from "../../components/form/PriceField";
import useSell, { AddItemFormFields } from "./useSell";

const initialValues: AddItemFormFields = {
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

//------------------
// JSX
//------------------
const AddItem = () => {
  const { addNewItem } = useSell();

  const handelSubmit = (
    values: AddItemFormFields,
    formikHelpers: FormikHelpers<AddItemFormFields>
  ) => {
    addNewItem(values);
    formikHelpers.resetForm();
  };
  const FormProps: FormikConfig<AddItemFormFields> = {
    initialValues,
    validationSchema,
    onSubmit: handelSubmit,
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
