import "./App.css";
import { MyTab } from "./components/Tab";
import React, { useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { bigram } from "n-gram";
import { RecipeView } from "./components/RecipeView";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RecipesContext } from "./context";
import { searchSimilarWords } from "./dict";

const sliceByNumber = (array, number) => {
  const length = Math.ceil(array.length / number);
  return new Array(length)
    .fill()
    .map((_, i) => array.slice(i * number, (i + 1) * number));
};

function App(props) {
  const [recipes, setRecipes] = useState([]);

  const handleClickSearchButton = async (userIngredients) => {
    // 類似表現を探す
    const withSimilarExpressionIngredients = userIngredients.flatMap(
      (ingredient) => [ingredient, ...searchSimilarWords(ingredient)]
    );

    // n-gramを通す
    const nGramUserIngredients = withSimilarExpressionIngredients.flatMap(
      (userIngredient) => bigram(userIngredient)
    );

    // array-contains-anyの上限ルールを回避するために、複数回に分けてリクエストを飛ばす
    const recipesBySubIngredients = await Promise.all(
      sliceByNumber(nGramUserIngredients, 10).map(
        async (nGramUserSubIngredients) => {
          const q = query(
            collection(db, "recipes"),
            where(
              "nGramRecipeMaterial",
              "array-contains-any",
              nGramUserSubIngredients
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
      for (const nGramUserIngredient of nGramUserIngredients) {
        if (
          recipe.nGramRecipeMaterial.find(
            (recipeIngredient) => nGramUserIngredient === recipeIngredient
          )
        ) {
          count += 1;
        }
      }
      result.push({ count, recipe });
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

    setRecipes(sortedResult.map(({ recipe }) => recipe));
  };

  return (
    <div className="App">
      <RecipesContext.Provider value={recipes}>
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <MyTab handleClickSearchButton={handleClickSearchButton} />
              }
            />
            <Route path="/RecipeView" element={<RecipeView />} />
          </Routes>
        </BrowserRouter>
      </RecipesContext.Provider>
    </div>
  );
}

export default App;
