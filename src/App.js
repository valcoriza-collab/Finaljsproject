import React, { useState, useEffect } from 'react';
import './Sudoku.css';

const PUZZLES = {
  easy: [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]
  ],
  medium: [
    [0, 0, 0, 2, 6, 0, 7, 0, 1],
    [6, 8, 0, 0, 7, 0, 0, 9, 0],
    [1, 9, 0, 0, 0, 4, 5, 0, 0],
    [8, 2, 0, 1, 0, 0, 0, 4, 0],
    [0, 0, 4, 6, 0, 2, 9, 0, 0],
    [0, 5, 0, 0, 0, 3, 0, 2, 8],
    [0, 0, 9, 3, 0, 0, 0, 7, 4],
    [0, 4, 0, 0, 5, 0, 0, 3, 6],
    [7, 0, 3, 0, 1, 8, 0, 0, 0]
  ],
  hard: [
    [0, 0, 0, 6, 0, 0, 4, 0, 0],
    [7, 0, 0, 0, 0, 3, 6, 0, 0],
    [0, 0, 0, 0, 9, 1, 0, 8, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 5, 0, 1, 8, 0, 0, 0, 3],
    [0, 0, 0, 3, 0, 6, 0, 4, 5],
    [0, 4, 0, 2, 0, 0, 0, 6, 0],
    [9, 0, 3, 0, 0, 0, 0, 0, 0],
    [0, 2, 0, 0, 0, 0, 1, 0, 0]
  ]
};

const copyBoard = (grid) => grid.map((row) => [...row]);

function Sudoku() {
  const [difficulty, setDifficulty] = useState('easy');
  const [board, setBoard] = useState(() => copyBoard(PUZZLES.easy));
  const [invalidCells, setInvalidCells] = useState(new Set());
  const [statusMessage, setStatusMessage] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [isSolved, setIsSolved] = useState(false);

  // Live timer using useEffect
  useEffect(() => {
    if (isSolved) return;
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isSolved]);

  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const changeDifficulty = (level) => {
    setDifficulty(level);
    setBoard(copyBoard(PUZZLES[level]));
    setInvalidCells(new Set());
    setStatusMessage('');
    setSeconds(0);
    setIsSolved(false);
  };

  const handleChange = (r, c, value) => {
    if (value === '' || /^[1-9]$/.test(value)) {
      const updated = copyBoard(board);
      updated[r][c] = value === '' ? 0 : parseInt(value, 10);
      setBoard(updated);
      setStatusMessage('');
    }
  };

  const checkBoard = () => {
    const conflicts = new Set();
    let hasEmpty = false;

    // 1. Check Rows and Columns
    for (let i = 0; i < 9; i++) {
      const rowMap = {};
      const colMap = {};

      for (let j = 0; j < 9; j++) {
        const rVal = board[i][j];
        const cVal = board[j][i];

        if (rVal === 0) hasEmpty = true;

        if (rVal !== 0) {
          if (rowMap[rVal] !== undefined) {
            conflicts.add(`${i}-${j}`);
            conflicts.add(`${i}-${rowMap[rVal]}`);
          } else {
            rowMap[rVal] = j;
          }
        }

        if (cVal !== 0) {
          if (colMap[cVal] !== undefined) {
            conflicts.add(`${j}-${i}`);
            conflicts.add(`${colMap[cVal]}-${i}`);
          } else {
            colMap[cVal] = j;
          }
        }
      }
    }

    // 2. Check 3x3 Subgrids
    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
        const boxMap = {};
        for (let r = boxRow * 3; r < boxRow * 3 + 3; r++) {
          for (let c = boxCol * 3; c < boxCol * 3 + 3; c++) {
            const val = board[r][c];
            if (val !== 0) {
              if (boxMap[val]) {
                conflicts.add(`${r}-${c}`);
                conflicts.add(boxMap[val]);
              } else {
                boxMap[val] = `${r}-${c}`;
              }
            }
          }
        }
      }
    }

    setInvalidCells(conflicts);

    if (conflicts.size > 0) {
      setStatusMessage('Conflicts found! Highlighted cells violate Sudoku rules.');
    } else if (hasEmpty) {
      setStatusMessage('Valid so far! Keep filling the remaining cells.');
    } else {
      setIsSolved(true);
      setStatusMessage(`Congratulations! Puzzle solved in ${formatTime(seconds)}.`);
    }
  };

  const resetBoard = () => {
    setBoard(copyBoard(PUZZLES[difficulty]));
    setInvalidCells(new Set());
    setStatusMessage('');
    setSeconds(0);
    setIsSolved(false);
  };

  return (
    <div className="sudoku-container">
      <h2>Sudoku Challenge</h2>

      <div className="sudoku-top-bar">
        <div className="difficulty-group">
          {['easy', 'medium', 'hard'].map((level) => (
            <button
              key={level}
              className={`diff-btn ${difficulty === level ? 'active-diff' : ''}`}
              onClick={() => changeDifficulty(level)}
            >
              {level.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="timer-badge">Time: {formatTime(seconds)}</div>
      </div>

      <div className="sudoku-board">
        {board.map((row, rIndex) => (
          <div key={rIndex} className="sudoku-row">
            {row.map((cell, cIndex) => {
              const isInitial = PUZZLES[difficulty][rIndex][cIndex] !== 0;
              const isConflict = invalidCells.has(`${rIndex}-${cIndex}`);
              return (
                <input
                  key={`${rIndex}-${cIndex}`}
                  type="text"
                  maxLength="1"
                  className={`sudoku-cell
                    ${cIndex % 3 === 2 && cIndex !== 8 ? 'thick-right' : ''}
                    ${rIndex % 3 === 2 && rIndex !== 8 ? 'thick-bottom' : ''}
                    ${isInitial ? 'initial-cell' : 'input-cell'}
                    ${isConflict ? 'conflict-cell' : ''}
                  `}
                  value={cell === 0 ? '' : cell}
                  onChange={(e) => handleChange(rIndex, cIndex, e.target.value)}
                  readOnly={isInitial}
                />
              );
            })}
          </div>
        ))}
      </div>

      {statusMessage && (
        <p className={`status-banner ${isSolved ? 'status-win' : 'status-info'}`}>
          {statusMessage}
        </p>
      )}

      <div className="btn-row">
        <button className="btn" onClick={checkBoard}>Check Board</button>
        <button className="btn btn-secondary" onClick={resetBoard}>Reset</button>
      </div>
    </div>
  );
}

export default Sudoku;
