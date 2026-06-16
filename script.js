const MAX_SEQUENCE_LENGTH = 20;
const STARTING_LENGTH = 3;

const WRONG_SHAKE_MS = 1200;

const REVEAL_FLASHES = 3;
const REVEAL_FLASH_MS = 350;

const FLASH_MS = 400;

const buttons =
    document.querySelectorAll(".button");

const centerDisplay =
    document.getElementById("center-display");

const progressTracker = document.getElementById("progress-tracker");
const stepCounter = document.getElementById("step-counter");

let sequence = [];
let playerSequence = [];
let acceptingInput = false;

// Button color names for "correct color was X" message
const BUTTON_NAMES = [
    "blue",
    "orange",
    "yellow",
    "green",
    "red"
];

centerDisplay.addEventListener("click", startGame);

buttons.forEach(button => {
    button.addEventListener("click", handlebuttonClick);
});

function startGame() {

    sequence = [];

    buildProgressTracker();

    // Start with STARTING_LENGTH steps
    for (let i = 0; i < STARTING_LENGTH; i++) {
        addStep();
    }

    playSequence();
}

function addStep() {

    sequence.push(Math.floor(Math.random() * 5));
}

function buildProgressTracker() {

    progressTracker.innerHTML = "";

    for (let i = 0; i < MAX_SEQUENCE_LENGTH; i++) {

        if (i > 0 && i % 5 === 0) {

            const divider = document.createElement("div");
            divider.className = "progress-divider";
            progressTracker.appendChild(divider);
        }

        const dot = document.createElement("div");
        dot.className = "progress-dot";
        dot.dataset.step = i;
        progressTracker.appendChild(dot);
    }
}

function updateProgressDot(index, state) {

    const dot = progressTracker.querySelector(
        `.progress-dot[data-step="${index}"]`
    );

    if (dot) {
        dot.classList.remove("correct", "wrong");
        if (state) dot.classList.add(state);
    }
}

function getRoundNumber() {
    // Round 1 = 3 steps, Round 2 = 4 steps, etc. → round = length - 2
    return sequence.length - (STARTING_LENGTH - 1);
}

function getRoundLabel() {
    const totalRounds = MAX_SEQUENCE_LENGTH - (STARTING_LENGTH - 1);
    const round = getRoundNumber();
    return round === totalRounds ? "FINAL ROUND" : `ROUND ${round}`;
}

function updateStepCounter(state) {

    if (!stepCounter) return;

    const label = getRoundLabel();

    if (state === "watch") {
        stepCounter.textContent = `${label}: WATCH...`;
    } else if (state === undefined) {
        stepCounter.textContent = `${label}: STEP 1 of ${sequence.length}`;
    } else {
        stepCounter.textContent = `${label}: STEP ${state + 1} of ${sequence.length}`;
    }
}

async function playSequence() {

    acceptingInput = false;

    updateStepCounter("watch");
    centerDisplay.textContent = "Watch";

    await sleep(600);

    for (const step of sequence) {

        await flashbutton(step);
        await sleep(150);
    }

    playerSequence = [];

    // Reset dots only now — after the sequence plays, just before the user starts clicking
    progressTracker.querySelectorAll('.progress-dot').forEach(dot => {
        dot.classList.remove('correct', 'wrong');
    });

    updateStepCounter();

    centerDisplay.textContent = "Go";

    acceptingInput = true;
}

async function flashbutton(index) {

    buttons[index].classList.add("active");
    await sleep(FLASH_MS);
    buttons[index].classList.remove("active");
}

function handlebuttonClick(event) {

    if (!acceptingInput) return;

    const value = Number(event.target.dataset.id);

    flashbutton(value);

    playerSequence.push(value);

    updateStepCounter(playerSequence.length - 1);

    checkInput();
}

