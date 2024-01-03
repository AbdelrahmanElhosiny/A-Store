import { Button, InputAdornment } from "@mui/material";
import useSell from "../useSell";
import { useEffect, useRef } from "react";
import styled from "@emotion/styled";
import { Item } from "../../../features/itemSlice";
import * as yup from "yup";
import { Formik, Form, FormikConfig, FormikHelpers } from "formik";
import TextFiled from "../../../components/form/TextField";
import useNotification from "../../../hooks/useNotification";

interface Props {
  item: Item | null;
  itemName: string | null;
  closeDialog: () => void;
}

const validationSchema = yup.object({
  name: yup.string().required("Required"),
  description: yup.string().required("Required"),
  price: yup
    .number()
    .min(1, "Price can't be less than or equal to 0")
    .required("Required"),
  stockNum: yup
    .number()
    .min(1, "At least 10 units must be in stock for new items")
    .required("Required"),
});

const UpdateItemModal: React.FC<Props> = ({ item, itemName, closeDialog }) => {
  const { updateItem } = useSell();
  const { showNotification } = useNotification();
  const dialogRef = useRef<HTMLDialogElement>(null);

  // const toggleDialog = () => {
  //   if (!dialogRef.current) {
  //     return;
  //   }
  //   dialogRef.current.hasAttribute("open")
  //     ? dialogRef.current.close()
  //     : dialogRef.current.showModal();
  // };

  // useEffect(() => {
  //   toggleDialog();
  // }, [item]);

  useEffect(() => {
    item && dialogRef.current?.showModal();
  }, [item]);

  if (!item) return; // Quick exit
  const initialValues = item;
  const handelSubmit = (values: Item, formikHelpers: FormikHelpers<Item>) => {
    updateItem(values);
    formikHelpers.resetForm();
    closeDialog();
    showNotification({ message: `${item.name} was updated!` });
  };
  const FormProps: FormikConfig<Item> = {
    initialValues,
    validationSchema,
    onSubmit: handelSubmit,
  };

  return (
    <Holder ref={dialogRef}>
      <div className="text">Updating {itemName}</div>
      <Formik {...FormProps}>
        <Form>
          <TextFiled name="name" label="Name" />
          <TextFiled
            name="description"
            label="Description"
            // multiline
            minRows={2}
          />
          <TextFiled
            name="price"
            label="Price"
            type="number"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">$</InputAdornment>
              ),
            }}
          />
          <TextFiled name="stockNum" label="Stock" type="number" />
          <div className="buttons">
            <Button type="submit">Update</Button>
            <Button onClick={closeDialog}>Cancel</Button>
          </div>
        </Form>
      </Formik>
    </Holder>
  );
};

const Holder = styled.dialog``;

export default UpdateItemModal;
