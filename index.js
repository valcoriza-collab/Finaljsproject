import React from "react";
import ReactDOM from "react-dom/client";
import Sudoku from "./Sudoku.js";

ReactDOM.createRoot(document.getElementById("root")).render(
  React.createElement(React.StrictMode, null, React.createElement(Sudoku))
);