import React, { useState } from 'react';
import './App.css';

const STATIC_GRID = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9]
];

const SOLVED_GRID = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9]
];

// Creates a random 9x9 board by shuffling digits 1-9 and hiding 36 cells
function createDynamicGrid() {
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
  const grid = SOLVED_GRID.map((row) => row.map((n) => nums[n - 1]));

  let empty = 0;
  while (empty < 36) {
    const r = Math.floor(Math.random() * 9);
    const c = Math.floor(Math.random() * 9);
    if (grid[r][c] !== 0) {
      grid[r][c] = 0;
      empty++;
    }
  }
  return grid;
}

function App() {
  const [tab, setTab] = useState('play');
  const [startBoard, setStartBoard] = useState(STATIC_GRID);
  const [board, setBoard] = useState(STATIC_GRID.map((r) => [...r]));
  const [wrongCells, setWrongCells] = useState([]);
  const [msg, setMsg] = useState('');

  const loadBoard = (newGrid) => {
    setStartBoard(newGrid);
    setBoard(newGrid.map((r) => [...r]));
    setWrongCells([]);
    setMsg('');
  };

  const handleChange = (r, c, val) => {
    if (startBoard[r][c] !== 0) return;
    if (val === '' || /^[1-9]$/.test(val)) {
      const copy = board.map((row) => [...row]);
      copy[r][c] = val === '' ? 0 : Number(val);
      setBoard(copy);
      setMsg('');
    }
  };

  const checkSudoku = () => {
    const bad = [];
    let empty = false;

    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        const val = board[i][j];
        if (val === 0) {
          empty = true;
          continue;
        }

        // Check row & column duplicates
        for (let k = 0; k < 9; k++) {
          if (k !== j && board[i][k] === val) bad.push(`${i}-${j}`);
          if (k !== i && board[k][j] === val) bad.push(`${i}-${j}`);
        }

        // Check 3x3 box duplicates
        const boxR = Math.floor(i / 3) * 3;
        const boxC = Math.floor(j / 3) * 3;
        for (let r = boxR; r < boxR + 3; r++) {
          for (let c = boxC; c < boxC + 3; c++) {
            if ((r !== i || c !== j) && board[r][c] === val) {
              bad.push(`${i}-${j}`);
            }
          }
        }
      }
    }

    setWrongCells(bad);
    if (bad.length > 0) setMsg('Error: Duplicate numbers found!');
    else if (empty) setMsg('No errors so far! Keep going.');
    else setMsg('Congratulations! You solved the Sudoku!');
  };

  return (
    <div>
      <nav className="navbar">
        <strong>Sudoku App</strong>
        <div>
          <button className={tab === 'play' ? 'active' : ''} onClick={() => setTab('play')}>
            Play
          </button>
          <button className={tab === 'rules' ? 'active' : ''} onClick={() => setTab('rules')}>
            Rules
          </button>
        </div>
      </nav>

      {tab === 'play' ? (
        <div className="box">
          <h2>9x9 Sudoku</h2>
          <div className="buttons">
            <button onClick={() => loadBoard(STATIC_GRID)}>Static Board</button>
            <button onClick={() => loadBoard(createDynamicGrid())}>Dynamic Board</button>
          </div>

          <div className="grid">
            {board.map((row, r) => (
              <div key={r} className="row">
                {row.map((num, c) => (
                  <input
                    key={c}
                    type="text"
                    maxLength="1"
                    value={num === 0 ? '' : num}
                    readOnly={startBoard[r][c] !== 0}
                    onChange={(e) => handleChange(r, c, e.target.value)}
                    className={`cell 
                      ${c === 2 || c === 5 ? 'right-line' : ''} 
                      ${r === 2 || r === 5 ? 'bottom-line' : ''} 
                      ${startBoard[r][c] !== 0 ? 'fixed' : ''} 
                      ${wrongCells.includes(`${r}-${c}`) ? 'wrong' : ''}`}
                  />
                ))}
              </div>
            ))}
          </div>

          {msg && <p className="msg">{msg}</p>}

          <div className="buttons">
            <button onClick={checkSudoku}>Check Answer</button>
            <button onClick={() => loadBoard(startBoard)}>Reset</button>
          </div>
        </div>
      ) : (
        <div className="box rules">
          <h2>How to Play</h2>
          <p>1. Fill every empty square with numbers 1 to 9.</p>
          <p>2. Do not repeat numbers in the same row, column, or 3x3 box.</p>
          <p>3. Switch between Static Board or Dynamic Board anytime.</p>
          <button onClick={() => setTab('play')}>Back to Game</button>
        </div>
      )}
    </div>
  );
}

export default App;