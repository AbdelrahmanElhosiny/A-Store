import { Outlet } from "react-router-dom";
import BuyNavbar from "../components/BuyNavbar";

const BuyLayout = () => {
  return (
    <>
      <BuyNavbar />
      <Outlet />
    </>
  );
};

export default BuyLayout;