async function checkInput() {

    const index = playerSequence.length - 1;
    const expected = sequence[index];
    const actual = playerSequence[index];

    if (actual !== expected) {

        acceptingInput = false;

        // Mark progress dot wrong
        updateProgressDot(index, "wrong");

        // Shake the wrong button
        buttons[actual].classList.add("shake");

        await sleep(WRONG_SHAKE_MS);

        buttons[actual].classList.remove("shake");

        // Show which color was correct, flash it
        const correctName = BUTTON_NAMES[expected];

        centerDisplay.textContent =
            `The correct color was ${correctName}`;

        for (let i = 0; i < REVEAL_FLASHES; i++) {

            await sleep(200);
            buttons[expected].classList.add("active");
            await sleep(REVEAL_FLASH_MS);
            buttons[expected].classList.remove("active");
        }

        await sleep(600);

        centerDisplay.innerHTML =
            `Game over at step ${sequence.length}!<br><small>Tap to try again</small>`;

        centerDisplay.addEventListener("click", startGame, { once: true });

        return;
    }

    // Correct step – light up the dot
    updateProgressDot(index, "correct");

    if (playerSequence.length === sequence.length) {

        acceptingInput = false;

        // Won the whole game?
        if (sequence.length === MAX_SEQUENCE_LENGTH) {

            await triggerWin();
            return;
        }

        // Next round
        setTimeout(() => {
            addStep();
            playSequence();
        }, 600);
    }
}

async function triggerWin() {

    centerDisplay.innerHTML =
        "<span style='font-size:1.4em;'>YOU WON!</span>";

    // Flash entire board 3 times
    const board = document.getElementById("game-board");

    for (let i = 0; i < 3; i++) {

        buttons.forEach(b => b.classList.add("active"));
        await sleep(400);
        buttons.forEach(b => b.classList.remove("active"));
        await sleep(300);
    }

    launchConfetti();
}

/* ─── Confetti ─────────────────────────────────────── */

function launchConfetti() {

    const board = document.getElementById("game-board");
    const rect = board.getBoundingClientRect();

    const colors = [
        "#0f5f84", "#f86a23", "#f6bc00",
        "#7c9900", "#d90000", "#ffffff"
    ];

    const PARTICLE_COUNT = 120;
    const container = document.createElement("div");

    container.style.cssText = `
        position: fixed;
        top: ${rect.top}px;
        left: ${rect.left}px;
        width: ${rect.width}px;
        height: ${rect.height}px;
        pointer-events: none;
        overflow: hidden;
        z-index: 9999;
    `;

    document.body.appendChild(container);

    for (let i = 0; i < PARTICLE_COUNT; i++) {

        const p = document.createElement("div");

        const size = 6 + Math.random() * 8;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const startX = Math.random() * 100;
        const delay = Math.random() * 800;
        const duration = 1200 + Math.random() * 1000;
        const rotation = Math.random() * 720 - 360;
        const drift = (Math.random() - 0.5) * 120;

        p.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size * 0.5}px;
            background: ${color};
            top: -10px;
            left: ${startX}%;
            border-radius: 2px;
            opacity: 1;
            animation: confettiFall ${duration}ms ${delay}ms ease-in forwards;
            --drift: ${drift}px;
            --rot: ${rotation}deg;
        `;

        container.appendChild(p);
    }

    // Inject keyframes once
    if (!document.getElementById("confetti-style")) {

        const style = document.createElement("style");
        style.id = "confetti-style";
        style.textContent = `
            @keyframes confettiFall {
                0%   { transform: translateY(0) translateX(0) rotate(0deg);    opacity: 1; }
                80%  { opacity: 1; }
                100% { transform: translateY(110%) translateX(var(--drift)) rotate(var(--rot)); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    setTimeout(() => container.remove(), 3000);

    // Tap to play again
    setTimeout(() => {
        centerDisplay.innerHTML =
            "<span style='font-size:1.4em;'>YOU WON!</span><br><small>Tap to play again</small>";
        centerDisplay.addEventListener("click", startGame, { once: true });
    }, 1500);
}

/* ─── Helpers ────────────────────────────────────────── */

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
