document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');
    let squares = Array.from(document.querySelectorAll('.grid div'));
    const scoreDisplay = document.querySelector('#score');
    const startButton = document.querySelector('#start-button');
    const width = 10;
    let nextRandom = 0;
    let timerId;
    let score = 0;
    const colors = [
        'orange',
        'red',
        'purple',
        'green',
        'blue'
      ]

    // Tetrominos

    const lTetromino = [
        [1, width+1, width*2+1, 2],
        [width, width+1, width+2, width*2+2],
        [1, width+1, width*2+1, width*2],
        [width, width*2, width*2+1, width*2+2]
    ];

    const zTetromino = [
        [0, width, width+1, width*2+1],
        [width+1, width+2, width*2, width*2+1],
        [0, width, width+1, width*2+1],
        [width+1, width+2, width*2, width*2+1]
    ];

    const tTetromino = [
        [1, width, width+1, width+2],
        [1, width+1, width+2, width*2+1],
        [width, width+1, width+2, width*2+1],
        [1, width, width+1, width*2+1]
    ];

    const oTetromino = [
        [0, 1, width, width+1],
        [0, 1, width, width+1],
        [0, 1, width, width+1],
        [0, 1, width, width+1]
    ];

    const iTetromino = [
        [1, width+1, width*2+1, width*3+1],
        [width, width+1, width+2, width+3],
        [1, width+1, width*2+1, width*3+1],
        [width, width+1, width+2, width+3]
    ];

    const tetrominos = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino];

    let currentPosition = 4;
    let currentRotation = 0;
    // randomly select tetrominos
    let random = Math.floor(Math.random() * tetrominos.length);
    console.log(random);
    let current = tetrominos[random][0];
    
    // draw the first rotation
    function draw(){
        current.forEach(index => {
            squares[currentPosition  + index].classList.add('tetromino');
            squares[currentPosition + index].style.backgroundColor = colors[random];

        })
    }

    // undraw the randomly chosen tetromino
    function undraw(){
        current.forEach(index => {
            squares[currentPosition + index].classList.remove('tetromino');
            squares[currentPosition + index].style.backgroundColor = '';

        })
    }

    // set time limit of movement to 1s
    //timerId = setInterval(moveDown, 1000);

    // assign keycontrols
    function control(e){
        if(e.keyCode === 37 || e.keyCode === 65){
            moveLeft();
        } else if(e.keyCode === 38 || e.keyCode === 87){
            rotate();
        } else if(e.keyCode === 39 || e.keyCode === 68){
            moveRight();
        } else if(e.keyCode === 40 || e.keyCode === 83){
            moveDown();
        }
    }

    // Detect keys pressed
    document.addEventListener('keyup', control);

    // downward movement of Tetrominos
    function moveDown() {
        undraw();
        currentPosition += width;
        draw(); 
        freeze();
    }

    // freeze function
    function freeze() {
        if(current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
            current.forEach(index => squares[currentPosition + index].classList.add('taken'));
            
            // start a new tetromino falling
            random = nextRandom;
            nextRandom = Math.floor(Math.random() * tetrominos.length);
            current = tetrominos[random][currentRotation];
            currentPosition = 4;
            draw();
            displayTetromino();
            addScore();
            gameOver();
        }
    }

    // Move left and limit to left edge of grid
    function moveLeft(){
        undraw();
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);

        if(!isAtLeftEdge) currentPosition -= 1;

        if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition += 1;
        }
        draw();
    }

    // Move right and limit to right edge of grid
    function moveRight() {
        undraw();
        const isAtRightEdge = current.some(index => (currentPosition + index) % 10 === (width-1));
        
        if(!isAtRightEdge) currentPosition += 1;

        if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition -= 1;
        }
        draw();
    }

    ///FIX ROTATION OF TETROMINOS A THE EDGE 
    function isAtRight() {
        return current.some(index=> (currentPosition + index + 1) % width === 0)  
    }
    
    function isAtLeft() {
        return current.some(index=> (currentPosition + index) % width === 0)
    }
    
    function checkRotatedPosition(P){
        P = P || currentPosition         //get current position.  Then, check if the piece is near the left side.
        if ((P+1) % width < 4) {         //add 1 because the position index can be 1 less than where the piece is (with how they are indexed).     
            if (isAtRight()){            //use actual position to check if it's flipped over to right side
                currentPosition += 1    //if so, add one to wrap it back around
                checkRotatedPosition(P) //check again.  Pass position from start, since long block might need to move more.
                }
            }
            else if (P % width > 5) {
            if (isAtLeft()){
                currentPosition -= 1
            checkRotatedPosition(P)
            }
        }
    }

    // rotating tetrominos
    function rotate() {
        undraw();
        currentRotation ++;
        if(currentRotation === current.length)  {
            currentRotation = 0;
        }
        current = tetrominos[random][currentRotation]
        checkRotatedPosition();
        draw();
    }

    // Show up-next tetromino in mini grid
    const displayShape = document.querySelectorAll('.mini-grid div');
    const displayWidth = 4;
    let displayIndex = 0;

    //tetrominos without rotations
    const upNextTetromino = [
        [1, displayWidth+1, displayWidth*2+1, 2],                // lTetromino
        [0, displayWidth, displayWidth+1, displayWidth*2+1],     // zTetromino
        [1, displayWidth, displayWidth+1, displayWidth+2],       // tTetromino
        [0, 1, displayWidth, displayWidth+1],                    // oTetromino
        [1, displayWidth+1, displayWidth*2+1, displayWidth*3+1]  // iTetromino
    ];

    // displaying tetrominos in mini displays
    function displayTetromino() {
        // remove old shape
        displayShape.forEach(square => {
            square.classList.remove('tetromino');
        })
        upNextTetromino[nextRandom].forEach(index => {
            displayShape[displayIndex + index].classList.add('tetromino');
        })
    }

    // making Start/Pause button functional
    startButton.addEventListener('click', () => {
        if(timerId) {
            clearInterval(timerId);
            timerId = null;
        } else {
            draw();
            timerId = setInterval(moveDown, 1000);
            nextRandom = Math.floor(Math.random()*tetrominos.length)
            displayTetromino();
        }        
    })

    // add Score
    function addScore() {
        for (let i = 0; i < 199; i+=width) {
            const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9];

            if(row.every(index => squares[index].classList.contains('taken'))){
                score += 10;
                scoreDisplay.innerHTML = score;
                row.forEach(index => {
                    squares[index].classList.remove('taken');
                    squares[index].classList.remove('tetromino');
                    squares[index].style.backgroundColor = '';
                })
                const squaresRemoved = squares.splice(i, width);
                squares = squaresRemoved.concat(squares);
                squares.forEach(cell => grid.appendChild(cell));
            }
        }
    }

    // game over
    function gameOver() {
        if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            scoreDisplay.innerHTML = 'end';
            clearInterval(timerId);
        }
    }
})
