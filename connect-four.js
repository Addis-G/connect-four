const BOARD_WIDTH = 7;
const BOARD_DEPTH = 6;
const board = [[], [], [], [], [], [], []];
let fallingDisk;
let fallingIntervalID;
let isThereFallingDisk = false;
let isGameOver = false;
let turn = 0;
const buildBoard = function () {
  $(".cf-board").css({
    margin: "10pxauto 0 auto",
    display: "grid",
    "grid-template-rows": `repeat(${BOARD_DEPTH + 1},40px)`,
    "grid-template-columns": `repeat(${BOARD_WIDTH},40px)`,
    gap: "10px",
    position: "relative",
  });
  for (let i = 0; i < BOARD_WIDTH; i++) {
    $(".cf-board").append(
      $(`<span class="starters"></span>`).data("col-number", i)
    );
  }
  for (let index = 0; index < BOARD_WIDTH; index++) {
    let holes = [];
    for (let i = 0; i < BOARD_DEPTH; i++) {
      let hole = { column: index, row: i };

      $(".cf-board").append(
        $(`<span class="holes"></span>`).data("hole", hole)
      );
      holes.push(hole);
    }
    //board.push(holes);
  }
};

const generateFallingDisk = function () {
  if (isGameOver) {
    return;
  }
  if (isThereFallingDisk) return;
  let colNumber = $(this).data("col-number");
  if (board[colNumber].length == 6) {
    return;
  }

  $(".starters").addClass("falling-status");
  isThereFallingDisk = true;
  const pt = $(this).position().top;
  const pl = $(this).position().left;

  fallingDisk = $(
    `<span class= ${
      turn == 0 ? "falling-disk-player1" : "falling-disk-player2"
    } ></span>`
  );
  fallingDisk.css({
    left: `${pl + 5}px`,
    top: `${pt + 5}px`,
  });
  //console.log(fallingDisk);

  fallingDisk.data("fc", {
    fallingCol: $(this).data("col-number"),
    color: turn == 0 ? "orange" : "blue",
    column: colNumber,
  });
  $(".cf-board").append(fallingDisk);
  turn = turn == 0 ? 1 : 0;
  handleFallingDisk();
};

const handleFallingDisk = () => {
  //for (let i = 0; i <= 12; i++) {
  let fc = fallingDisk.data("fc");
  fc.fallingCount = 0;
  fallingDisk.data("fc", fc);
  fallingIntervalID = setInterval(() => moveFallingDisk(), 100);
};

const moveFallingDisk = function () {
  let fc = fallingDisk.data("fc");
  fc.fallingCount = fc.fallingCount + 1;
  fallingDisk.data("fc", fc);
  if (fc.fallingCount > 12 - 2 * board[fc.fallingCol].length) {
    clearInterval(fallingIntervalID);
    board[fc.fallingCol].push({
      color: fc.color,
      colNumber: fc.fallingCol,
      rowNumber: board[fc.fallingCol].length,
    });
    isThereFallingDisk = false;
    $(".starters").removeClass("falling-status");
    //debugger;

    fc = fallingDisk.data("fc");
    fc.rowNumber = board[fc.fallingCol].length - 1;
    fallingDisk.attr("id", fc.fallingCol.toString() + fc.rowNumber.toString());
    fallingDisk.data("fc", fc);
    checkWinStart(fc.fallingCol, board[fc.fallingCol].length - 1, fc.color);
    return;
  }
  let left = fallingDisk.position().left;
  let top = fallingDisk.position().top;
  top = top + 25;
  fallingDisk.css({ left: `${left}px`, top: `${top}px` });
};

buildBoard();

$(".starters").click(generateFallingDisk);

const renderWin = function (isThereAWin) {
  console.log(isThereAWin);
  isThereAWin.winningDisks.forEach((el) =>
    $(`#${el.colNumber.toString() + el.rowNumber.toString()}`).addClass(
      "winning-disks"
    )
  );

  $(".win-banner").css("display", "flex");
  setTimeout(() => {
    $(".win-banner").css("display", "none");
  }, 1000);
};

// 6=3
// 5=2 3
// 4=1 2 3 4
// 3=0 1 2 3
// 2=0 1 2
// 1=0 1
// 0=0

