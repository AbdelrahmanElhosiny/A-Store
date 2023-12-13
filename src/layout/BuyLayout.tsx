import { Outlet } from "react-router-dom";
import BuyNavbar from "../components/navigation/BuyNavbar";

const BuyLayout = () => {
  return (
    <>
      <BuyNavbar />
      <Outlet />
    </>
  );
};

export default BuyLayout;
