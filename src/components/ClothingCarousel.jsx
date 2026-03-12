import React from "react";

import ropa1 from "../assets/ropa1.jpeg";
import ropa2 from "../assets/ropa2.jpeg";
import ropa3 from "../assets/ropa3.jpeg";

const clothes = [ropa1, ropa2, ropa3];

const ClothingCarousel = ({ selected, onSelect }) => {

  return (

    <div className="clothes-row">

      {clothes.map((item,i)=>(

        <img
          key={i}
          src={item}
          onClick={()=>onSelect(item)}
          className={selected === item ? "selected" : ""}
        />

      ))}

    </div>

  );

};

export default ClothingCarousel;