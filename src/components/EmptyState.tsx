import styled from "@emotion/styled";
import { color } from "../styles/tokens";

interface Props {
  icon: React.ReactNode;
  title: string;
  text: string;
  children?: React.ReactNode; // buttons
}

// A friendly box for pages with nothing to show yet (empty cart, no orders)
const EmptyState: React.FC<Props> = ({ icon, title, text, children }) => {
  return (
    <Holder>
      <span className="icon" aria-hidden="true">
        {icon}
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
      {children && <div className="buttons">{children}</div>}
    </Holder>
  );
};

const Holder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-s);
  max-width: 480px;
  padding: var(--space-xl) var(--space-l);
  background-color: ${color.bg1};
  border: 1px solid ${color.bg2};

  .icon {
    display: grid;
    place-items: center;
    width: 56px;
    height: 56px;
    background-color: ${color.primary};
    color: ${color.bg};
    box-shadow: var(--shadow-2);
    .MuiSvgIcon-root {
      font-size: 32px;
    }
  }

  h3 {
    margin: var(--space-s) 0 0;
    font-size: 1.35rem;
  }

  p {
    margin: 0;
    color: ${color.fgMuted};
  }

  .buttons {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-s);
    margin-top: var(--space-m);
  }
`;

export default EmptyState;
