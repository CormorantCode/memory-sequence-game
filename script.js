const USE_FIXED_SEQUENCE = true;

const FIXED_SEQUENCE = [
    0,2,4,1,3,
    0,4,2,1,0,
    3,1,4,2,0,
    4,1,3,0,2,
    1,4,0,3,2
];

const MAX_SEQUENCE_LENGTH = 20;
const STARTING_LENGTH = 3;

const WRONG_SHAKE_MS = 1200;

const REVEAL_FLASHES = 3;
const REVEAL_FLASH_MS = 350;

const FLASH_MS = 400;  // sequence playback — slow enough to read
const TAP_MS = 100;    // user press — snappy, keeps up with fast clicks

const buttons =
    document.querySelectorAll(".button");

const centerDisplay =
    document.getElementById("center-display");

const progressTracker = document.getElementById("progress-tracker");

let sequence = [];
let playerSequence = [];
let acceptingInput = false;
let playCount = 0;      // increments each time the user starts a new play
let bestStep = 0;       // max step reached in the current play (1-based)

// Button color names for "correct color was X" message
const BUTTON_NAMES = [
    "blue",
    "yellow",
    "red",
    "green",
    "orange"
];

const centerCircle    = document.getElementById("center-circle");
const replayOptions   = document.getElementById("replay-options");
const replayBeginning = document.getElementById("replay-beginning");
const replayLast      = document.getElementById("replay-last");

centerCircle.addEventListener("click", handleCenterClick);

replayBeginning.addEventListener("click", () => setReplayOption("beginning"));
replayLast.addEventListener("click",      () => setReplayOption("last"));

function setReplayOption(choice) {
    replayBeginning.classList.toggle("active", choice === "beginning");
    replayLast.classList.toggle("active",      choice === "last");
    replayOptions.classList.remove("pulsing");
}

buttons.forEach(button => {
    button.addEventListener("click", handlebuttonClick);
});

// Start with center circle pulsing, ready for first play
setCenterPulse(true);

// Render initial dash state before any game starts
buildProgressTracker();
updateStepCounter();

function handleCenterClick() {
    if (!centerCircle.classList.contains("pulsing")) return;
    const fromLast = replayLast.classList.contains("active");
    startGame(fromLast && playCount > 0 ? lastFailedRound : 0);
}

function setCenterPulse(on) {
    centerCircle.classList.toggle("pulsing", on);
}

let lastFailedRound = 0;  // sequence length at the round where player failed

function startGame(startFromLength = 0) {

    sequence = [];
    bestStep = 0;
    playCount++;

    buildProgressTracker();

    // Determine starting sequence length
    const startLength =
        (startFromLength >= STARTING_LENGTH)
            ? startFromLength
            : STARTING_LENGTH;

    if (USE_FIXED_SEQUENCE) {

        sequence = FIXED_SEQUENCE.slice(0, startLength);

    } else {

        for (let i = 0; i < startLength; i++) {
            addStep();
        }
    }

    // Hide replay options and stop pulse when game starts
    replayOptions.classList.add("hidden");
    
    replayOptions.classList.remove("pulsing");
    setReplayOption("beginning");
    setCenterPulse(false);

    playSequence();
}

function updateReplayLastLabel() {
    const round = getRoundNumber();
    replayLast.textContent = `From Round ${round}`;
}

function addStep() {
    let candidate;
    do {
        candidate = Math.floor(Math.random() * 5);
    } while (!isValidNextStep(candidate));
    sequence.push(candidate);
}

function isValidNextStep(candidate) {
    const test = [...sequence, candidate];
    return (
        !hasFourInARow(test) &&
        !hasPatternRepeatedFourTimes(test)
    );
}

