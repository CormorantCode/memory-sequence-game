// ====================
// CONFIGURATION
// ====================

const GRID_COLUMNS = 3;
const GRID_ROWS = 2;

const NUM_CARDS =
    GRID_COLUMNS *
    GRID_ROWS;

// Timing

const PLAYBACK_FLASH_MS = 400;
const PLAYBACK_GAP_MS = 100;

const CLICK_FLASH_MS = 150;

const ROUND_COMPLETE_DELAY_MS = 500;

const START_DELAY_MS = 500;

// ====================
// CARD IMAGES
// ====================

const cardImages = [

    "images/card1.png",
    "images/card2.png",
    "images/card3.png",
    "images/card4.png",

    "images/card5.png",
    "images/card6.png",
    "images/card7.png",
    "images/card8.png"
];

// ====================
// DOM ELEMENTS
// ====================

const cardContainer =
    document.getElementById(
        "card-container"
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

// ====================
// GAME STATE
// ====================

let sequence = [];

let playerSequence = [];

let score = 0;

let acceptingInput = false;

// ====================
// INITIALIZE
// ====================

cardContainer.style.gridTemplateColumns =
    `repeat(${GRID_COLUMNS}, auto)`;

createCards();

updateBestScore();

centerDisplay.addEventListener(
    "click",
    startGame
);

// ====================
// CREATE CARDS
// ====================

function createCards() {

    cardContainer.innerHTML = "";

    for (
        let i = 0;
        i < NUM_CARDS;
        i++
    ) {

        const button =
            document.createElement(
                "button"
            );

        button.className =
            "game-card";

        button.dataset.id =
            i;

        button.innerHTML =
            `<img src="${cardImages[i]}">`;

        button.addEventListener(
            "click",
            handleCardClick
        );

        cardContainer.appendChild(
            button
        );
    }
}

function getCards() {

    return document.querySelectorAll(
        ".game-card"
    );
}

// ====================
// START GAME
// ====================

function startGame() {

    sequence = [];

    playerSequence = [];

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

// ====================
// SEQUENCE
// ====================

function addStep() {

    const nextStep =
        Math.floor(
            Math.random() *
            NUM_CARDS
        );

    sequence.push(
        nextStep
    );
}

async function playSequence() {

    acceptingInput = false;

    centerDisplay.textContent =
        "Watch";

    await sleep(
        START_DELAY_MS
    );

    for (
        const step
        of sequence
    ) {

        await flashCard(
            step,
            PLAYBACK_FLASH_MS
        );

        await sleep(
            PLAYBACK_GAP_MS
        );
    }

    playerSequence = [];

    centerDisplay.textContent =
        "Go";

    acceptingInput = true;
}

async function flashCard(
    index,
    duration
) {

    const card =
        getCards()[index];

    card.classList.add(
        "active"
    );

    await sleep(
        duration
    );

    card.classList.remove(
        "active"
    );
}

// ====================
// PLAYER INPUT
// ====================

function handleCardClick(event) {

    if (
        !acceptingInput
    ) {
        return;
    }

    const value =
        Number(
            event.currentTarget.dataset.id
        );

    flashCard(
        value,
        CLICK_FLASH_MS
    );

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

// ====================
// ROUND COMPLETE
// ====================

async function roundComplete() {

    acceptingInput = false;

    score =
        sequence.length;

    updateScore();

    centerDisplay.textContent =
        `Round ${score}`;

    await sleep(
        ROUND_COMPLETE_DELAY_MS
    );

    addStep();

    playSequence();
}

// ====================
// GAME OVER
// ====================

function gameOver() {

    acceptingInput = false;

    centerDisplay.textContent =
        `Game Over (${score})`;

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

// ====================
// SCORES
// ====================

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

// ====================
// UTILITY
// ====================

function sleep(ms) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );
}