import styled from "@emotion/styled";
import RouterIndex from "../routes/Index";
import font from "../styles/font";

const RootApp = () => {
  return (
    <Holder>
      <RouterIndex />
    </Holder>
  );
};

const Holder = styled.div`
  ${font.Sans}
`;

export default RootApp;
