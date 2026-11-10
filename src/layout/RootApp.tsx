import styled from "@emotion/styled";
import RouterIndex from "../routes/Index";
import VersionChip from "../components/VersionChip";
import font from "../styles/font";

const RootApp = () => {
  return (
    <Holder>
      <RouterIndex />
      <VersionChip />
    </Holder>
  );
};

const Holder = styled.div`
  ${font.Sans}
`;

export default RootApp;
