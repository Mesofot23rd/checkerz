///////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
//////////// UTIL FUNCTIONS  ////////////

function isEven(Number) {
    return Number % 2 === 0 ? true : false;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function reset_NoOf_MovesTillDraw() {
    NoOf_MovesTillDraw = 32;
}

function getHandleForPosition({ row, col }) {
    const playable_SqrsMap = {
        "0,1": 0, "0,3": 1, "0,5": 2, "0,7": 3,
        "1,0": 4, "1,2": 5, "1,4": 6, "1,6": 7,
        "2,1": 8, "2,3": 9, "2,5": 10, "2,7": 11,
        "3,0": 12, "3,2": 13, "3,4": 14, "3,6": 15,
        "4,1": 16, "4,3": 17, "4,5": 18, "4,7": 19,
        "5,0": 20, "5,2": 21, "5,4": 22, "5,6": 23,
        "6,1": 24, "6,3": 25, "6,5": 26, "6,7": 27,
        "7,0": 28, "7,2": 29, "7,4": 30, "7,6": 31,
    };
    // console.log(playable_SqrsMap[`${row},${col}`])
    return playable_SqrsMap[`${row},${col}`];
}

// function createBoardCopy(Board) {
// }
///////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
let BOARD = [];
let HISTORY = [];

const playable_squarez = document.querySelectorAll(".playable_square");
const playable_BoardSquares = [
    { row: 0, col: 1 }, { row: 0, col: 3 }, { row: 0, col: 5 }, { row: 0, col: 7 },
    { row: 1, col: 0 }, { row: 1, col: 2 }, { row: 1, col: 4 }, { row: 1, col: 6 },
    { row: 2, col: 1 }, { row: 2, col: 3 }, { row: 2, col: 5 }, { row: 2, col: 7 },
    { row: 3, col: 0 }, { row: 3, col: 2 }, { row: 3, col: 4 }, { row: 3, col: 6 },
    { row: 4, col: 1 }, { row: 4, col: 3 }, { row: 4, col: 5 }, { row: 4, col: 7 },
    { row: 5, col: 0 }, { row: 5, col: 2 }, { row: 5, col: 4 }, { row: 5, col: 6 },
    { row: 6, col: 1 }, { row: 6, col: 3 }, { row: 6, col: 5 }, { row: 6, col: 7 },
    { row: 7, col: 0 }, { row: 7, col: 2 }, { row: 7, col: 4 }, { row: 7, col: 6 },
];

const PLAYER_1 = {
    name: "AI",
    validMoves: [],
    NoOf_PiecesThatCanMove: 4,
    NoOf_Pieces: 12,
    makeMove(Board) {
        // AI_makeRandomMove(Board);
        AI_makeStrategicMove(Board);
        clearHighlights();
        updateGameStatus(Board, PLAYER_1, PLAYER_2);
        switchPlayer();
        renderBoard(Board);
        checkGameOver();
    },
};

const PLAYER_2 = {
    name: "You",
    validMoves: [],
    NoOf_PiecesThatCanMove: 4,
    NoOf_Pieces: 12,
};

const PENDING_GAMES = [];
let CURRENT_PLAYER = 2;
let NoOf_MovesTillDraw = 32;

///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
//////////// HIGHLIGHTS ////////////

/*
 * @brief:removes highlights from the SELECTEDSQUARE
 */
function clearHighlights() {
    const Dots = document.querySelectorAll("Dot");
    if (Dots) {
        Dots.forEach((Dot) => {
            Dot.remove();
        });
    }

    playable_squarez.forEach((playable_square) => {
        // let pc = playable_square.querySelector("#Piece");
        playable_square.style.backgroundColor = "";
        playable_square.style.border = "none";
    });
}

/*
 * @brief:Highlights Valid moves of the clicked square
 * @param[validMoves]:an array which is a property of SELECTEDSQUARE
 */
function highlightValidMove(validMove_Handle) {
    //changes SQUARE color to cyan
    // const Handle = playable_squarez[getHandleForPosition(validMove)]
    // validMove_Handle.style.backgroundColor = "cyan";
}

/*
 * @brief:Highlights CaptureMoves
 * @param[capturePath]:an ARRAY of containing the path which a ......
 */
function highlightCaptureMove(capturePath) {
    //displays a red dot at the center of the SQUARE
    for (let Move of capturePath) {
        const Handle = playable_squarez[getHandleForPosition(Move[1])];

        const DOT = document.createElement("div"); //capture Move Indicator
        DOT.className = "Dot";

        Object.assign(DOT.style, {
            height: "20%",
            width: "20%",
            borderRadius: "50%",
            backgroundColor: "red",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
        });
        Handle.appendChild(DOT);
    }

    // renderBoard[BOARD];
}
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
//////////// MOVES ////////////
/*
 * @brief:returns squares that are diagonal to Square
 * @param[pieceId]:is the Board_Piece of which we are to retun diagonal squares of
 * @param[onSquare]:is the Board_Position of which we are to return diagonal squares of
 */
function getDiagonalMoves(Board, pieceId, onSquare) {
    let diagMoves = [];
    let directions = null;

    // assign appropriate direction  of diagonal moves
    if (pieceId === 3 || pieceId === 4) {
        directions = [[-1, -1], [-1, 1], [1, -1], [1, 1],]; //all_4 diagonal directions[For KING Pieces]
    } else if (pieceId === 1) {
        directions = [[1, -1], [1, 1],]; //2_front diagonal directions going DOWN[For AI Pieces]
    } else if (pieceId === 2) {
        directions = [[-1, -1], [-1, 1],]; //2_front diagonal directions going UP[For HUMAN Pieces]
    }

    //calculate the exact co-ordinates[[row][col]]
    for (let dir of directions) {
        const nRow = onSquare.row + dir[0];
        const nCol = onSquare.col + dir[1];

        // check if co-ordinates are within bound
        if (nRow >= 0 && nRow < 8 && nCol >= 0 && nCol < 8) {
            const dmId = Board[nRow][nCol];
            if (dmId === 0 || Math.ceil(dmId % 2) !== Math.ceil(pieceId % 2)) {
                diagMoves.push({ row: nRow, col: nCol });
            }
        }
    }
    return diagMoves;
}

/*
 * @brief:searches BOARD for captureMoves
 * @param[forPiece]:is the Board_Piece of which we are to find captureMoves OF
 * @param[cur_piecePos]:is the Board_Square of which we are to find captureMoves starting FROM
 * @param[opp_piecePos]:is the Board_Square that is diagonal to cur_piecePos and has opponent piece
 * @param[orgPath]:helps us track the path till the current position for multiple captures
 *
 * [if the next-diagonal-square from diagonalMove is empty then we add[diagonalMove && next-diagonal-square] to captureMoves ARRAY]
 */
function getCaptureMoves(Board, VALIDMOVES, forPiece, cur_piecePos, opp_piecePos, orgPath,) {
    //get position of the square after opponent piece position
    const nRow = opp_piecePos.row + (opp_piecePos.row - cur_piecePos.row);
    const nCol = opp_piecePos.col + (opp_piecePos.col - cur_piecePos.col);

    // Check bounds
    if (nRow >= 0 && nRow < 8 && nCol >= 0 && nCol < 8) {
        const pieceId = Board[forPiece.row][forPiece.col];
        const oppPieceId = Board[opp_piecePos.row][opp_piecePos.col];
        const nxtPosId = Board[nRow][nCol]; //Id of square after opponent piece

        if (
            nxtPosId === 0 &&
            oppPieceId > 0 &&
            Math.ceil(oppPieceId % 2) !== Math.ceil(pieceId % 2)
        ) {
            let repeat = false;
            // console.log(orgPath)
            for (let [cp, nm] of orgPath) {
                // console.log(orgPath)
                if (
                    opp_piecePos.row === cp.row &&
                    opp_piecePos.col === cp.col &&
                    nm.row === nRow &&
                    nm.col === nCol
                ) {
                    // console.log("repeating...", opp_piecePos.row, cp.row, ":", opp_piecePos.col, cp.col, "_", nm.row, nRow, ":", nm.col, nCol)
                    repeat = true;
                    // console.log(repeat, [cp, opp_piecePos], [nm, { nRow, nCol }])
                    break;
                }
            }

            if (repeat) return true;

            let Path = [...orgPath];
            Path.push([opp_piecePos, { row: nRow, col: nCol }]);

            //check for next possible capture[]
            let DM = getDiagonalMoves(Board, pieceId, { row: nRow, col: nCol });
            let eoc = 0;

            for (let dm of DM) {
                const dmId = Board[dm.row][dm.col];

                if (Math.ceil(dmId % 2) === Math.ceil(pieceId % 2) || dmId === 0 || (dm.row === opp_piecePos.row && dm.col === opp_piecePos.col)) {
                    eoc++;
                    continue;
                } else if (Math.ceil(dmId % 2) !== Math.ceil(pieceId % 2) && dmId !== 0) {
                    // console.log("extra capturess ", dmId)
                    if (getCaptureMoves(Board, VALIDMOVES, forPiece, { row: nRow, col: nCol }, dm, Path,)) {
                        eoc++;
                    }
                }
            }

            if (Path.length && eoc === DM.length) {
                VALIDMOVES.push([forPiece, Path]);
            }

            return false;
        } else {
            return true;
        }
    } else {
        return true;
    }
}

/*
 * @brief:checks if Board_Piece has any validMoves||captureMoves
 * @param[ofPiece]:the Board_Piece we find validMoves for
 * @param[getCaptures]:if TRUE _ dictates if the function should return capture moves only
 */
function getValidMoves_forPiece(Board, ofPiece, getCaptures = false) {
    const pieceId = Board[ofPiece.row][ofPiece.col];
    if (pieceId === 0) {
        return;
    }

    // console.log(ofPiece)
    let diagonalMoves = getDiagonalMoves(Board, pieceId, ofPiece);
    let VALIDMOVES = [];

    for (let diagonalMove of diagonalMoves) {
        const dmId = Board[diagonalMove.row][diagonalMove.col];

        //id Diagonal_Move is empty then that is a Valid_Move
        if (dmId === 0 && getCaptures === false) {
            VALIDMOVES.push([ofPiece, diagonalMove]);
        }
        //if Diagonal_Move ID is same as selectedSquare then that is not Valid_move
        else if (Math.ceil(dmId % 2) === Math.ceil(pieceId % 2)) {
            continue;
        }
        //if Diagonal_Move ID is not same as selectedSquare ID check for valid Capture_Moves
        else if (Math.ceil(dmId % 2) !== Math.ceil(pieceId % 2)) {
            getCaptureMoves(Board, VALIDMOVES, ofPiece, ofPiece, diagonalMove, []);
        }
    }

    return VALIDMOVES;
}

/*
 *@brief:returns all valid Moves of a specific player
 *@param[playerId]:the player to which we return all valid moves for
 */
function getValidMoves_forPlayer(Board, playerId) {
    let allValidMoves = [];
    for (let playable_BoardSquare of playable_BoardSquares) {
        const pieceId = Board[playable_BoardSquare.row][playable_BoardSquare.col];

        if (pieceId !== 0 && Math.ceil(pieceId % 2) === Math.ceil(playerId % 2)) {
            let VM = getValidMoves_forPiece(Board, playable_BoardSquare);
            if (VM.length) {
                allValidMoves.push(...VM);
            }
        }
    }
    return allValidMoves;
}
/////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////
//////////// PIECE_ACTIONS ////////////
/*
 *@brief:moves a piece from one position on the board to another
 *@param[fromPos]:the position at which the Piece is currently located on the BOARD
 *@param[toPos]:the position to which fromPos should end up on the BOARD
 */
function movePiece(Board, fromPos, toPos) {
    //if MOVE is captureMove[make sure to capture pieces]
    if (Array.isArray(toPos)) {
        let currentPiecePos = fromPos;

        for (let mv of toPos) {
            Board[mv[0].row][mv[0].col] = 0; //remove captured piece
            movePiece(Board, currentPiecePos, mv[1]);
            currentPiecePos = mv[1];
        }
    }
    //if MOVE is normalMove[just move piece]
    else {
        let pieceId = Board[fromPos.row][fromPos.col];

        //Check for promotion
        if (pieceId === 1 && toPos.row === 7) {
            pieceId = 3;
        }
        if (pieceId === 2 && toPos.row === 0) {
            pieceId = 4;
        }

        Board[toPos.row][toPos.col] = pieceId; //add pece to new position
        Board[fromPos.row][fromPos.col] = 0; //remove pece at old position
    }
}

///////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
//////////// PIECE ////////////

function addClickEventToMoves(Board, MOVES) {
    for (let [PIECE, MOVE] of MOVES) {
        //if is ARR:captureMove
        if (Array.isArray(MOVE)) {
            highlightCaptureMove(MOVE);

            //add an event to the last square of each capturepath
            let DS = MOVE[MOVE.length - 1][1]; //DS[DestinationSquare]
            const Handle = playable_squarez[getHandleForPosition(DS)];

            Handle.onclick = function() {
                movePiece(Board, PIECE, MOVE);
                clearHighlights();
                reset_NoOf_MovesTillDraw();
                updateGameStatus(Board, PLAYER_1, PLAYER_2);
                switchPlayer();
                renderBoard(Board);
                checkGameOver();
            };
        }
        //if is OBJ:normalMove
        else if (typeof MOVE === "object") {
            const Handle = playable_squarez[getHandleForPosition(MOVE)];
            highlightValidMove(Handle);

            //add event listeners on Squares that are valid Moves
            Handle.onclick = function() {
                movePiece(Board, PIECE, MOVE);
                clearHighlights();
                NoOf_MovesTillDraw--;
                updateGameStatus(Board, PLAYER_1, PLAYER_2);
                switchPlayer();
                renderBoard(Board);
                checkGameOver();
            };
        }
    }
}


///////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
//////////// BOARD_UTILITIES ////////////
function initialiseBoard() {
    BOARD = [];
    BOARD = [
        [0, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 0, 1, 0],
        [0, 1, 0, 1, 0, 1, 0, 1],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [2, 0, 2, 0, 2, 0, 2, 0],
        [0, 2, 0, 2, 0, 2, 0, 2],
        [2, 0, 2, 0, 2, 0, 2, 0],
    ];
    if (!BOARD) {
        console.error("Could not initialise board");
    }
    updateGameStatus(BOARD, PLAYER_1, PLAYER_2);
}

/*
 *@brief:visualy presents the boardPieces to the ${USER}
 */
function renderBoard(Board) {
    let MustCapture = false;
    const captureMoves = [];

    if (CURRENT_PLAYER === 2) {
        let validMoves = getValidMoves_forPlayer(Board, 2);

        //seperate captureMoves 
        for (let Move of validMoves) {
            if (Array.isArray(Move[1])) {
                captureMoves.push(Move);
            }
        }

        if (captureMoves.length) {
            MustCapture = true;
            for (let Move of captureMoves) {
                const mv0Handle = playable_squarez[getHandleForPosition(Move[0])];
                // console.log(getHandleForPosition(Move[1]))
                mv0Handle.style.border = "3px solid";
                mv0Handle.style.borderColor = "yellow";
                setTimeout(() => {
                    mv0Handle.style.borderColor = "#F9EE4D";
                }, 300);
            }

            if (captureMoves.length === 1) { addClickEventToMoves(Board, captureMoves); }
        }
    }

    for (let i = 0; i < 32; i++) {
        const Handle = playable_squarez[getHandleForPosition(playable_BoardSquares[i])];
        const pieceId = Board[playable_BoardSquares[i].row][playable_BoardSquares[i].col];

        if (Handle.hasChildNodes()) {
            Handle.removeChild(Handle.firstChild);
        }
        Handle.onclick = null;

        const PIECE = document.createElement("div");
        PIECE.id = "Piece";

        Object.assign(PIECE.style, {
            height: "80%",
            width: "80%",
            borderRadius: "50%",
            // backgroundColor: SQR.color,
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.4)",
            //for king CROWN when piece is promoted
            backgroundPosition: "center",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
        });

        if (pieceId === 1 || pieceId === 3) {
            //Assign appropriate colors for Player 1[GAME_AI]
            PIECE.style.backgroundColor = "#EAE8DF";
            if (pieceId === 3) {
                PIECE.style.backgroundImage = "url('images/whitepiece_crown.png')";
            }

        } else if (pieceId === 2 || pieceId === 4) {
            //Assign appropriate colors for Player 2[HUMAN_PLAYER]
            PIECE.style.backgroundColor = "#393330";
            if (pieceId === 4) {
                PIECE.style.backgroundImage = "url('images/blackpiece_crown.png')";
            }


            if (CURRENT_PLAYER === 2) {
                //For Player_2 pieces,add a click event
                PIECE.onclick = () => {
                    if (pieceId === 1 || pieceId === 3) {
                        return;
                    }

                    clearHighlights();
                    let VM = getValidMoves_forPiece(Board, playable_BoardSquares[i], MustCapture);

                    if (VM.length) {
                        //if THIS_PIECE has any validMoves[highlight It]
                        Handle.style.backgroundColor = "green";
                        addClickEventToMoves(Board, VM);
                    } else {
                        //if THIS_PIECE doesnt have any validMoves[flash warning]

                        if (MustCapture) {
                            for (let Move of captureMoves) {
                                const mv0Handle = playable_squarez[getHandleForPosition(Move[0])];
                                // console.log(getHandleForPosition(Move[1]))
                                mv0Handle.style.border = "3px solid";
                                mv0Handle.style.borderColor = "yellow";
                                setTimeout(() => {
                                    mv0Handle.style.borderColor = "#F9EE4D";
                                }, 300);
                            }

                            if (captureMoves.length === 1) { addClickEventToMoves(Board, captureMoves); }
                        }
                        else { Handle.style.backgroundColor = "red"; }
                        setTimeout(() => {
                            Handle.style.backgroundColor = "";
                        }, 300);
                    }
                }
            }
        }

        if (pieceId === 0) {
            // Handle.style.backgroundColor = BOARD_COLORS[selected_BoardColors][0]
            if (Handle.hasChildNodes()) {
                // console.log(Handle.id)
                Handle.removeChild(Handle.firstChild);
            }
        } else {
            Handle.appendChild(PIECE);
        }
    }
    displayCounter();
}

