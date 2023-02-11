import React from "react";

const RecipeView = ({ recipe }) => {
 return(
    <div className="recipes">
        <div>
            <img src={} alt={recipe.name} />    {/* レシピの写真を取得する */}
            <h3>{recipe.name}</h3>  {/* 料理名を取得する */}
        </div>
        <div>
            <ul>
                <li>
                    食材:
                    {recipe.foods.map(food => {     {/* APIの食材を取得してmapを使って取り出す */}
                        return (
                            <div key={food.food.name}>
                                <li>{}</li> {/*食材名を表示する*/}
                            </div>
                        )
                    })}

                </li>
            </ul>
        </div>
    </div>
 )
}

export default RecipeView;