const checkWinStart = function (colNumber, rowNumber, color) {
  //console.log(colNumber, rowNumber, color);
  let isThereAWin;
  if (colNumber == 6) {
    isThereAWin = checkWin(3, rowNumber, color, 1, 0);
  } else if (colNumber == 5) {
    isThereAWin = checkWin(2, rowNumber, color, 2, 0);
  } else if (colNumber == 4) {
    isThereAWin = checkWin(1, rowNumber, color, 4, 0);
  } else if (colNumber == 3) {
    isThereAWin = checkWin(0, rowNumber, color, 4, 0);
  } else if (colNumber == 2) {
    isThereAWin = checkWin(0, rowNumber, color, 3, 0);
  } else if (colNumber == 1) {
    isThereAWin = checkWin(0, rowNumber, color, 2, 0);
  } else {
    isThereAWin = checkWin(0, rowNumber, color, 1, 0);
  }
  // console.log(isThereWin);
  if (isThereAWin.isWin) {
    console.log(isThereAWin);
    renderWin(isThereAWin);
    isGameOver = true;
    return;
  }

  isThereAWin = checkColumnWin(colNumber, rowNumber, color);

  if (isThereAWin.isWin) {
    renderWin(isThereAWin);
    //   console.log(isThereWin);
    isGameOver = true;
    return;
  }
  isThereAWin = diagonalWin(colNumber, rowNumber, color);

  if (isThereAWin.isWin) {
    renderWin(isThereAWin);
    //console.log(isThereWin);
    isGameOver = true;
    return;
  }

  function checkWin(colNumber, rowNumber, color, noLoops, currentloop) {
    //debugger;
    let isAWin = checkRow({
      colNumber: colNumber,
      rowNumber: rowNumber,
      color: color,
      noIterations: 0,
      winningDisks: [],
    });
    //console.log(isAWin);
    if (!isAWin.iswin && currentloop < noLoops - 1) {
      return checkWin(
        colNumber + 1,
        rowNumber,
        color,
        noLoops,
        currentloop + 1
      );
    } else if (isAWin.iswin) {
      return {
        colNumber: colNumber,
        rowNumber: rowNumber,
        isWin: true,
        winningDisks: [...isAWin.winningDisks],
      };
    } else {
      return {
        isWin: false,
      };
    }
  }

  function checkRow({
    colNumber,
    rowNumber,
    noIterations,
    color,
    winningDisks,
  }) {
    if (
      !!board[colNumber] &&
      !!board[colNumber][rowNumber] &&
      board[colNumber][rowNumber].color == color &&
      noIterations < 4
    ) {
      winningDisks.push(board[colNumber][rowNumber]);
      return checkRow({
        colNumber: colNumber + 1,
        noIterations: noIterations + 1,
        rowNumber: rowNumber,
        color: color,
        winningDisks,
      });
    } else if (noIterations == 4) {
      return { iswin: true, winningDisks: winningDisks };
    } else {
      return { iswin: false };
    }
  }
  function checkColumnWin(colNumber, rowNumber, color) {
    const columnWinningDisks = board[colNumber].filter(
      (el, index) => el.color == color && rowNumber - index <= 3
    );

    if (columnWinningDisks.length == 4) {
      console.log(columnWinningDisks);
      return {
        colNumber: colNumber,
        rowNumber: rowNumber,
        isWin: true,
        winType: "V",
        winningDisks: [...columnWinningDisks],
      };
    } else {
      return { isWin: false };
    }
  }

  function diagonalWin(colNumber, rowNumber, color) {
    let leftDiagonals = [];
    let rightDiagonals = [];

    function diagonals() {
      board.forEach((colEl, colIndex) => {
        if (!!board[colIndex]) {
          // 1,  1,  2,  2,  3,  3
          //-1, -1, -2, -2, -3, -3
          //-1,  1, -2,  2, -3,  3
          // 1, -1,  2, -2,  3, -3
          for (let i = 0; i < 4; i++) {
            leftDiagonals.push(
              board[colIndex].filter((rowEl, rowIndex) => {
                return (
                  (rowIndex + i == rowNumber &&
                    colIndex + i == colNumber &&
                    rowEl.color == color) ||
                  (rowIndex - i == rowNumber &&
                    colIndex - i == colNumber &&
                    rowEl.color == color)
                );
              })
            );
          }
          for (let i = 0; i < 4; i++) {
            rightDiagonals.push(
              board[colIndex].filter((rowEl, rowIndex) => {
                return (
                  (rowIndex - i == rowNumber &&
                    colIndex + i == colNumber &&
                    rowEl.color == color) ||
                  (rowIndex + i == rowNumber &&
                    colIndex - i == colNumber &&
                    rowEl.color == color)
                );
              })
            );
          }
        }
      });
    }

    function validateDiagonals(
      diagArray,
      col1,
      col2,
      iteration,
      iteration2,
      diagType,
      winnerDiags
    ) {
      if (iteration == 3) {
        winnerDiags.push(diagArray[iteration2][0]);
        return {
          colNumber: colNumber,
          rowNumber: rowNumber,
          isWin: true,
          winType: "V",
          winningDisks: winnerDiags,
        };
      } else if (
        iteration < diagArray.length &&
        col1[0].colNumber + 1 == col2[0].colNumber
      ) {
        winnerDiags.push(diagArray[iteration2][0]);
        return validateDiagonals(
          diagArray,
          diagArray[iteration2],
          diagArray[iteration2 + 1],
          iteration + 1,
          iteration2 + 1,
          diagType,
          winnerDiags
        );
      } else if (
        iteration < diagArray.length &&
        col1[0].colNumber + 1 !== col2[0].colNumber
      ) {
        winnerDiags.splice(0);
        iteration = 0;
        validateDiagonals(
          diagArray,
          diagArray[iteration2],
          diagArray[iteration2 + 1],
          iteration + 1,
          iteration2 + 1,
          diagType,
          winnerDiags
        );
      } else {
        winnerDiags.splice(0);
        return {
          isWin: false,
        };
      }
    }

    diagonals();
    leftDiagonals.flat();
    leftDiagonals = leftDiagonals.filter((arrEl) => arrEl.length > 0);
    rightDiagonals.flat();
    rightDiagonals = rightDiagonals.filter((arrEl) => arrEl.length > 0);

    if (leftDiagonals.length >= 4) {
      let isThereAWin = validateDiagonals(
        leftDiagonals,
        leftDiagonals[0],
        leftDiagonals[1],
        0,
        0,
        "Left",
        []
      );
      console.log(isThereAWin.winnerDiags);
      return isThereAWin;
    }
    if (rightDiagonals.length >= 4) {
      isThereAWin = validateDiagonals(
        rightDiagonals,
        rightDiagonals[0],
        rightDiagonals[1],
        0,
        0,
        "Right",
        []
      );
      console.log(isThereAWin.winnerDiags);
      return isThereAWin;
    }
    return {
      isWin: false,
    };
  }
};

const handleResetClick = function () {
  board.forEach((colArray) => colArray.splice(0));
  $(".cf-board").children(".falling-disk-player1").remove();
  $(".cf-board").children(".falling-disk-player2").remove();
  isGameOver = false;
};
$(".reset-btn").click(handleResetClick);