//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
//////////// GAME_UTILITIES ////////////

export function startGame() {
    initialiseBoard();
    renderBoard(BOARD);
}
// module.exports = { startGame };

//*********************************************************************************//
function checkGameOver() {
    if (
        (PLAYER_1.NoOf_Pieces > 0 && PLAYER_2.NoOf_Pieces === 0) ||
        PLAYER_2.NoOf_PiecesThatCanMove === 0
    ) {
        // PLAYER_2_LOSES
        if (Sounds) {
            lose_Sound.play();
        }
        console.log("You lose");
        // gameover[display "you lost"]
        // change stats
        // return true;
    } else if (
        (PLAYER_2.NoOf_Pieces > 0 && PLAYER_1.NoOf_Pieces === 0) ||
        PLAYER_1.NoOf_PiecesThatCanMove === 0
    ) {
        // PLAYER_2_WINS
        if (Sounds) {
            if (selected_Level > 6) {
                winmaster_Sound.play();
            } else {
                win_Sound.play();
            }
        }
        console.log("You win");
        // selected_Level++;
        //
        // gameover[display "you won"]
        // change stats
        // return true;
    } else if (NoOf_MovesTillDraw === 0) {
        //DRAW
        if (Sounds) {
            draw_Sound.play();
        }
        console.log("Draw");
        //gameover[display "thats a draw"]
        //change stats
        // return true;
    }
}

