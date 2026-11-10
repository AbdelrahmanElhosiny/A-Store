import { Button } from "@mui/material";
import styled from "@emotion/styled";
import { Formik, Form, FormikConfig } from "formik";
import useSell, { ItemFormFields, toFormFields } from "../useSell";
import { Item } from "../../../features/itemSlice";
import AppDialog from "../../../components/AppDialog";
import ItemFields from "./ItemFields";
import getItemSchema from "../itemSchema";

interface Props {
  item: Item | null; // kept while the dialog animates out
  isOpen: boolean;
  closeDialog: () => void;
}

const validationSchema = getItemSchema(0);

const UpdateItemModal: React.FC<Props> = ({ item, isOpen, closeDialog }) => {
  const { updateItem } = useSell();

  if (!item) return null; // Quick exit
  const handleSubmit = (values: ItemFormFields) => {
    updateItem(item.id, values);
    closeDialog();
  };
  const FormProps: FormikConfig<ItemFormFields> = {
    initialValues: toFormFields(item),
    validationSchema,
    onSubmit: handleSubmit,
    // a different item gets a fresh form
    enableReinitialize: true,
  };

  return (
    <AppDialog
      isOpen={isOpen}
      onClose={closeDialog}
      title="Update item"
      subtitle={item.name}
      width={560}
    >
      <Holder>
        <Formik {...FormProps}>
          {({ dirty }) => (
            <Form noValidate>
              <ItemFields />
              <div className="buttons">
                <Button onClick={closeDialog} variant="outlined">
                  Cancel
                </Button>
                <Button type="submit" variant="contained" disabled={!dirty}>
                  Save changes
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Holder>
    </AppDialog>
  );
};

const Holder = styled.div`
  form {
    display: flex;
    flex-direction: column;
    gap: var(--space-l);
    margin-top: var(--space-m);
  }
  .buttons {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-s);
  }
`;

export default UpdateItemModal;
