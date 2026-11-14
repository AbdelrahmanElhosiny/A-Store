import type { Account, Store } from "../../features/types";

const accountAvatarProps = (account: Account, store: Store | null) =>
  account.role === "seller" && store
    ? { letter: store.logoLetter, color: store.logoColor }
    : { letter: account.name.charAt(0), color: account.avatarColor };

export default accountAvatarProps;
