import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import {
  User,
  setLoggedInUser as setLoggedInUserAction,
  setLoggedOutUser as setLoggedOutUserAction,
} from "../features/userSlice";
import { AppDispatch, RootState } from "../app/store";

// Shared login state, used by the NavBar on both the Sell and Buy sides.
const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const users = useSelector<RootState>((store) => store.users) as User[];

  //------------------
  // definers
  //------------------
  const activeUserIndex = _.findIndex(users, { isLoggedIn: true });
  const activeUserName = users[activeUserIndex].userName;

  //------------------
  // Handlers
  //------------------
  const setLoggedInUser = () => {
    dispatch(setLoggedInUserAction("Omar"));
  };
  const setLoggedOutUser = () => {
    dispatch(setLoggedOutUserAction(activeUserName));
  };

  return {
    users,
    activeUserIndex,
    activeUserName,
    setLoggedInUser,
    setLoggedOutUser,
  };
};

export default useAuth;
