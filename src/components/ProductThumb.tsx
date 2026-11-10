import styled from "@emotion/styled";
import font from "../styles/font";
import { color } from "../styles/tokens";

interface Props {
  name: string;
  image?: string;
  className?: string;
}

// Small 4:3 picture for list rows; the first letter when there's no picture
const ProductThumb: React.FC<Props> = ({ name, image, className }) => {
  return (
    <Holder className={className}>
      {image ? (
        <img src={image} alt="" loading="lazy" draggable={false} />
      ) : (
        <span aria-hidden="true">
          {name.trim().charAt(0).toUpperCase() || "?"}
        </span>
      )}
    </Holder>
  );
};

const Holder = styled.div`
  aspect-ratio: 4 / 3;
  overflow: hidden;
  display: grid;
  place-items: center;
  background-color: ${color.bg2};
  border: 1px solid ${color.bg2};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  span {
    ${font.ItalicBold}
    font-size: 1.6rem;
    color: ${color.primary};
  }
`;

export default ProductThumb;
