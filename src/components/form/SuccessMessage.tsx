import styled from "@emotion/styled";
import colorD from "../../styles/colorD";
import { IconButton } from "@mui/material";
import DisabledByDefaultIcon from "@mui/icons-material/DisabledByDefault";
import React from "react";

interface Props {
  message: string;
  onClose: () => void;
}

const SuccessMessage: React.FC<Props> = ({ message, onClose }) => {
  return (
    <Holder>
      <div className="text">{message}</div>
      <IconButton onClick={onClose}>
        <DisabledByDefaultIcon />
      </IconButton>
    </Holder>
  );
};

const Holder = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${colorD.yellow};
`;

export default SuccessMessage;
