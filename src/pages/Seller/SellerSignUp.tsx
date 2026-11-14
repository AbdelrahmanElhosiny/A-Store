import styled from "@emotion/styled";
import { Button, MenuItem } from "@mui/material";
import { Form, Formik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import { v4 as uuid } from "uuid";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import TextField from "../../components/form/TextField";
import { CATEGORIES, CategoryId } from "../../constant/categories";
import { ROUTES } from "../../constant/routes";
import { addSeller } from "../../features/accountsSlice";
import { logInAs } from "../../features/cartActions";
import { addStore } from "../../features/storesSlice";
import useAuth from "../../hooks/useAuth";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import useNotification from "../../hooks/useNotification";
import { color } from "../../styles/tokens";
import { slugify } from "../../utils/slugify";
import sellerSignUpSchema from "./sellerSignUpSchema";

interface SellerSignUpFields {
  name: string;
  storeName: string;
  categoryFocus: CategoryId | "";
  tagline: string;
}
const initialValues: SellerSignUpFields = { name: "", storeName: "", categoryFocus: "", tagline: "" };

const SellerSignUp = () => {
  useDocumentTitle("Create a store");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const stores = useAppSelector((state) => state.stores);
  const { isSignedIn, activeName, isNameTaken, logOut } = useAuth();
  const { showNotification } = useNotification();

  const submit = (values: SellerSignUpFields) => {
    if (!values.categoryFocus) return;
    const now = Date.now();
    const id = `acc-${uuid()}`;
    const storeId = `store-${uuid()}`;
    const storeName = values.storeName.trim();
    const logoColor = [color.yellow, color.green, color.buy, color.orange, color.red, color.sell].find((value) =>
      !stores.some((store) => store.logoColor === value),
    ) ?? color.yellow;
    dispatch(addSeller({
      id, role: "seller", name: values.name.trim(), storeId,
      avatarColor: logoColor, createdAt: now, notificationsSeenAt: now,
    }));
    dispatch(addStore({
      id: storeId, ownerId: id, name: storeName, slug: slugify(storeName),
      tagline: values.tagline.trim(), description: "",
      logoLetter: storeName.charAt(0).toUpperCase(), logoColor,
      since: now, categoryFocus: values.categoryFocus,
      autoShip: false, lowStockAt: 3, deliveryFee: 0, freeDeliveryOver: null,
    }));
    dispatch(logInAs("seller", id));
    navigate(ROUTES.seller);
    showNotification({ message: "Your store is ready. Add your first product." });
  };

  return (
    <Holder>
      <h2>Create a store</h2>
      {isSignedIn ? (
        <>
          <h3>You're running {activeName}</h3>
          <p>Log out first if you want to create another store.</p>
          <div className="buttons">
            <Button variant="outlined" onClick={logOut}>Log out</Button>
            <Button variant="contained" component={Link} to={ROUTES.seller}>Back</Button>
          </div>
        </>
      ) : (
        <Formik initialValues={initialValues} validationSchema={sellerSignUpSchema(isNameTaken, stores.map(({ slug }) => slug))} onSubmit={submit}>
          <Form noValidate>
            <TextField name="name" label="Name" autoComplete="name" />
            <TextField name="storeName" label="Store name" />
            <TextField name="categoryFocus" label="Category" select>
              {CATEGORIES.map(({ id, label }) => <MenuItem key={id} value={id}>{label}</MenuItem>)}
            </TextField>
            <TextField name="tagline" label="Tagline (optional)" />
            <Button variant="contained" type="submit">Create a store</Button>
          </Form>
        </Formik>
      )}
    </Holder>
  );
};

const Holder = styled.div`
  form {
    display: flex;
    flex-direction: column;
    gap: var(--space-m);
    max-width: 560px;
  }
  .buttons { display: flex; flex-wrap: wrap; gap: var(--space-s); }
`;

export default SellerSignUp;
