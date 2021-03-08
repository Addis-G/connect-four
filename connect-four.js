/************************************************************************************************************************************************************** 
/*                                          Connect Four developed  By Addis A Gonfa                                                                          */
/*                                              For a Synth Arcade Project                                                                                    *
/*                                         @ Virginia Tech Full Stack Cohort                                                                                  */
/*                                             Bootcamp   03/07/2021                                                                                          */
/*************************************************************************************************************************************************************/
const BOARD_WIDTH = 7;
const BOARD_DEPTH = 6;
const board = [[], [], [], [], [], [], []];
let fallingDisk;
let fallingIntervalID;
let isThereFallingDisk = false;
let isGameOver = false;
let gameMode = 1; // 0 vs computer 1= vs another human
let turn = 0;
let firstPlayer;
let secondPlayer;

//In my connect four game I use the board(6 X 7) array to store the information of disks that are simulated to be falling when clicking the '.starters' class square span elements.
//The span elements with class 'holes' are added to the screen on the game just for visualization purposes. The ones I really keep track of their status is the falling disks which are 'orange' &&
//"blue" disks which are overlayed on the 'holes'.
//
//In this function I am drawing the 6X7 and the starers row. Please click on the Squared blocks to play the game.
const buildBoard = function () {
  $(".cf-board").css({
    margin: "10px auto 0 auto",
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
  }
};
//The function generates the falling disks. It checks if game is over, if we have 6 rows disks already in the column and so on...
const generateFallingDisk = function () {
  if (isGameOver) {
    return;
  }
  if (isThereFallingDisk) return;

  const colNumber = $(this).data("col-number");

  if (board[colNumber].length == 6) {
    return;
  }

  $(".starters").addClass("falling-status");
  isThereFallingDisk = true;
  const pt = $(this).position().top;
  const pl = $(this).position().left;

  fallingDisk = $(
    `<span class= ${
      turn == 0 ? "falling-disk-player1" : "falling-disk-player2" //These are css classes that have backgrounds of blue or orange
    } ></span>`
  );
  fallingDisk.css({
    left: `${pl + 5}px`,
    top: `${pt + 5}px`,
  });

  fallingDisk.data("fd", {
    fallingCol: $(this).data("col-number"),
    color: turn == 0 ? "orange" : "blue",
    column: colNumber,
  });
  $(".cf-board").append(fallingDisk);
  turn = turn == 0 ? 1 : 0;
  handleFallingDisk();
};

const handleFallingDisk = () => {
  let fd = fallingDisk.data("fd");
  fd.fallingCount = 0;
  fallingDisk.data("fd", fd);
  fallingIntervalID = setInterval(() => moveFallingDisk(), 100);
};

const moveFallingDisk = function () {
  let fd = fallingDisk.data("fd"); //fd refers to data stored about the moving down disk(column #, color )
  fd.fallingCount = fd.fallingCount + 1;
  fallingDisk.data("fd", fd);
  if (fd.fallingCount > 12 - 2 * board[fd.fallingCol].length) {
    clearInterval(fallingIntervalID);
    board[fd.fallingCol].push({
      color: fd.color,
      colNumber: fd.fallingCol,
      rowNumber: board[fd.fallingCol].length,
    });
    isThereFallingDisk = false;
    $(".starters").removeClass("falling-status");
    $(`.players.player-1`).toggleClass("player-marker");
    $(`.players.player-2`).toggleClass("player-marker");
    //debugger;

    fd = fallingDisk.data("fd");
    fd.rowNumber = board[fd.fallingCol].length - 1;
    fallingDisk.attr("id", fd.fallingCol.toString() + fd.rowNumber.toString());
    fallingDisk.data("fd", fd); //store the final position and color of the falling disk
    checkWinStart(fd.fallingCol, board[fd.fallingCol].length - 1, fd.color); //go check if there is a wining disk sequence. Starting from rows, Columns, Diagonals

    const countOfboard = board.reduce(function (acc, el) {
      //calculate the number of disks on the interface from the board.
      return !!acc ? +acc + el.length : 0 + el.length;
    }, 0);

    if (!isGameOver && countOfboard == 42) {
      //check if it is a draw
      isGameOver = true;

      $(".win-banner").text("Draw!!"); //show win or draw
      $(".win-banner").css("display", "flex");
      return;
    }

    if (gameMode == 0 && turn == 1) {
      let randomNo = getRandomNumber();

      $(`.starters:nth-child(${randomNo})`).click(); // if the oponent is the computer simulate a click onf the starter disks by generating a random number between 1-6
      generateFallingDisk();
    }

    return;
  }
  let left = fallingDisk.position().left;
  let top = fallingDisk.position().top;
  top = top + 25;
  fallingDisk.css({ left: `${left}px`, top: `${top}px` });
};

function getRandomNumber() {
  //recursive random column generator using the javascript Math.random() function
  let randomNo;
  randomNo = Math.floor(Math.random() * 10);
  if (randomNo >= 1 && randomNo <= 6 && board[randomNo].length < 6) {
    return randomNo;
  } else return getRandomNumber();
}
//This is function renders a win once a win is determined. The input for this function has is an object that has an array of the winning disks
// column and row information
const renderWin = function (isThereAWin) {
  isThereAWin.winningDisks.forEach((el) =>
    $(`#${el.colNumber.toString() + el.rowNumber.toString()}`).addClass(
      "winning-disks"
    )
  );
  $(".win-banner").css("display", "flex");
};

// 6=3                          //Row wins are searched using a recursive sliding window. If the last falling disk is on column disk it will do a one round of check using disks from 3 to 6.
// 5=2 3                        // for a drop on 5th column 2 checks one from 2 to 5 and another one from 3 to 5
// 4=1 2 3                     // for a 4th column drop make 3 loops of checks from 1(1-4), 2(2-5), 3(3-6) , 4 each time moving the sliding window by one etc
// 3=0 1 2 3
// 2=0 1 2
// 1=0 1
// 0=0

const checkWinStart = function (colNumber, rowNumber, color) {
  let isThereAWin;
  if (colNumber == 6) {
    isThereAWin = checkRowWin(3, rowNumber, color, 1, 0);
  } else if (colNumber == 5) {
    isThereAWin = checkRowWin(2, rowNumber, color, 2, 0);
  } else if (colNumber == 4) {
    isThereAWin = checkRowWin(1, rowNumber, color, 4, 0);
  } else if (colNumber == 3) {
    isThereAWin = checkRowWin(0, rowNumber, color, 4, 0);
  } else if (colNumber == 2) {
    isThereAWin = checkRowWin(0, rowNumber, color, 3, 0);
  } else if (colNumber == 1) {
    isThereAWin = checkRowWin(0, rowNumber, color, 2, 0);
  } else {
    isThereAWin = checkRowWin(0, rowNumber, color, 1, 0);
  }
  if (isThereAWin.isWin) {
    renderWin(isThereAWin);
    isGameOver = true;
    return;
  }

  isThereAWin = checkColumnWin(colNumber, rowNumber, color);

  if (isThereAWin.isWin) {
    renderWin(isThereAWin);
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

  //checks a row win after a dropped disk is positioned in its last location
  //Recursive function, I believe this function can be replaced by the array functions.
  //I have to figure that out. For now it is a recursive function
  function checkRowWin(colNumber, rowNumber, color, noLoops, currentloop) {
    let isAWin = checkRow({
      colNumber: colNumber,
      rowNumber: rowNumber,
      color: color,
      noIterations: 0,
      winningDisks: [],
    });

    if (!isAWin.iswin && currentloop < noLoops - 1) {
      return checkRowWin(
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
  // A helper function for the above function, this one is also a recursive function. Checks for one row only.
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

  // This function checks for a column win. Used a  filter function to find out if there is a win in a clumn.
  function checkColumnWin(colNumber, rowNumber, color) {
    const columnWinningDisks = board[colNumber].filter(
      (el, index) => el.color == color && rowNumber - index <= 3
    );

    if (columnWinningDisks.length == 4) {
      //console.log(columnWinningDisks);
      return {
        colNumber: colNumber,
        rowNumber: rowNumber,
        isWin: true,
        winningDisks: [...columnWinningDisks],
      };
    } else {
      return { isWin: false };
    }
  }
  // This function and recursively check if there is a digonal win. The disks on the left or right digonals of dropped disk are collected by this function recursively
  //and sent down to the next functio to check if there are a win.

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
      winnerDiags
    ) {
      if (iteration == 3) {
        winnerDiags.push(diagArray[iteration2][0]);
        return {
          colNumber: colNumber,
          rowNumber: rowNumber,
          isWin: true,
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
        []
      );

      return isThereAWin;
    }
    if (rightDiagonals.length >= 4) {
      isThereAWin = validateDiagonals(
        rightDiagonals,
        rightDiagonals[0],
        rightDiagonals[1],
        0,
        0,
        []
      );
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
  $(".win-banner").css("display", "none");
  isGameOver = false;
};

const handleInputChange = function () {
  $(this).siblings("h5").addClass("required-msg-fld-hidden");
};

const handlePlayerOptionRadioBtnChangeHuman = function () {
  $(this).is(":checked")
    ? $("#input-player-2").attr("disabled", false)
    : $("#input-player-2").attr("disabled", true);
};
const handlePlayerOptionRadioBtnChangeComputer = function () {
  $(this).is(":checked")
    ? $("#input-player-2").attr("disabled", true)
    : $("#input-player-2").attr("disabled", false);
};

const handleSubmitUserOption = function (e) {
  e.preventDefault();
  if (!$("#player-1").val()) {
    $(".container-first-player-name  h5").removeClass(
      "required-msg-fld-hidden"
    );
    $(".container-first-player-name  h5").addClass("required-msg-fld");
  }

  if (
    !$("#input-player-2").val() &&
    $("#option-player-2-radio").is(":checked")
  ) {
    $(".container-human-option h5").removeClass("required-msg-fld-hidden");
    $(".container-human-option h5").addClass("required-msg-fld");
    return;
  }

  firstPlayer = $("#player-1").val();
  secondPlayer = $("#input-player-2").val();

  if ($("#option-player-2-radio").is(":checked")) {
    gameMode = 1;
  } else {
    gameMode = 0;
  }
  $(".players.player-1").text(firstPlayer);

  gameMode == 0
    ? $(".players.player-2").text("Computer")
    : $(".players.player-2").text(secondPlayer);

  $(".modal").toggleClass("open");
};

const handleOptionBtnClick = function () {
  $(".modal").addClass("open");
};

buildBoard();

$(".container-first-player-name  h5").addClass("required-msg-fld-hidden");
$(".container-human-option  h5").addClass("required-msg-fld-hidden");
$(`.form-container input[type="text"]`).on("keypress", handleInputChange);
$(".reset-btn").click(handleResetClick);
$(`.players:before player - 1`).addClass("visible");
$(".starters").click(generateFallingDisk);
$(`#option-player-2-radio`).on("change", handlePlayerOptionRadioBtnChangeHuman);
$(`#option-player-computer`).on(
  "change",
  handlePlayerOptionRadioBtnChangeComputer
);
$("#submit-player-option").click(handleSubmitUserOption);
$(".options-btn").click(handleOptionBtnClick);
