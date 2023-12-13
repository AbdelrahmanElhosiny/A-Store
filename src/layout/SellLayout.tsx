import { Outlet } from "react-router-dom";
import SellNavbar from "../components/navigation/SellNavbar";

const SellLayout = () => {
  return (
    <>
      <SellNavbar />
      <Outlet />
    </>
  );
};

export default SellLayout;
