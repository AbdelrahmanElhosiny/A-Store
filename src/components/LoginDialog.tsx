import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import styled from "@emotion/styled";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import DialogHeader from "./DialogHeader";
import AccountPicker from "./AccountPicker";
import useAuth from "../hooks/useAuth";
import useSide from "../hooks/useSide";
import { color } from "../styles/tokens";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

// Log in by picking one of the accounts: this is a demo, there are no passwords
const LoginDialog: React.FC<Props> = ({ isOpen, onClose }) => {
  const { setLoggedInUser, carryText } = useAuth();
  const { signUpPath, pathname } = useSide();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  const handlePick = (userName: string) => {
    setLoggedInUser(userName);
    onClose();
  };

  // a tap on the dimmed backdrop closes it, like Esc does
  const handleClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const isOutside =
      event.clientX < box.left ||
      event.clientX > box.right ||
      event.clientY < box.top ||
      event.clientY > box.bottom;
    // keyboard "clicks" have no position
    if (isOutside && event.detail > 0) onClose();
  };

  return (
    <Holder
      ref={dialogRef}
      onClose={onClose}
      onClick={handleClick}
      aria-labelledby="login-title"
    >
      <DialogHeader title="Log in" titleId="login-title" onClose={onClose} />
      <p className="text">
        Pick an account. This is a demo store, so there are no passwords.
      </p>
      {carryText && (
        <p className="carry">
          <ShoppingCartOutlinedIcon aria-hidden="true" />
          {carryText}
        </p>
      )}
      <AccountPicker className="accounts" onPick={handlePick} />
      <p className="sign-up">
        New here?{" "}
        <Link to={signUpPath} state={{ from: pathname }} onClick={onClose}>
          Create an account
        </Link>
      </p>
    </Holder>
  );
};

const Holder = styled.dialog`
  .text {
    margin: var(--space-m) 0;
  }

  .carry {
    display: flex;
    align-items: center;
    gap: var(--space-s);
    margin: 0 0 var(--space-m);
    padding: var(--space-s) var(--space-m);
    background-color: ${color.bg2};
    font-size: 0.9rem;
    .MuiSvgIcon-root {
      color: ${color.primary};
    }
  }

  .accounts {
    /* many sign-ups still fit on a phone */
    max-height: min(50vh, 360px);
    overflow-y: auto;
    /* room for the hover lift and focus ring */
    padding: 4px;
    margin: -4px;
  }

  .sign-up {
    margin: var(--space-l) 0 0;
    color: ${color.fgMuted};
    a {
      font-weight: 600;
      color: ${color.fg};
      text-decoration-color: ${color.primary};
      text-decoration-thickness: 2px;
      text-underline-offset: 3px;
    }
  }
`;

export default LoginDialog;
