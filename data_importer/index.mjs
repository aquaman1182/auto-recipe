import fetch from "node-fetch";
import { bigram } from "n-gram";
import kuromoji from "kuromoji";
import TinySegmenter from "tiny-segmenter";

import * as dotenv from "dotenv";
dotenv.config();

import { initializeApp, applicationDefault, cert } from "firebase-admin/app";
import { getFirestore, Timestamp, FieldValue } from "firebase-admin/firestore";

initializeApp({
  credential: cert({
    type: process.env.FIREBASE_ADMIN_TYPE,
    project_id: process.env.FIREBASE_ADMIN_PROJECT_ID,
    private_key_id: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
    client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_ADMIN_CLIENT_ID,
    auth_uri: process.env.FIREBASE_ADMIN_AUTH_URI,
    token_uri: process.env.FIREBASE_ADMIN_TOKEN_URI,
    auth_provider_x509_cert_url:
      process.env.FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_ADMIN_CLIENT_X509_CERT_URL,
  }),
});

const symbols = [
  "、",
  "。",
  "，",
  "．",
  "・",
  "：",
  "；",
  "？",
  "！",
  "゛",
  "゜",
  "´",
  "｀",
  "¨",
  "＾",
  "￣",
  "＿",
  "ヽ",
  "ヾ",
  "ゝ",
  "ゞ",
  "〃",
  "仝",
  "々",
  "〆",
  "〇",
  "ー",
  "―",
  "‐",
  "／",
  "＼",
  "～",
  "∥",
  "｜",
  "…",
  "‥",
  "‘",
  "’",
  "“",
  "”",
  "（",
  "）",
  "〔",
  "〕",
  "［",
  "］",
  "｛",
  "｝",
  "〈",
  "〉",
  "《",
  "》",
  "「",
  "」",
  "『",
  "』",
  "【",
  "】",
  "＋",
  "－",
  "±",
  "×",
  "÷",
  "＝",
  "≠",
  "＜",
  "＞",
  "≦",
  "≧",
  "∞",
  "∴",
  "♂",
  "♀",
  "°",
  "′",
  "″",
  "℃",
  "￥",
  "＄",
  "￠",
  "￡",
  "％",
  "＃",
  "＆",
  "＊",
  "＠",
  "§",
  "☆",
  "★",
  "○",
  "●",
  "◎",
  "◇",
  "◆",
  "□",
  "■",
  "△",
  "▲",
  "▽",
  "▼",
  "※",
  "〒",
  "→",
  "←",
  "↑",
  "↓",
  "+",
  "-",
  ")",
  "(",
];

const db = getFirestore();

const APPLICATION_ID = "1055238876029196397";

const sleep = (miliseconds) =>
  new Promise((resolve) => setTimeout(resolve, miliseconds));

const deleteChar = (text, chars) => {
  chars.forEach((char) => {
    text = text.replaceAll(char, "");
  });
  return text;
};

const main = async () => {
  // 1. カテゴリ一覧の取得
  // https://app.rakuten.co.jp/services/api/Recipe/CategoryList/20170426?applicationId=[アプリID]&categoryType=large

  const segmenter = new TinySegmenter();
  kuromoji.builder({ dicPath: "./dict" }).build(async (err, tokenizer) => {
    const categoryTypes = ["large"];
    const categoryTypesLen = categoryTypes.length;
    for (const i in categoryTypes) {
      const categoryType = categoryTypes[i];
      const categoryListApiRes = await fetch(
        `https://app.rakuten.co.jp/services/api/Recipe/CategoryList/20170426?applicationId=${APPLICATION_ID}&categoryType=${categoryType}`
      ).then((res) => res.json());
      const categories = categoryListApiRes.result[categoryType];

      await sleep(3000);

      const categoriesLen = categories.length;
      for (const j in categories) {
        console.log(`${(parseInt(j, 10) / categoriesLen) * 100}%`);

        const category = categories[j];

        // 2. カテゴリごとのレシピ取得
        // https://app.rakuten.co.jp/services/api/Recipe/CategoryRanking/20170426?applicationId=[アプリID]&categoryId=10

        const recipeListApiRes = await fetch(
          `https://app.rakuten.co.jp/services/api/Recipe/CategoryRanking/20170426?applicationId=${APPLICATION_ID}&categoryId=${category.categoryId}`
        ).then((res) => res.json());
        const recipes = recipeListApiRes.result;

        await sleep(3000);

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
        //   recipeMaterial: [ 'ジャガイモ', 'ピザ用チーズ', '片栗粉', '塩コショウ', 'オリーブオイル', [length]: 5 ],
        //   recipePublishday: '2020/11/11 06:54:46',
        //   recipeTitle: 'ジャガ���モとチーズだけ！！【簡単ガレット】',
        //   recipeUrl: 'https://recipe.rakuten.co.jp/recipe/1860023243/',
        //   shop: 0,
        //   smallImageUrl: 'https://image.space.rakuten.co.jp/d/strg/ctrl/3/4b97079b047aedb6fee22c664d758e8bbb33a292.47.9.3.3.jpg?thum=55'
        // }

        // 3. n-gramとかテキスト処理
        if (!recipes) {
          console.log("recipeListApiRes: %o", recipeListApiRes);
          continue;
        }

        const processedRecipes = recipes.map((recipe) => {
          // recipe.recipeMaterialから不要な文字を消す
          // recipe.recipeMaterial = recipe.recipeMaterial.map((ingredient) =>
          //   deleteChar(ingredient, symbols)
          // );
          const kuromojiRecipeMaterial = recipe.recipeMaterial.flatMap(
            (ingredient) => tokenizer.tokenize(ingredient)
          );
          return {
            ...recipe,
            nGramRecipeMaterial: recipe.recipeMaterial.flatMap((ingredient) =>
              bigram(ingredient)
            ),
            kuromojiRecipeMaterial,
            kuromojiBasicFormRecipeMaterial: kuromojiRecipeMaterial.map(
              ({ basic_form }) => basic_form
            ),
            kuromojiSurfaceFormRecipeMaterial: kuromojiRecipeMaterial.map(
              ({ surface_form }) => surface_form
            ),
            tinySegmentRecipeMaterial: recipe.recipeMaterial.flatMap(
              (ingredient) => segmenter.segment(ingredient)
            ),
          };
        });

        // 4. firestoreに投入
        processedRecipes.forEach((pRecipe) => {
          db.collection("recipes").doc(String(pRecipe.recipeId)).set(pRecipe);
        });
      }
    }
  });
};

main();