// Switch current player
function switchPlayer() {
    CURRENT_PLAYER = CURRENT_PLAYER === 1 ? 2 : 1;
    // AI move if current player is AI
    if (CURRENT_PLAYER === 1) {
        setTimeout(() => {
            PLAYER_1.makeMove(BOARD);
        }, 300);
    }

}

//*********************************************************************************//
function updateGameStatus(Board, Player_1, Player_2) {
    Player_1.NoOf_Pieces = 0;
    Player_2.NoOf_Pieces = 0;
    Player_1.NoOf_PiecesThatCanMove = 0;
    Player_2.NoOf_PiecesThatCanMove = 0;

    for (let playable_BoardSquare of playable_BoardSquares) {
        const pieceId = Board[playable_BoardSquare.row][playable_BoardSquare.col];
        if (pieceId === 0) {
            continue;
        }

        // console.log(playable_BoardSquare.row, playable_BoardSquare.col)
        let DM = getDiagonalMoves(Board, pieceId, playable_BoardSquare);

        if (pieceId === 1 || pieceId === 3) {
            Player_1.NoOf_Pieces++;
            // check if piece has validMoves
            if (DM.length) {
                Player_1.NoOf_PiecesThatCanMove++;
            }
        } else if (pieceId === 2 || pieceId === 4) {
            Player_2.NoOf_Pieces++;
            // check if piece has validMoves
            if (DM.length) {
                Player_2.NoOf_PiecesThatCanMove++;
            }
        }
    }
}


