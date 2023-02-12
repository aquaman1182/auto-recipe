import { Tab } from "@headlessui/react";
import { useState, useEffect } from "react";
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import React from "react";
import classNames from "classnames";
import { Loading } from "./Loading";

const getImages = async (dirName) => {
  const imagesRef = ref(storage, `images/${dirName}`); // ディレクトリのリファレンス
  const images = await listAll(imagesRef) // ディレクトリ配下の全ファイルのリファレンスを取得
    .then((res) => {
      // res.items: 画像のリファレンスの配列
      return Promise.all(
        // [Promise, Promise, ...] => [{ url: imageUrl, name: imageName }, { url: imageUrl, name: imageName }, ...]
        res.items.map(async (itemRef) => {
          // asyncを付けると、戻り値はPromiseになる
          // 画像ファイルのリファレンス
          const imageUrl = await getDownloadURL(itemRef); // 画像ファイルのURLを取得
          const imageName = itemRef.name.replace(/\.[^/.]+$/, ""); // 画像ファイルの名前(拡張子なし)
          return { url: imageUrl, name: imageName }; // Promise<{ url: imageUrl, name: imageName }>
        })
      );
    })
    .catch((error) => {
      console.log(error);
    });
  return images;
};

const foodCategory = {
  cereals: "米・雑穀・シリアル",
  noodles: "麺類",
  vegetables: "野菜",
  marineProducts: "水産物・水産加工品",
  meatProducts: "肉・肉加工品",
  dairyProducts: "卵・チーズ・乳製品",
  fruits: "果物",
};

export const MyTab = ({ handleClickSearchButton }) => {
  const [selected, setSelected] = useState([]); // selectedには選択済みの画像の名前が入る
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState({
    //米・雑穀・シリアル
    cereals: [],
    //麺類
    noodles: [],
    //野菜
    vegetables: [],
    //水産物・水産加工品
    marineProducts: [],
    //肉・肉加工品
    meatProducts: [],
    //乳製品
    dairyProducts: [],
    //果物
    fruits: [],
  });

  useEffect(() => {
    const categoryName = Object.keys(categories)[0]; // categoryName === "cereals"
    getImages(categoryName).then((images) => {
      setCategories((oldCategories) => ({
        // oldCategories => 更新前のcategories
        ...oldCategories,
        [categoryName]: images, // [categoryName] => cereals
      }));
      setIsLoading(false);
    });
  }, []);

  const handleClick = (imageName) => {
    const newSelected = [...selected];
    if (selected.includes(imageName)) {
      // 選択済みの画像をクリックした
      newSelected.splice(selected.indexOf(imageName), 1);
    } else {
      // 選択していない画像をクリックした
      newSelected.push(imageName);
    }
    setSelected(newSelected);
  };

  return (
    <div className="w-full px-5 lg:px-32 py-16 sm:px-0">
      <Tab.Group
        onChange={async (index) => {
          setIsLoading(true);
          const categoryName = Object.keys(categories)[index];
          const images = await getImages(categoryName);
          setCategories((oldCategories) => ({
            // oldCategories: 更新前のcategories
            ...oldCategories,
            [categoryName]: images, // [categoryName] => cereals
          }));
          setIsLoading(false);
        }}
      >
        <Tab.List>
          {Object.keys(categories).map((category) => (
            <Tab
              key={category}
              className={({ selected }) =>
                classNames("tab tab-bordered", selected ? "tab-active" : "")
              }
            >
              {foodCategory[category]}
            </Tab>
          ))}
        </Tab.List>
        <div className="flex justify-end ">
          <button
            className="btn btn-success"
            onClick={() => handleClickSearchButton(selected)}
          >
            検索
          </button>
        </div>
        <Tab.Panels className="mt-2">
          {Object.values(categories).map((images, idx) => (
            <Tab.Panel key={idx}>
              {isLoading ? (
                <Loading />
              ) : (
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {images.map((image) => (
                    <div key={image.url} className="relative">
                      <img
                        alt="gallery"
                        className="block object-cover object-center w-full h-full rounded-lg"
                        src={image.url}
                      />
                      <div
                        onClick={() => handleClick(image.name)}
                        className={classNames(
                          "rounded-lg absolute top-0 right-0 bottom-0 left-0 w-full h-full overflow-hidden bg-fixed opacity-0 transition duration-300 ease-in-out bg-black",
                          { "opacity-50": selected.includes(image.name) }
                        )}
                      ></div>
                    </div>
                  ))}
                </div>
              )}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};
