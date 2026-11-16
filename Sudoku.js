import React, { useState } from "react";
import "./Sudoku.css";

const h = React.createElement;

const BASE_PUZZLE =
  "530070000600195000098000060800060003400803001700020006060000280000419005000080079";
const BASE_SOLUTION =
  "534678912672195348198342567859761423426853791713924856961537284287419635345286179";

function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Makes a different grid by changing the digits and swapping rows and
// columns inside their groups of three. It is always a valid Sudoku.
function makeGame() {
  const digits = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const order = () =>
    [0, 1, 2].flatMap((g) => shuffle([0, 1, 2]).map((i) => g * 3 + i));
  const rows = order();
  const cols = order();
  const build = (text) =>
    rows.flatMap((r) =>
      cols.map((c) => {
        const n = Number(text[r * 9 + c]);
        return n === 0 ? 0 : digits[n - 1];
      })
    );
  return { puzzle: build(BASE_PUZZLE), solution: build(BASE_SOLUTION) };
}

export default function Sudoku() {
  const [game, setGame] = useState(makeGame);
  const [grid, setGrid] = useState(game.puzzle);
  const [selected, setSelected] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [message, setMessage] = useState("Pick a cell, then a number.");

  function setCell(value) {
    if (selected === null || game.puzzle[selected] !== 0) return;
    const next = [...grid];
    next[selected] = value;
    setGrid(next);
    if (value !== 0 && value !== game.solution[selected]) {
      setMessage("Wrong number. Try another one.");
    } else {
      setMessage("Pick a cell, then a number.");
    }
  }

  function check() {
    if (grid.join("") === game.solution.join("")) {
      setMessage("Solved. Well done.");
    } else if (grid.includes(0)) {
      setMessage("Not finished yet.");
    } else {
      setMessage("Something is wrong. Keep trying.");
    }
  }

  function reset() {
    setGrid(game.puzzle);
    setSelected(null);
    setMessage("Pick a cell, then a number.");
  }

  function newGrid() {
    const next = makeGame();
    setGame(next);
    setGrid(next.puzzle);
    setSelected(null);
  }

  const cells = grid.map((value, i) => {
    let cls = "cell";
    if (game.puzzle[i] !== 0) cls += " given";
    if (selected !== null && i !== selected) {
      const sr = Math.floor(selected / 9);
      const sc = selected % 9;
      const r = Math.floor(i / 9);
      const c = i % 9;
      const sameBox =
        Math.floor(r / 3) === Math.floor(sr / 3) &&
        Math.floor(c / 3) === Math.floor(sc / 3);
      if (r === sr || c === sc || sameBox) cls += " related";
      else if (value !== 0 && value === grid[selected]) cls += " same";
    }
    if (i === selected) cls += " selected";
    if (game.puzzle[i] === 0 && value !== 0 && value !== game.solution[i]) {
      cls += " wrong";
    }
    if (i % 9 === 2 || i % 9 === 5) cls += " right";
    if (Math.floor(i / 9) === 2 || Math.floor(i / 9) === 5) cls += " bottom";
    return h(
      "div",
      { key: i, className: cls, onClick: () => setSelected(i) },
      value === 0 ? "" : value
    );
  });

  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n) =>
    h("button", { key: n, onClick: () => setCell(n) }, n === 0 ? "Erase" : n)
  );

  return h(
    "div",
    { className: "sudoku" },
    h("h1", null, "Sudoku"),
    h("p", null, message),
    h("div", { className: "board" }, cells),
    h("div", { className: "buttons" }, numbers),
    h(
      "div",
      { className: "buttons" },
      h("button", { onClick: check }, "Check"),
      h("button", { onClick: reset }, "Reset"),
      h("button", { onClick: newGrid }, "New grid"),
      h(
        "button",
        { onClick: () => setShowHelp(!showHelp) },
        showHelp ? "Hide rules" : "How to play"
      )
    ),
    showHelp
      ? h(
          "div",
          { className: "help" },
          h("h2", null, "How to play Sudoku"),
          h(
            "ol",
            null,
            h("li", null, "Fill every empty cell with a number from 1 to 9."),
            h("li", null, "Each row must have 1 to 9 with no repeats."),
            h("li", null, "Each column must have 1 to 9 with no repeats."),
            h("li", null, "Each 3x3 box must have 1 to 9 with no repeats."),
            h("li", null, "Bold numbers are given and cannot be changed."),
            h("li", null, "Click a cell, then click a number to place it."),
            h("li", null, "Press Check to see if you solved it."),
            h("li", null, "Press New grid to play a different puzzle.")
          )
        )
      : null
  );
}