//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
//////////// GAME_AI ////////////
function AI_makeStrategicMove(Board) {
    let Depth = 9;
    // Determine search depth dynamically
    if ((PLAYER_1.NoOf_Pieces + PLAYER_2.NoOf_Pieces) <= 6) {
        Depth += 5;// Increased depth for endgame
    } else if ((PLAYER_1.NoOf_Pieces + PLAYER_2.NoOf_Pieces) <= 10) {
        Depth += 2;// Increased depth for mid-game
    }
    // console.log(Depth)

    let validMoves = getValidMoves_forPlayer(Board, 1)
    if (validMoves.length === 0) {
        return;
    }

    let bestMove = PLAYER_1.validMoves[0];
    let bestValue = -Infinity;
    let ALPHA = -Infinity;
    let BETA = Infinity;


    //seperate captureMoves from normalMoves
    const captureMoves = [];
    const normalMoves = [];
    for (let Move of validMoves) {
        if (Array.isArray(Move[1])) {
            captureMoves.push(Move);
        } else {
            normalMoves.push(Move);
        }
    }

    if (captureMoves.length) {
        validMoves = [];
        validMoves = captureMoves;
    } else {
        validMoves = [];
        validMoves = normalMoves;

    }

    // Shuffle moves to add more variety to gameplay
    validMoves = shuffleArray(validMoves);
    if (validMoves.length === 1) {
        bestMove = validMoves[0];
    }
    else {
        for (let move of validMoves) {
            const vBOARD = Board.map((arr) => [...arr]);
            movePiece(vBOARD, move[0], move[1], true);
            const moveValue = minimax(vBOARD, Depth - 1, ALPHA, BETA, false,);
            // console.log(moveValue)
            if (moveValue > bestValue) {
                bestValue = moveValue;
                bestMove = move;
            }
            ALPHA = Math.max(ALPHA, bestValue);

            if (BETA <= ALPHA) break; // Beta cutoff
        }
    }

    movePiece(BOARD, bestMove[0], bestMove[1]); //apply best move to the real board
}
//*********************************************************************************//
/**
 * Minimax algorithm with alpha-beta pruning
 */
