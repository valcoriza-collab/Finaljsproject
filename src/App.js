import React, { useState } from 'react';
import './App.css';

// Static 9x9 Sudoku preset (0 represents an empty cell)
const STATIC_PUZZLE = [
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

// Valid solved base grid used to generate dynamic puzzles
const SOLVED_BASE = [
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

const cloneGrid = (grid) => grid.map((row) => [...row]);

// Generates a dynamic 9x9 Sudoku puzzle with randomized initial placements
function generateDynamicPuzzle(emptyCount = 40) {
  // 1. Randomly shuffle digits 1-9
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }

  // 2. Map the base grid using shuffled digits
  const grid = SOLVED_BASE.map((row) =>
    row.map((num) => digits[num - 1])
  );

  // 3. Shuffle rows within each 3-row band
  for (let band = 0; band < 3; band++) {
    const start = band * 3;
    const r1 = start + Math.floor(Math.random() * 3);
    const r2 = start + Math.floor(Math.random() * 3);
    [grid[r1], grid[r2]] = [grid[r2], grid[r1]];
  }

  // 4. Randomly clear cells to create the playable puzzle
  let removed = 0;
  while (removed < emptyCount) {
    const r = Math.floor(Math.random() * 9);
    const c = Math.floor(Math.random() * 9);
    if (grid[r][c] !== 0) {
      grid[r][c] = 0;
      removed++;
    }
  }

  return grid;
}

function App() {
  // Navigation state
  const [activePage, setActivePage] = useState('sudoku');

  // Sudoku states
  const [mode, setMode] = useState('static');
  const [difficulty, setDifficulty] = useState(35);
  const [initialBoard, setInitialBoard] = useState(() => cloneGrid(STATIC_PUZZLE));
  const [board, setBoard] = useState(() => cloneGrid(STATIC_PUZZLE));
  const [conflicts, setConflicts] = useState([]);
  const [message, setMessage] = useState('');

  // Load static preset puzzle
  const loadStaticGame = () => {
    const fresh = cloneGrid(STATIC_PUZZLE);
    setMode('static');
    setInitialBoard(fresh);
    setBoard(cloneGrid(fresh));
    setConflicts([]);
    setMessage('Loaded Static 9x9 Preset.');
  };

  // Generate dynamic randomized puzzle
  const loadDynamicGame = (holes = difficulty) => {
    const fresh = generateDynamicPuzzle(holes);
    setMode('dynamic');
    setInitialBoard(fresh);
    setBoard(cloneGrid(fresh));
    setConflicts([]);
    setMessage('Generated New Dynamic 9x9 Grid.');
  };

  // Handle user typing a number (1-9) into an editable cell
  const handleCellChange = (row, col, value) => {
    if (initialBoard[row][col] !== 0) return;

    if (value === '' || /^[1-9]\$/.test(value)) {
      const updated = cloneGrid(board);
      updated[row][col] = value === '' ? 0 : Number(value);
      setBoard(updated);
      setMessage('');
    }
  };

  // Reset current grid back to its starting placements
  const handleReset = () => {
    setBoard(cloneGrid(initialBoard));
    setConflicts([]);
    setMessage('Board reset to initial placements.');
  };

  // Validate rows, columns, and 3x3 subgrids
  const handleCheckBoard = () => {
    const badCells = new Set();
    let hasEmpty = false;

    // Check Rows & Columns
    for (let i = 0; i < 9; i++) {
      const seenRow = {};
      const seenCol = {};

      for (let j = 0; j < 9; j++) {
        const rowVal = board[i][j];
        const colVal = board[j][i];

        if (rowVal === 0) hasEmpty = true;

        if (rowVal !== 0) {
          if (seenRow[rowVal] !== undefined) {
            badCells.add(`${i}-${j}`);
            badCells.add(`${i}-${seenRow[rowVal]}`);
          } else {
            seenRow[rowVal] = j;
          }
        }

        if (colVal !== 0) {
          if (seenCol[colVal] !== undefined) {
            badCells.add(`${j}-${i}`);
            badCells.add(`${seenCol[colVal]}-${i}`);
          } else {
            seenCol[colVal] = j;
          }
        }
      }
    }

    // Check 3x3 Subgrids
    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
        const seenBox = {};
        for (let r = boxRow * 3; r < boxRow * 3 + 3; r++) {
          for (let c = boxCol * 3; c < boxCol * 3 + 3; c++) {
            const val = board[r][c];
            if (val !== 0) {
              if (seenBox[val]) {
                badCells.add(`${r}-${c}`);
                badCells.add(seenBox[val]);
              } else {
                seenBox[val] = `${r}-${c}`;
              }
            }
          }
        }
      }
    }

    setConflicts(Array.from(badCells));

    if (badCells.size > 0) {
      setMessage('Duplicate found! Check the highlighted red cells.');
    } else if (hasEmpty) {
      setMessage('No errors so far! Keep filling in the empty cells.');
    } else {
      setMessage('Congratulations! You solved the 9x9 Sudoku!');
    }
  };

  return (
    <div className="app-container">
      {/* Top Navigation Bar */}
      <nav className="navbar">
        <div className="nav-logo">Group 4 | Sudoku</div>
        <ul className="nav-menu">
          <li>
            <button
              className={`nav-link ${activePage === 'sudoku' ? 'active' : ''}`}
              onClick={() => setActivePage('sudoku')}
            >
              Play Sudoku
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${activePage === 'rules' ? 'active' : ''}`}
              onClick={() => setActivePage('rules')}
            >
              How to Play
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${activePage === 'about' ? 'active' : ''}`}
              onClick={() => setActivePage('about')}
            >
              Project Info
            </button>
          </li>
        </ul>
      </nav>

      {/* Main Content Area */}
      <main className="content">
        {activePage === 'sudoku' && (
          <section className="sudoku-section">
            <h1>9x9 Sudoku</h1>

            {/* Static vs Dynamic Placement Controls */}
            <div className="mode-controls">
              <button
                className={`btn ${mode === 'static' ? 'btn-active' : 'btn-outline'}`}
                onClick={loadStaticGame}
              >
                Static Preset
              </button>
              <button
                className={`btn ${mode === 'dynamic' ? 'btn-active' : 'btn-outline'}`}
                onClick={() => loadDynamicGame(difficulty)}
              >
                Dynamic Random Grid
              </button>

              {mode === 'dynamic' && (
                <select
                  className="difficulty-select"
                  value={difficulty}
                  onChange={(e) => {
                    const holes = Number(e.target.value);
                    setDifficulty(holes);
                    loadDynamicGame(holes);
                  }}
                >
                  <option value={30}>Easy (30 Empty)</option>
                  <option value={40}>Medium (40 Empty)</option>
                  <option value={50}>Hard (50 Empty)</option>
                </select>
              )}
            </div>

            {/* 9x9 Sudoku Grid */}
            <div className="sudoku-grid">
              {board.map((row, rIdx) => (
                <div key={rIdx} className="sudoku-row">
                  {row.map((cell, cIdx) => {
                    const isFixed = initialBoard[rIdx][cIdx] !== 0;
                    const isError = conflicts.includes(`${rIdx}-${cIdx}`);

                    return (
                      <input
                        key={`${rIdx}-${cIdx}`}
                        type="text"
                        maxLength="1"
                        value={cell === 0 ? '' : cell}
                        readOnly={isFixed}
                        onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                        className={`cell 
                          ${cIdx === 2 || cIdx === 5 ? 'border-right-thick' : ''} 
                          ${rIdx === 2 || rIdx === 5 ? 'border-bottom-thick' : ''} 
                          ${isFixed ? 'cell-fixed' : 'cell-editable'} 
                          ${isError ? 'cell-error' : ''}
                        `}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Validation Status Message */}
            {message && <div className="status-msg">{message}</div>}

            {/* Action Buttons */}
            <div className="action-buttons">
              <button className="btn btn-primary" onClick={handleCheckBoard}>
                Check Solution
              </button>
              <button className="btn btn-secondary" onClick={handleReset}>
                Reset Grid
              </button>
            </div>
          </section>
        )}

        {activePage === 'rules' && (
          <section className="info-card">
            <h2>Sudoku Rules & Features</h2>
            <ul>
              <li>Fill every empty cell in the <strong>9x9 grid</strong> with numbers from <strong>1 to 9</strong>.</li>
              <li>Each <strong>row</strong> must contain the numbers 1–9 without repetition.</li>
              <li>Each <strong>column</strong> must contain the numbers 1–9 without repetition.</li>
              <li>Each <strong>3x3 subgrid</strong> must contain the numbers 1–9 without repetition.</li>
              <li>Switch between a <strong>Static Preset</strong> or a <strong>Dynamic Random Grid</strong> at any time.</li>
            </ul>
            <button className="btn btn-primary" onClick={() => setActivePage('sudoku')}>
              Back to Game
            </button>
          </section>
        )}

        {activePage === 'about' && (
          <section className="info-card">
            <h2>Group 4 — Final React Project</h2>
            <p>
              Built using React functional components and the <code>useState</code> hook to manage 2D array board state, navigation views, dynamic puzzle generation, and real-time row/column/3x3 validation.
            </p>
            <button className="btn btn-primary" onClick={() => setActivePage('sudoku')}>
              Launch Sudoku
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;