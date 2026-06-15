const NUM_BUTTONS = 4;

const buttons =
    document.querySelectorAll(
        ".game-button"
    );

const scoreElement =
    document.getElementById(
        "score"
    );

const bestScoreElement =
    document.getElementById(
        "best-score"
    );

const centerDisplay =
    document.getElementById(
        "center-display"
    );

let sequence = [];
let playerSequence = [];

let score = 0;

let acceptingInput = false;

updateBestScore();

centerDisplay.addEventListener(
    "click",
    startGame
);

buttons.forEach(button => {

    button.addEventListener(
        "click",
        handleButtonClick
    );
});

function startGame() {

    sequence = [];

    score = 0;

    updateScore();

    for (
        let i = 0;
        i < 3;
        i++
    ) {
        addStep();
    }

    playSequence();
}

function addStep() {

    const nextStep =
        Math.floor(
            Math.random() *
            NUM_BUTTONS
        );

    sequence.push(
        nextStep
    );
}

async function playSequence() {

    acceptingInput = false;

    centerDisplay.textContent =
        "Watch";

    await sleep(800);

    for (
        const step
        of sequence
    ) {

        await flashButton(
            step
        );

        await sleep(150);
    }

    playerSequence = [];

    centerDisplay.textContent =
        "Go";

    acceptingInput = true;
}

async function flashButton(index) {

    const button =
        buttons[index];

    button.classList.add(
        "active"
    );

    await sleep(400);

    button.classList.remove(
        "active"
    );
}

function handleButtonClick(event) {

    if (
        !acceptingInput
    ) {
        return;
    }

    const value =
        Number(
            event.currentTarget.dataset.id
        );

    flashButton(value);

    playerSequence.push(
        value
    );

    checkInput();
}

function checkInput() {

    const currentIndex =
        playerSequence.length - 1;

    if (

        playerSequence[currentIndex]
        !==
        sequence[currentIndex]

    ) {

        gameOver();
        return;
    }

    if (

        playerSequence.length
        ===
        sequence.length

    ) {

        roundComplete();
    }
}

async function roundComplete() {

    acceptingInput = false;

    score =
        sequence.length;

    updateScore();

    centerDisplay.textContent =
        `Round ${score}`;

    await sleep(1000);

    addStep();

    playSequence();
}

function gameOver() {

    acceptingInput = false;

    centerDisplay.textContent =
        `Game Over`;

    const best =
        Number(
            localStorage.getItem(
                "bestScore"
            ) || 0
        );

    if (
        score > best
    ) {

        localStorage.setItem(
            "bestScore",
            score
        );

        updateBestScore();
    }
}

function updateScore() {

    scoreElement.textContent =
        score;
}

function updateBestScore() {

    bestScoreElement.textContent =
        localStorage.getItem(
            "bestScore"
        ) || 0;
}

function sleep(ms) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );
}