function minimax(Board, depth, alpha, beta, isAIIurn) {

    if (depth === 0 || depth < 0) {
        return evaluateBoard(Board);
    }

    //Keep tab of each player's pieces
    let P1_NoOf_Pieces = 0, P2_NoOf_Pieces = 0;
    for (let playable_BoardSquare of playable_BoardSquares) {
        const pieceId = Board[playable_BoardSquare.row][playable_BoardSquare.col];
        if (pieceId === 1 || pieceId === 3) {
            P1_NoOf_Pieces++;
        } else if (pieceId === 2 || pieceId === 4) {
            P2_NoOf_Pieces++;
        }
    }

    // Check for win/loss conditions at current depth[if player has pieces left]
    if (P1_NoOf_Pieces === 0) { return -1000 }//p2 wins
    if (P2_NoOf_Pieces === 0) { return 1000 }//p1 wins

    //Get current players validMoves
    let validMoves;
    if (isAIIurn) { validMoves = getValidMoves_forPlayer(Board, 1) }
    if (!isAIIurn) { validMoves = getValidMoves_forPlayer(Board, 2) }


    //seperate captureMoves from normalMoves
    const captureMoves = [];
    const normalMoves = [];
    for (let Move of validMoves) {
        if (Array.isArray(Move[1])) {
            captureMoves.push(Move);
        } else {
            normalMoves.push(Move);
        }
    }

    if (captureMoves.length) {
        validMoves = [];
        validMoves = captureMoves;
    } else {
        validMoves = [];
        validMoves = normalMoves;

    }


    // Check for win/loss conditions at current depth[if player can Move]
    if (validMoves.length === 0) {
        return isAIIurn ? -1000 : 1000; // Loss/Win
    }

    // Shuffle moves to add more variety to gameplay
    validMoves = shuffleArray(validMoves);

    if (isAIIurn) {
        // Maximizing player (PLAYER_1[AI])
        let maxScore = -Infinity;

        for (let move of validMoves) {
            const vBOARD = Board.map((arr) => [...arr]);
            movePiece(vBOARD, move[0], move[1], true);
            const SCORE = minimax(vBOARD, depth - 1, alpha, beta, false,);

            maxScore = Math.max(maxScore, SCORE);
            alpha = Math.max(alpha, maxScore);

            if (beta <= alpha) break; // Beta cutoff
        }

        return maxScore;
    } else {
        //Minimizing player (PLAYER_2[Human])
        let minScore = Infinity;

        for (let move of validMoves) {
            const vBOARD = Board.map((arr) => [...arr]);
            movePiece(vBOARD, move[0], move[1], true);
            const score = minimax(vBOARD, depth - 1, alpha, beta, true,);

            minScore = Math.min(minScore, score);
            beta = Math.min(beta, minScore);

            if (beta <= alpha) break; // Alpha cutoff
        }

        return minScore;
    }
}

