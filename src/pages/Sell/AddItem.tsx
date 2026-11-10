import { Form, Formik, FormikConfig, FormikHelpers } from "formik";
import { Button } from "@mui/material";
import useSell, { ItemFormFields } from "./useSell";
import ItemFields from "./components/ItemFields";
import getItemSchema from "./itemSchema";
import styled from "@emotion/styled";

const initialValues: ItemFormFields = {
  name: "",
  description: "",
  price: "",
  stockNum: "",
  image: "",
};
const validationSchema = getItemSchema(1);

//------------------
// JSX
//------------------
const AddItem = () => {
  const { addNewItem } = useSell();

  const handelSubmit = (
    values: ItemFormFields,
    formikHelpers: FormikHelpers<ItemFormFields>,
  ) => {
    addNewItem(values);
    formikHelpers.resetForm();
  };
  const FormProps: FormikConfig<ItemFormFields> = {
    initialValues,
    validationSchema,
    onSubmit: handelSubmit,
  };

  return (
    <Holder>
      <h2>Add new item</h2>
      <Formik {...FormProps}>
        <Form noValidate>
          <ItemFields />
          <div className="buttons">
            <Button
              variant="contained"
              size="large"
              type="submit"
              className="submit-button"
            >
              Add item
            </Button>
            <Button
              variant="outlined"
              size="large"
              type="reset"
              className="clear-button"
            >
              Clear
            </Button>
          </div>
        </Form>
      </Formik>
    </Holder>
  );
};

const Holder = styled.div`
  form {
    display: flex;
    flex-direction: column;
    gap: var(--space-l);
    max-width: 640px;
  }
  .buttons {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-s);
  }
`;

export default AddItem;
