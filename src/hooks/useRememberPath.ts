import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAppDispatch } from "../app/hooks";
import { rememberPath } from "../features/sessionSlice";
import useSide from "./useSide";

const useRememberPath = (): void => {
  const dispatch = useAppDispatch();
  const { role } = useSide();
  const { pathname, search } = useLocation();
  useEffect(() => {
    dispatch(rememberPath({ role, path: pathname + search }));
  }, [dispatch, role, pathname, search]);
};

export default useRememberPath;
