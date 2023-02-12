export const searchSimilarWords = (word) => {
  const result = ingredientDict[word];
  return result ? result : [];
};

export const ingredientDict = {
  とうもろこし: ["コーン"],
  にんじん: ["人参"],
  ぱすた: ["パスタ"],
  ごはん: ["こめ"]
};
