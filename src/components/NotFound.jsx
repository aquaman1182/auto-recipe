import React from "react";
import { useNavigate } from "react-router-dom";

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <section className="flex items-center h-screen p-16 dark:bg-gray-900 dark:text-gray-100">
      <div className="container flex flex-col items-center justify-center px-5 mx-auto my-8">
        <div className="max-w-md text-center">
          <p className="text-2xl font-semibold md:text-3xl">
            レシピがありませんでした。
          </p>
          <p className="mt-4 mb-8 dark:text-gray-400">
            他の食材を組みわせて見てください。
          </p>
          <span
            rel="noopener noreferrer"
            className="px-8 py-3 font-semibold rounded dark:bg-violet-400 dark:text-gray-900"
            onClick={() => navigate("/")}
          >
            食材選択画面に戻る
          </span>
        </div>
      </div>
    </section>
  );
};
