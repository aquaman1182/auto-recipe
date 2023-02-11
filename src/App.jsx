import "./App.css";
import { MyTab } from "./components/Tab";
import React from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase";

function App() {
  const handleClickSearchButton = async () => {
    const q = query(
      collection(db, "recipes"),
      where("ingredients", "array-contains-any", selected)
    );

    const querySnapshot = await getDocs(q);
    const recipes = []; // firestoreから取得したレシピ
    querySnapshot.forEach((doc) => {
      recipes.push(doc.data());
    });

    let result = [];
    for (const recipe of recipes) {
      let count = 0; // ユーザーが選択した食材がレシピに含まれている数
      for (const queryIngredient of selected) {
        if (
          recipe.ingredients.find(
            (ingredient) => queryIngredient === ingredient
          )
        ) {
          count += 1;
        }
      }
      result.push({ count, recipe });
    }
    console.log(result);

    const resipes = result.sort((a, b) => {
      if (a.count < b.count) {
        return 1;
      } else if (a.count > b.count) {
        return -1;  
      } else {
        return 0;
      }
    });
  }

  return (
    <div className="App">
      <MyTab handleClickSearchButton={(handleClickSearchButton)} resipes={(resipes)}/>
    </div>
  );
}

export default App;
