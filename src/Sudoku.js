import React, { useState } from 'react';
import './Sudoku.css';

const puzzles = [
  {
    difficulty: "Easy",
    solution: [
      [5, 3, 4, 6, 7, 8, 9, 1, 2],
      [6, 7, 2, 1, 9, 5, 3, 4, 8],
      [1, 9, 8, 3, 4, 2, 5, 6, 7],
      [8, 5, 9, 7, 6, 1, 4, 2, 3],
      [4, 2, 6, 8, 5, 3, 7, 9, 1],
      [7, 1, 3, 9, 2, 4, 8, 5, 6],
      [9, 6, 1, 5, 3, 7, 2, 8, 4],
      [2, 8, 7, 4, 1, 9, 6, 3, 5],
      [3, 4, 5, 2, 8, 6, 1, 7, 9]
    ],
    initial: [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9]
    ]
  },
  {
    difficulty: "Hard",
    solution: [
      [1, 2, 3, 6, 7, 8, 9, 4, 5],
      [5, 8, 4, 2, 3, 9, 7, 6, 1],
      [9, 6, 7, 1, 4, 5, 3, 2, 8],
      [3, 7, 2, 4, 6, 1, 5, 8, 9],
      [6, 9, 1, 5, 8, 3, 2, 7, 4],
      [4, 5, 8, 7, 9, 2, 6, 1, 3],
      [8, 3, 6, 9, 2, 4, 1, 5, 7],
      [2, 1, 9, 8, 5, 7, 4, 3, 6],
      [7, 4, 5, 3, 1, 6, 8, 9, 2]
    ],
    initial: [
      [1, 0, 3, 0, 0, 8, 0, 4, 5],
      [0, 8, 0, 2, 0, 0, 0, 6, 0],
      [9, 0, 0, 0, 4, 5, 3, 0, 0],
      [0, 7, 0, 4, 0, 0, 5, 0, 9],
      [0, 0, 1, 0, 8, 0, 2, 0, 0],
      [4, 0, 8, 0, 0, 2, 0, 1, 0],
      [0, 0, 6, 9, 2, 0, 0, 0, 7],
      [0, 1, 0, 0, 0, 7, 0, 3, 0],
      [7, 4, 0, 3, 0, 0, 8, 0, 2]
    ]
  }
];

function Sudoku() {
  const [levelIndex, setLevelIndex] = useState(0);
  const currentPuzzle = puzzles[levelIndex];
  const [board, setBoard] = useState(currentPuzzle.initial.map(row => [...row]));
  const [isChecking, setIsChecking] = useState(false);

  const handleCellClick = (r, c) => {
    if (currentPuzzle.initial[r][c] !== 0) return;

    const newBoard = board.map(row => [...row]);
    const currentValue = newBoard[r][c];
    newBoard[r][c] = currentValue === 9 ? 0 : currentValue + 1;

    setBoard(newBoard);
    setIsChecking(false);
  };

  const changeLevel = (index) => {
    setLevelIndex(index);
    setBoard(puzzles[index].initial.map(row => [...row]));
    setIsChecking(false);
  };

  const getCellClass = (r, c, value) => {
    let classes = "cell";

    if (c === 2 || c === 5) classes += " border-right";
    if (r === 2 || r === 5) classes += " border-bottom";

    if (currentPuzzle.initial[r][c] !== 0) {
      classes += " fixed";
    } else if (value !== 0) {
      if (!isChecking) {
        classes += " user-input";
      } else {
        if (value === currentPuzzle.solution[r][c]) {
          classes += " correct";
        } else {
          classes += " incorrect";
        }
      }
    }
    return classes;
  };

  return (
    <div className="sudoku-container">
      <h1>Sudoku</h1>

      <div className="level-controls">
        {puzzles.map((p, index) => (
          <button
            key={index}
            className={`lvl-btn ${levelIndex === index ? 'active' : ''}`}
            onClick={() => changeLevel(index)}
          >
            {p.difficulty}
          </button>
        ))}
      </div>

      <div className="board">
        {board.map((row, r) => (
          <div key={r} className="row">
            {row.map((val, c) => (
              <div
                key={`${r}-${c}`}
                className={getCellClass(r, c, val)}
                onClick={() => handleCellClick(r, c)}
              >
                {val !== 0 ? val : ""}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="action-controls">
        <button className="check-btn" onClick={() => setIsChecking(true)}>
          Check Answer
        </button>
      </div>
    </div>
  );
}

export default Sudoku;