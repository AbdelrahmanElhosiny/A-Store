import styled from "@emotion/styled";
import useSell from "./useSell";

const SellHome = () => {
  const { items } = useSell();

  return (
    <Holder>
      {items.map((item) => {
        const { name, description, id, price, stockNum } = item;
        return (
          <div className="card" key={id}>
            <div className="name">{name}</div>
            <div className="price">{price}</div>
            <div className="description">{description}</div>
            <div className="stock-num">{stockNum}</div>
          </div>
        );
      })}
    </Holder>
  );
  // return (
  //   <Holder>
  //     <div className="card">
  //       <div className="name">{items[0].name}</div>
  //       <div className="price">{}</div>
  //       <div className="description">{}</div>
  //       <div className="stock-num">{}</div>
  //     </div>
  //   </Holder>
  // );
};

const Holder = styled.div``;

export default SellHome;
