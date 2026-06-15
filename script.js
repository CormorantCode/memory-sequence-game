const MAX_SEQUENCE_LENGTH = 20;

const WRONG_SHAKE_MS = 2000;

const REVEAL_FLASHES = 3;

const REVEAL_FLASH_MS = 300;

const petals =
    document.querySelectorAll(
        ".petal"
    );

const centerDisplay =
    document.getElementById(
        "center-display"
    );

let sequence = [];

let playerSequence = [];

let acceptingInput = false;

const FLASH_MS = 300;

centerDisplay.addEventListener(
    "click",
    startGame
);

petals.forEach(
    petal => {

        petal.addEventListener(
            "click",
            handlePetalClick
        );
    }
);

function startGame() {

    sequence = [];

    addStep();

    playSequence();
}

function addStep() {

    sequence.push(

        Math.floor(
            Math.random() * 5
        )

    );
}

async function playSequence() {

    acceptingInput = false;

    centerDisplay.textContent =
        "Watch";

    await sleep(500);

    for (
        const step
        of sequence
    ) {

        await flashPetal(
            step
        );

        await sleep(100);
    }

    playerSequence = [];

    centerDisplay.textContent =
        "Go";

    acceptingInput = true;
}

async function flashPetal(index) {

    petals[index]
        .classList
        .add("active");

    await sleep(
        FLASH_MS
    );

    petals[index]
        .classList
        .remove("active");
}

function handlePetalClick(event) {

    if (
        !acceptingInput
    ) {
        return;
    }

    const value =
        Number(
            event.target.dataset.id
        );

    flashPetal(
        value
    );

    playerSequence.push(
        value
    );

    checkInput();
}

function checkInput() {

    const index =
        playerSequence.length - 1;

    if (

        playerSequence[index]
        !==
        sequence[index]

    ) {

        centerDisplay.textContent =
            "Game Over";

        acceptingInput = false;

        return;
    }

    if (

        playerSequence.length
        ===
        sequence.length

    ) {

        acceptingInput = false;

        setTimeout(
            () => {

                addStep();

                playSequence();

            },
            500
        );
    }
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