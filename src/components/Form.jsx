import React, { useState } from "react";

const Form = () => {
  const [images, setImages] = useState([]);
  const [foodName, setFoodName] = useState("");
  const inputId = Math.random().toString(32).substring(2);

  const handleOnSubmit = async (e) => {
    e.preventDefault();

    const target = e.target & { comment: { value } };

    const data = new FormData();
    images.map((image) => {
      data.append("images[]", image);
    });
    data.append("comment", target.comment?.value || "");

    const storage = getStorage();
    const mainFoodsRef = ref(storage, "images/mainFoods");
    const vegetablesRef = ref(storage, "images/vegetables");
    const cerealsRef = ref(storage, "images/cereals");

    // Create file metadata including the content type
    /**  @type {any} */
    const metadata = {
      customMetadata: {
        foodName,
      },
    };

    // Upload the file and metadata
    const uploadTask = uploadBytes(
      mainFoodsRef,
      vegetablesRef,
      cerealsRef,
      file,
      metadata
    );

    alert("送信完了しました。");
  };

  const handleOnAddImage = (e) => {
    if (!e.target.files) return;
    setImages([...images, ...e.target.files]);
  };

  const handleOnRemoveImage = (index) => {
    // 選択した画像は削除可能
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  return (
    <form action="" onSubmit={(e) => handleOnSubmit(e)}>
      <input
        type="text"
        placeholder="Type here"
        className="input input-bordered w-full max-w-xs"
        value={foodName}
        onChange={(e) => setFoodName(e.target.value)}
      />
      <button className="btn">送信</button>

      {/* 1つのボタンで画像を選択する */}
      <label htmlFor={inputId}>
        <input
          id={inputId}
          type="file"
          multiple
          accept="image/*,.png,.jpg,.jpeg,.gif"
          onChange={(e) => handleOnAddImage(e)}
          style={{ display: "none" }}
        />
      </label>
      {/* 画像を選択したら選択中のすべての画像のプレビューを表示 */}
      {images.map((image, i) => (
        <div
          key={i}
          style={{
            position: "relative",
            width: "40%",
          }}
        >
          <img
            src={URL.createObjectURL(image)}
            style={{
              width: "100%",
            }}
          />
        </div>
      ))}
      <br />
      <br />
    </form>
  );
};

export default Form;
