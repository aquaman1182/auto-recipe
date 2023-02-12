import "./App.css";
import { MyTab } from "./components/Tab";
import React, { useState } from "react";
import { RecipeView } from "./components/RecipeView";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App(props) {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MyTab />} />
          <Route path="/RecipeView" element={<RecipeView />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
