import { Navigate, useLocation } from "react-router-dom";

const LegacyRedirect: React.FC<{ to: string }> = ({ to }) => {
  const { search } = useLocation();
  return <Navigate to={`${to}${search}`} replace />;
};

export default LegacyRedirect;
