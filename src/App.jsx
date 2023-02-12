import "./App.css";
import { MyTab } from "./components/Tab";
import React, { useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { bigram } from "n-gram";
import TinySegmenter from "tiny-segmenter";

const sliceByNumber = (array, number) => {
  const length = Math.ceil(array.length / number);
  return new Array(length)
    .fill()
    .map((_, i) => array.slice(i * number, (i + 1) * number));
};
function App(props) {
  const [recipes, setRecipes] = useState([]);

  const handleClickSearchButton = async (selected) => {
    const segmenter = new TinySegmenter(); // インスタンス生成
    const parsedUserIngredients = selected.flatMap((userIngredient) =>
      segmenter.segment(userIngredient)
    );

    // const parsedUserIngredients = selected.flatMap((userIngredient) =>
    //   bigram(userIngredient)
    // );

    console.log("parsedUserIngredients: %o", parsedUserIngredients);

    // array-contains-anyの上限ルールを回避するために、複数回に分けてリクエストを飛ばす
    const recipesBySubIngredients = await Promise.all(
      sliceByNumber(parsedUserIngredients, 10).map(
        async (parsedUserSubIngredients) => {
          const q = query(
            collection(db, "recipes"),
            where(
              "tinySegmentRecipeMaterial",
              "array-contains-any",
              parsedUserSubIngredients
            )
          );

          const querySnapshot = await getDocs(q);
          const recipes = []; // firestoreから取得したレシピ
          querySnapshot.forEach((doc) => {
            recipes.push(doc.data());
          });

          return recipes;
        }
      )
    );

    const recipes = new Map();
    recipesBySubIngredients.forEach((subRecipes) =>
      subRecipes.forEach((recipe) => recipes.set(recipe.recipeId, recipe))
    );

    const result = [];
    for (const recipe of recipes.values()) {
      let count = 0; // ユーザーが選択した食材がレシピに含まれている数
      const hitWords = [];
      for (const parsedUserIngredient of parsedUserIngredients) {
        if (
          recipe.tinySegmentRecipeMaterial.find(
            (recipeIngredient) => parsedUserIngredient === recipeIngredient
          )
        ) {
          count += 1;
          hitWords.push(parsedUserIngredient);
        }
      }
      result.push({ count, hitWords, recipe });
    }

    const sortedResult = result.sort((a, b) => {
      if (a.count < b.count) {
        return 1;
      } else if (a.count > b.count) {
        return -1;
      } else {
        return 0;
      }
    });

    console.log("sortedResult: %o", sortedResult);

    setRecipes(sortedResult.map(({ recipe }) => recipe));
  };

  return (
    <div className="App">
      <MyTab handleClickSearchButton={handleClickSearchButton} />
    </div>
  );
}

export default App;
