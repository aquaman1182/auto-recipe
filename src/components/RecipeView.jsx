import React, { useState, useMemo, useContext, useEffect } from "react";
import { RecipesContext } from "../context";
import { NotFound } from "./NotFound";
import { Loading } from "./Loading";
import { searchSimilarWords } from "../dict";
import { bigram } from "n-gram";
import { useLocation } from "react-router-dom";
import TinySegmenter from "tiny-segmenter";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

// {
//   foodImageUrl: 'https://image.space.rakuten.co.jp/d/strg/ctrl/3/4b97079b047aedb6fee22c664d758e8bbb33a292.47.9.3.3.jpg',
//   mediumImageUrl: 'https://image.space.rakuten.co.jp/d/strg/ctrl/3/4b97079b047aedb6fee22c664d758e8bbb33a292.47.9.3.3.jpg?thum=54',
//   nickname: 'スコクラさん',
//   pickup: 0,
//   rank: '1',
//   recipeCost: '300円前後',
//   recipeDescription: 'めっちゃ簡単で美味しいガレットです！！\nお酒のおつまみや、子供のおやつ、パーティにも使えます！！',
//   recipeId: 1860023243,
//   recipeIndication: '約15分',
//   recipeMaterial: [ 'ジャガイモ', 'ピザ用チーズ', '片栗粉', '塩コショウ', 'オリーブオイル' ],
//   nGramRecipeMaterial: [ 'ジャ', 'ャガ', 'ガイ', ... ],
//   recipePublishday: '2020/11/11 06:54:46',
//   recipeTitle: 'ジャガ���モとチーズだけ！！【簡単ガレット】',
//   recipeUrl: 'https://recipe.rakuten.co.jp/recipe/1860023243/',
//   shop: 0,
//   smallImageUrl: 'https://image.space.rakuten.co.jp/d/strg/ctrl/3/4b97079b047aedb6fee22c664d758e8bbb33a292.47.9.3.3.jpg?thum=55'
// }

const sliceByNumber = (array, number) => {
  const length = Math.ceil(array.length / number);
  return new Array(length)
    .fill()
    .map((_, i) => array.slice(i * number, (i + 1) * number));
};

export const RecipeView = () => {
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const search = useLocation().search;
  const queryParams = new URLSearchParams(search);
  const userIngredients = queryParams.get("ingredients").split(",");

  useEffect(() => {
    const asyncFunc = async () => {
      console.log("userIngredients: %o", userIngredients);

      // 類似表現を探す
      const withSimilarExpressionIngredients = userIngredients.flatMap(
        (ingredient) => [ingredient, ...searchSimilarWords(ingredient)]
      );

      const segmenter = new TinySegmenter();
      const parsedUserIngredients = userIngredients.flatMap((userIngredient) =>
        segmenter.segment(userIngredient)
      );

      // const parsedUserIngredients = userIngredients.flatMap((userIngredient) =>
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

      setRecipes(sortedResult.map(({ recipe }) => recipe));

      setIsLoading(false);
    };
    asyncFunc();
  }, []);

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (recipes.length === 0) {
    return <NotFound />;
  }

  return (
    <div className="p-10 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-5">
      {recipes.map((recipe, i) => (
        <div className="rounded overflow-hidden shadow-lg" key={i}>
          <a href={recipe.recipeUrl} target="_blank" rel="noopener noreferrer">
            <img className="w-full" src={recipe.foodImageUrl} alt="Mountain" />
          </a>
          <div className="px-6 py-4">
            <div className="font-bold text-xl mb-2">{recipe.recipeTitle}</div>
            <p className="text-gray-700 text-base">
              {recipe.recipeDescription}
            </p>
          </div>
          <div className="px-6 pt-4 pb-2">
            {recipe.recipeMaterial.map((ingredient) => (
              <span
                className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
                key={ingredient}
              >
                {ingredient}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
