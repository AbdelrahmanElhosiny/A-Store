import { useMediaQuery } from "@mui/material";
import { PHONE_QUERY } from "../styles/breakpoints";

const useIsPhone = (): boolean => useMediaQuery(PHONE_QUERY);
export default useIsPhone;
