import React,{ useState } from "react";

const recipesPerRow = 4;

function MoreRecipes() {
  const [next, setNext] = useState(recipesPerRow);

  const handleMoreRecipes = () => {
    setNext(next + recipesPerRow);
  };

  return (
    <>
        <button className="btn btn-block" onClick={handleMoreRecipes}>それはいやや</button>
    </>
  );
}

export default MoreRecipes;