/**
 * Evaluate the board position for AI benefit
 * Positive score = AI advantage, Negative = Human advantage
 */
function evaluateBoard(Board) {
    let SCORE = 0;
    let P1_pieces = 0, P2_pieces = 0;
    let P1_kings = 0, P2_kings = 0;
    // let totalPieces;

    for (let { row, col } of playable_BoardSquares) {
        const pieceId = Board[row][col];
        switch (pieceId) {
            case 1:
                P1_pieces++;
                break;
            case 2:
                P2_pieces++;
                break;
            case 3:
                P1_kings++;
                break;
            case 4:
                P2_kings++;
                break;
        }

        // Positional advantages
        if (pieceId === 1 || pieceId === 3) {
            if (pieceId === 1) SCORE += row * 5; // Bonus for Piece moving down[Forward progression]
            if (row === 0) SCORE += 5; // Back row protection
            if (col >= 2 && col <= 5) SCORE += 2; // Center control (columns 2-5)

            // King safety/mobility (discourage kings from being on the edge unless necessary)
            if (pieceId === 3) {
                if (row === 0 || row === 7 || col === 0 || col === 7) SCORE -= 10;
                if (row > 0 && row < 7 && col > 0 && col < 7) SCORE += 10;
            }
        } else if (pieceId == 2 || pieceId === 4) {
            if (pieceId === 2) SCORE -= (7 - row) * 5; // Bonus for Piece moving down[Forward progression]
            if (row === 7) SCORE -= 3; // Back row protection
            if (col >= 2 && col <= 5) SCORE -= 2; // Center control (columns 2-5)

            // King safety/mobility (discourage kings from being on the edge unless necessary)
            if (pieceId === 4) {
                if (row === 0 || row === 7 || col === 0 || col === 7) SCORE += 10;
                if (row > 0 && row < 7 && col > 0 && col < 7) SCORE -= 10;
            }

            // if ((P1)P1_kings == 1) {
        }
    }
    // Material count with increased king value
    SCORE += P1_pieces * 10;
    SCORE += P1_kings * 20;
    SCORE -= P2_pieces * 10;
    SCORE -= P2_kings * 20;

    if (P1_pieces > P2_pieces) {
        SCORE += 100;
    }
    if (P2_pieces > P1_pieces) {
        SCORE -= 100;
    }

    // Endgame specific heuristics
    // If few pieces left, prioritize kinging and attacking opponent's kings/men
    if (P1_pieces + P2_pieces + P1_kings + P2_kings <= 8) {
        // Small bonus for having kings in endgame
        SCORE += P1_kings * 5;
        SCORE -= P2_kings * 5;

        // Encourage attacking opponent's pieces if you have more kings
        if (P1_kings > P2_kings) {
            SCORE += (P1_pieces + P1_kings) * 10;
        }
        if (P2_kings > P1_kings) {
            SCORE -= (P2_pieces + P2_kings) * 10;
        }
    }

    if ((P1_pieces + P1_kings) === 0) return -Infinity; //P2 wins
    if ((P2_pieces + P2_kings) === 0) return Infinity; //P1 wins

    return SCORE;
}


