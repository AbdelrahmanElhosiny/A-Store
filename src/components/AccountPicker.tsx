import styled from "@emotion/styled";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import useAuth from "../hooks/useAuth";
import { Address } from "../features/types";
import font from "../styles/font";
import { color } from "../styles/tokens";

interface Props {
  onPick: (accountId: string) => void; // the account's id
  className?: string;
}

// "14 Nile Street, Cairo": the default address (a sign-up has no city yet)
const shortAddress = (addresses: Address[]) => {
  const address = addresses.find(({ isDefault }) => isDefault) ?? addresses[0];
  return address ? [address.line1, address.city].filter(Boolean).join(", ") : "";
};

// One button per account; used by the login dialog and the sign-up page
const AccountPicker: React.FC<Props> = ({ onPick, className }) => {
  const { accounts } = useAuth();

  return (
    <Holder className={className} aria-label="Accounts">
      {accounts.map(({ id, name, addresses }) => (
        <li key={id}>
          <button
            type="button"
            className="account"
            onClick={() => onPick(id)}
          >
            <span className="avatar" aria-hidden="true">
              {name.charAt(0).toUpperCase()}
            </span>
            <span className="text">
              <span className="name">Log in as {name}</span>
              <span className="address">{shortAddress(addresses)}</span>
            </span>
            <ArrowForwardIcon className="arrow" aria-hidden="true" />
          </button>
        </li>
      ))}
    </Holder>
  );
};

const Holder = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-s);

  .account {
    width: 100%;
    display: grid;
    grid-template-columns: 40px minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--space-m);
    padding: var(--space-s) var(--space-m) var(--space-s) var(--space-s);
    font: inherit;
    text-align: left;
    color: ${color.fg};
    background-color: ${color.bg};
    border: 1px solid ${color.bg2};
    cursor: pointer;
    transition:
      transform 0.15s,
      box-shadow 0.15s,
      border-color 0.15s;

    @media (hover: hover) {
      &:hover {
        border-color: ${color.primary};
        transform: translate(-2px, -2px);
        box-shadow: var(--shadow-2);
        .arrow {
          color: ${color.primary};
        }
      }
    }
    &:active {
      transform: none;
      box-shadow: none;
    }
  }

  .avatar {
    ${font.ItalicBold}
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
    background-color: ${color.primary};
    color: ${color.bg};
  }

  .text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .name {
    font-weight: 600;
    overflow-wrap: anywhere;
  }

  .address {
    font-size: 0.85rem;
    color: ${color.fgMuted};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .arrow {
    color: ${color.fgMuted};
  }

  @media (prefers-reduced-motion: reduce) {
    .account {
      transition: none;
      &:hover {
        transform: none;
      }
    }
  }
`;

export default AccountPicker;
