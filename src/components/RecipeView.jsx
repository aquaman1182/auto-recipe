import React, { useState, useMemo, useContext } from "react";
import { RecipesContext } from "../context";
import { NotFound } from "./NotFound";

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

export const RecipeView = () => {
  const recipes = useContext(RecipesContext);

  if (!recipes) {
    return <NotFound />;
  }

  return (
    <div className="p-10 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-5">
      {recipes.map((recipe, i) => (
        <div className="rounded overflow-hidden shadow-lg" key={i}>
          <img className="w-full" src={recipe.foodImageUrl} alt="Mountain" />
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