////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
//////////// GAME_BUTTONS ////////////
function saveGame(GAME) {
    if (PENDING_GAMES.length === 0) {
        PENDING_GAMES.push(GAME);
    } else if (PENDING_GAMES.length > 0) {
        for (let i = 0; i < PENDING_GAMES.length; i++) {
            let PENDING_GAME = PENDING_GAMES[i];

            if (PENDING_GAME.level === GAME.selected_Level) {
                PENDING_GAMES.splice(i, 1);
            }
        }
        PENDING_GAMES.push(GAME);
    }
}

function loadGame(level) {
    let pendingGameNotFound = true;

    for (let i = 0; i < PENDING_GAMES.length; i++) {
        let PENDING_GAME = PENDING_GAMES[i];

        if (PENDING_GAME.level === level) {
            pendingGameNotFound = false;

            selected_Level = PENDING_GAME.level;
            CURRENT_PLAYER = PENDING_GAME.current_player;
            BOARD = [];
            BOARD = PENDING_GAME.board;
            HISTORY = [];
            HISTORY = PENDING_GAME.history;

            updateGameStatus(BOARD, PLAYER_1, PLAYER_2);
            renderBoard(BOARD);
        }
    }

    if (pendingGameNotFound) {
        startGame();
    }
}
//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
//////////// GAME_ANIMATIONS ////////////
function animateMovingPiece(from, to) {

}
//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
//////////// GAME_UI ////////////

/*
 *@brief:Responsible for highlighting user turn
 *Also shows the current number of pieces of each PLAYER has
 */
const piece_countPlayer_1 = document.getElementById("Player_1_count");
const piece_countPlayer_2 = document.getElementById("Player_2_count");

function displayCounter() {
    if (CURRENT_PLAYER === 1) {
        piece_countPlayer_2.style.color = "";
        piece_countPlayer_1.style.color = "#f1cda5";
    } else if (CURRENT_PLAYER === 2) {
        piece_countPlayer_1.style.color = "";
        piece_countPlayer_2.style.color = "#f1cda5";
    }

    piece_countPlayer_1.textContent = PLAYER_1.name + " :" + PLAYER_1.NoOf_Pieces;
    piece_countPlayer_2.textContent = PLAYER_2.name + " :" + PLAYER_2.NoOf_Pieces;
}

///////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
startGame();

// Listen for the 'restart-game' event from the main process
if (typeof window !== 'undefined' && window.require) {
    const { ipcRenderer } = window.require('electron');
    ipcRenderer.on('restart-game', () => {
        startGame();
    });
}
