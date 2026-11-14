import styled from "@emotion/styled";
import font from "../../styles/font";
import { color as tokens } from "../../styles/tokens";

const AccountAvatar: React.FC<{ letter: string; color: string; size?: number }> = ({ letter, color, size = 32 }) => (
  <Holder aria-hidden="true" style={{ backgroundColor: color, width: size, height: size }}>
    {letter.toUpperCase()}
  </Holder>
);
const Holder = styled.span`
  ${font.Bold}
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
  color: ${tokens.bg};
  border-radius: 0;
`;
export default AccountAvatar;
