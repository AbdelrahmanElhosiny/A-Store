import styled from "@emotion/styled";
import TextFiled from "../../../components/form/TextField";
import PriceField from "../../../components/form/PriceField";
import ImageField from "../../../components/form/ImageField";
import StockField from "../../../components/form/StockField";

interface Props {
  minStock: 0 | 1; // same as the schema: a new item needs at least 1
}

// The item's form fields, shared by Add Item and the Update dialog
const ItemFields: React.FC<Props> = ({ minStock }) => {
  return (
    <Holder>
      <TextFiled name="name" label="Name" />
      <TextFiled name="description" label="Description" multiline minRows={2} />
      <div className="row">
        <PriceField name="price" label="Price" />
        <StockField name="stockNum" label="Stock" min={minStock} />
      </div>
      <ImageField name="image" label="Picture (optional)" />
    </Holder>
  );
};

const Holder = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-m);

  .row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-m);
    align-items: start;
  }
`;

export default ItemFields;
