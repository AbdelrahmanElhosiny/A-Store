import { NavLink } from "react-router-dom";

interface TopNavLinkProps {
  label: string;
  path: string;
}

const TopNavLink = ({ path, label }: TopNavLinkProps) => {
  return <NavLink to={path}>{label}</NavLink>;
};

export default TopNavLink;
