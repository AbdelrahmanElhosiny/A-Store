import { useLocation } from "react-router-dom";

export const LocationProbe: React.FC = () => {
  const { pathname, search } = useLocation();
  return <output data-testid="location">{pathname + search}</output>;
};
