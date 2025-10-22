const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const restartBtn = document.getElementById('restartBtn');
const resetScoreBtn = document.getElementById('resetScoreBtn');
const modeSelect = document.getElementById('mode');
const xScoreText = document.getElementById('xScore');
const oScoreText = document.getElementById('oScore');
const clickSound = document.getElementById('clickSound');
const winSound = document.getElementById('winSound');
const resetSound = document.getElementById('resetSound');

let board = Array(9).fill("");
let currentPlayer = "X";
let running = true;
let scores = { X: 0, O: 0 };
let mode = "pvp";

const winConditions = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

modeSelect.addEventListener('change', () => {
  mode = modeSelect.value;
  restartGame();
});

cells.forEach(cell => cell.addEventListener('click', cellClicked));
restartBtn.addEventListener('click', restartGame);
resetScoreBtn.addEventListener('click', resetScores);

function cellClicked() {
  const index = this.getAttribute('data-index');
  if (board[index] !== "" || !running) return;
  
  makeMove(index, currentPlayer);
  clickSound.play();

  if (mode === "ai" && running && currentPlayer === "O") {
    setTimeout(aiMove, 500);
  }
}

function makeMove(index, player) {
  board[index] = player;
  const cell = cells[index];
  cell.textContent = player;
  cell.classList.add(player.toLowerCase());
  checkWinner();
}

function checkWinner() {
  let roundWon = false;

  for (let [a, b, c] of winConditions) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      highlightCells([a, b, c]);
      roundWon = true;
      break;
    }
  }

  if (roundWon) {
    winSound.play();
    statusText.textContent = `🎉 Player ${currentPlayer} Wins!`;
    scores[currentPlayer]++;
    updateScores();
    running = false;
  } else if (!board.includes("")) {
    statusText.textContent = "😐 It's a Draw!";
    running = false;
  } else {
    currentPlayer = (currentPlayer === "X") ? "O" : "X";
    statusText.textContent = `Player ${currentPlayer}'s turn`;
  }
}

function highlightCells(indices) {
  indices.forEach(i => {
    cells[i].style.background = "rgba(255,255,255,0.4)";
    cells[i].style.boxShadow = "0 0 20px #fff";
  });
}

function restartGame() {
  resetSound.play();
  board.fill("");
  currentPlayer = "X";
  running = true;
  statusText.textContent = `Player ${currentPlayer}'s turn`;
  cells.forEach(cell => {
    cell.textContent = "";
    cell.classList.remove("x", "o");
    cell.style.background = "rgba(255,255,255,0.15)";
    cell.style.boxShadow = "none";
  });
}

function resetScores() {
  scores = { X: 0, O: 0 };
  updateScores();
  restartGame();
}

function updateScores() {
  xScoreText.textContent = scores.X;
  oScoreText.textContent = scores.O;
}

// 🤖 AI logic using Minimax
function aiMove() {
  let bestScore = -Infinity;
  let move;
  for (let i = 0; i < 9; i++) {
    if (board[i] === "") {
      board[i] = "O";
      let score = minimax(board, 0, false);
      board[i] = "";
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  makeMove(move, "O");
}

function minimax(board, depth, isMaximizing) {
  const result = checkWinState();
  if (result !== null) {
    const scoresMap = { X: -1, O: 1, draw: 0 };
    return scoresMap[result];
  }

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = "O";
        let score = minimax(board, depth + 1, false);
        board[i] = "";
        best = Math.max(score, best);
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = "X";
        let score = minimax(board, depth + 1, true);
        board[i] = "";
        best = Math.min(score, best);
      }
    }
    return best;
  }
}

function checkWinState() {
  for (let [a, b, c] of winConditions) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  if (!board.includes("")) return "draw";
  return null;
}
