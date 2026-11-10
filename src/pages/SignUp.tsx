import { Link, useLocation, useNavigate } from "react-router-dom";
import { Form, Formik, FormikConfig } from "formik";
import * as yup from "yup";
import styled from "@emotion/styled";
import { Button } from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import TextFiled from "../components/form/TextField";
import AccountPicker from "../components/AccountPicker";
import EmptyState from "../components/EmptyState";
import useAuth, { SignUpFields } from "../hooks/useAuth";
import useSide from "../hooks/useSide";
import { color } from "../styles/tokens";
import font from "../styles/font";

const initialValues: SignUpFields = {
  userName: "",
  address: "",
  optAddress: "",
  zipCode: "",
  phoneNum: "",
};

// the name must be new, so the schema is built with the current accounts
const getValidationSchema = (isNameTaken: (userName: string) => boolean) =>
  yup.object({
    userName: yup
      .string()
      .trim()
      .required("Enter a name")
      .min(2, "At least 2 characters")
      .max(24, "24 characters at most")
      .matches(
        /^[\p{L}\p{N} .'_-]+$/u,
        "Letters, numbers, spaces and . ' _ - only",
      )
      .test(
        "unique",
        "That name is taken, pick another",
        (value) => !value || !isNameTaken(value),
      ),
    address: yup
      .string()
      .trim()
      .required("Enter a delivery address")
      .min(5, "At least 5 characters"),
    optAddress: yup.string().trim().max(60, "60 characters at most"),
    zipCode: yup
      .string()
      .trim()
      .required("Enter a ZIP code")
      .matches(/^[A-Za-z0-9][A-Za-z0-9 -]{1,9}$/, "Enter a valid ZIP code"),
    phoneNum: yup
      .string()
      .trim()
      .required("Enter a phone number")
      .matches(/^\+?[\d\s()-]+$/, "Digits, spaces, + ( ) - only")
      .test(
        "digits",
        "At least 7 digits",
        (value) => (value?.match(/\d/g)?.length ?? 0) >= 7,
      ),
  });

//------------------
// JSX
//------------------
const SignUp = () => {
  const {
    isGuest,
    activeUserName,
    carryText,
    signUp,
    isNameTaken,
    setLoggedInUser,
    setLoggedOutUser,
  } = useAuth();
  const { side, homePath, signUpPath } = useSide();
  const navigate = useNavigate();
  const location = useLocation();

  // back to the page they came from, or this side's home
  const from = (location.state as { from?: string } | null)?.from;
  const backTo = from && from !== signUpPath ? from : homePath;

  const handleSubmit = (values: SignUpFields) => {
    signUp(values);
    navigate(backTo, { replace: true });
  };
  const handlePick = (userName: string) => {
    setLoggedInUser(userName);
    navigate(backTo, { replace: true });
  };

  const FormProps: FormikConfig<SignUpFields> = {
    initialValues,
    validationSchema: getValidationSchema(isNameTaken),
    onSubmit: handleSubmit,
  };

  if (!isGuest)
    return (
      <Holder>
        <h2>Create an account</h2>
        <EmptyState
          icon={<PersonOutlineIcon />}
          title={`You're logged in as ${activeUserName}`}
          text="Log out first if you want to create another account."
        >
          <Button variant="contained" component={Link} to={homePath}>
            {side === "buy" ? "Browse the shop" : "Go to your items"}
          </Button>
          <Button variant="outlined" onClick={setLoggedOutUser}>
            Log out
          </Button>
        </EmptyState>
      </Holder>
    );

  return (
    <Holder>
      <h2>Create an account</h2>
      <p className="intro">
        Your cart and orders are kept under your name. This is a demo store:
        there's no password, and everything stays in this browser.
      </p>

      <div className="columns">
        <Formik {...FormProps}>
          <Form className="form" noValidate>
            {carryText && (
              <p className="carry">
                <ShoppingCartOutlinedIcon aria-hidden="true" />
                {carryText}
              </p>
            )}
            <TextFiled name="userName" label="Name" autoComplete="username" />
            <TextFiled
              name="address"
              label="Delivery address"
              autoComplete="address-line1"
            />
            <TextFiled
              name="optAddress"
              label="Apartment, floor (optional)"
              autoComplete="address-line2"
            />
            <div className="row">
              <TextFiled
                name="zipCode"
                label="ZIP code"
                autoComplete="postal-code"
              />
              <TextFiled
                name="phoneNum"
                label="Phone"
                type="tel"
                autoComplete="tel"
              />
            </div>
            <Button
              variant="contained"
              size="large"
              type="submit"
              className="submit-button"
            >
              Create account
            </Button>
          </Form>
        </Formik>

        <aside className="demo" aria-labelledby="demo-title">
          <h3 id="demo-title">Or use a demo account</h3>
          <AccountPicker onPick={handlePick} />
        </aside>
      </div>
    </Holder>
  );
};

//------------------
// Styled component
//------------------
const Holder = styled.div`
  .intro {
    margin: 0 0 var(--space-l);
    max-width: 640px;
    color: ${color.fgMuted};
  }

  .columns {
    display: grid;
    grid-template-columns: minmax(0, 560px) 300px;
    align-items: start;
    gap: var(--space-xl);
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: var(--space-m);
  }

  .carry {
    display: flex;
    align-items: center;
    gap: var(--space-s);
    margin: 0;
    padding: var(--space-s) var(--space-m);
    background-color: ${color.bg2};
    font-size: 0.9rem;
    .MuiSvgIcon-root {
      color: ${color.primary};
    }
  }

  .row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-m);
  }

  .submit-button {
    align-self: flex-start;
  }

  .demo {
    padding: var(--space-l);
    background-color: ${color.bg1};
    border: 1px solid ${color.bg2};

    h3 {
      ${font.Bold}
      margin: 0 0 var(--space-m);
      font-size: 1rem;
    }
  }

  /* tablets and phones: the demo accounts go under the form */
  @media (max-width: 959px) {
    .columns {
      grid-template-columns: minmax(0, 560px);
    }
  }

  @media (max-width: 599px) {
    .row {
      grid-template-columns: 1fr;
    }
    .submit-button {
      align-self: stretch;
    }
    .demo {
      padding: var(--space-m);
    }
  }
`;

export default SignUp;
