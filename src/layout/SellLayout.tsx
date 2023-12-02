import { Outlet } from "react-router-dom";
import SellNavbar from "../components/SellNavbar";

const SellLayout = () => {
  return (
    <>
      <SellNavbar />
      <Outlet />
    </>
  );
};

export default SellLayout;