function hasFourInARow(seq) {
    if (seq.length < 4) return false;
    const n = seq.length;
    return (
        seq[n - 1] === seq[n - 2] &&
        seq[n - 2] === seq[n - 3] &&
        seq[n - 3] === seq[n - 4]
    );
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

function markBestDot() {

    // Remove any existing best marker
    progressTracker.querySelectorAll('.progress-dot.best').forEach(d => {
        d.classList.remove('best');
    });

    if (bestStep > 0) {
        const dot = progressTracker.querySelector(
            `.progress-dot[data-step="${bestStep - 1}"]`
        );
        if (dot) dot.classList.add('best');
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

function updateStepCounter(state, showBest = false) {

    const scPlayVal  = document.getElementById("sc-play-val");
    const scRoundVal = document.getElementById("sc-round-val");
    const scStepVal  = document.getElementById("sc-step-val");
    const scBestVal  = document.getElementById("sc-best-val");
    const scBestCell = document.getElementById("sc-best");

    if (!scPlayVal) return;

    // PLAY column
    scPlayVal.textContent = playCount > 0 ? playCount : "—";

    // ROUND column — show number, cap at total rounds for FINAL ROUND
    const totalRounds = MAX_SEQUENCE_LENGTH - (STARTING_LENGTH - 1);
    const roundNum = sequence.length > 0 ? getRoundNumber() : "—";
    scRoundVal.textContent = roundNum === totalRounds ? `${roundNum} ★` : roundNum;

    // STEP column — no WATCH text, just show "— of N" while sequence plays
    if (sequence.length === 0) {
        scStepVal.textContent = "— of —";
    } else if (state === "watch") {
        scStepVal.textContent = `— of ${sequence.length}`;
    } else if (state === undefined) {
        scStepVal.textContent = `1 of ${sequence.length}`;
    } else {
        scStepVal.textContent = `${state + 1} of ${sequence.length}`;
    }

    // BEST column — amber pulse only when shown at game end
    if (showBest && bestStep > 0) {
        scBestVal.textContent = bestStep;
        scBestCell.classList.add("best-active");
    } else {
        scBestVal.textContent = bestStep > 0 ? bestStep : "—";
        scBestCell.classList.remove("best-active");
    }
}

async function playSequence() {

    acceptingInput = false;

    updateStepCounter("watch");
    centerDisplay.textContent = "WATCH";

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

    centerDisplay.textContent = "GO";

    acceptingInput = true;
}

async function flashbutton(index) {
    buttons[index].classList.add("active");
    await sleep(FLASH_MS);
    buttons[index].classList.remove("active");
}

function tapButton(index) {
    buttons[index].classList.add("active");
    setTimeout(() => buttons[index].classList.remove("active"), TAP_MS);
}

function handlebuttonClick(event) {

    if (!acceptingInput) return;

    const value = Number(event.target.dataset.id);

    tapButton(value);

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

        centerDisplay.textContent = `The next color was ${correctName}`;

        for (let i = 0; i < REVEAL_FLASHES; i++) {

            await sleep(200);
            buttons[expected].classList.add("active");
            await sleep(REVEAL_FLASH_MS);
            buttons[expected].classList.remove("active");

        }

        await sleep(800);

        // Show gold ring on best step dot, update counter with BEST
        markBestDot();
        updateStepCounter(index, true);

        // Record the round for "replay from last" option
        lastFailedRound = sequence.length;
        updateReplayLastLabel();

        // Show replay options and return circle to pulsing state
        replayOptions.classList.remove("hidden");
        
        replayOptions.classList.add("pulsing");
        setCenterPulse(true);
        setReplayDisplay(bestStep);

        return;
    }

    // Correct step — update best and light up the dot
    const stepReached = index + 1;  // 1-based
    if (stepReached > bestStep) bestStep = stepReached;

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
            if (USE_FIXED_SEQUENCE) {
                sequence = FIXED_SEQUENCE.slice(
                    0,
                    sequence.length + 1
                );
            } else {
                addStep();
            }
            playSequence();
        }, 600);
    }
}

async function triggerWin() {

    centerDisplay.innerHTML =
        "<span style='font-size:1.3em;'>YOU WON!</span>";

    // Flash entire board 3 times
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

    // Update center to replay/win state
    setTimeout(() => {
        lastFailedRound = MAX_SEQUENCE_LENGTH;
        updateReplayLastLabel();
        replayOptions.classList.remove("hidden");
        
        replayOptions.classList.add("pulsing");
        setCenterPulse(true);
        setReplayDisplay(MAX_SEQUENCE_LENGTH);
    }, 1500);
}

/* ─── Helpers ────────────────────────────────────────── */

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function setReplayDisplay(steps) {
    centerDisplay.innerHTML =
        `REPLAY` +
        `<span style="display:block;margin-top:6px;line-height:1.4;font-size:0.66em;font-weight:normal;letter-spacing:0.02em;color:#c89000;">` +
            `Personal Best<br>` +
            `<strong>${steps} of ${MAX_SEQUENCE_LENGTH} Steps</strong>` +
        `</span>`;
}