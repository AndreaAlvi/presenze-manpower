import {
    initDB,
    saveDay,
    getDay,
    getSavedDates,
    deleteDay,
    getAllDays
} from "./db.js";

const months = [
    "Gennaio",
    "Febbraio",
    "Marzo",
    "Aprile",
    "Maggio",
    "Giugno",
    "Luglio",
    "Agosto",
    "Settembre",
    "Ottobre",
    "Novembre",
    "Dicembre"
];

const shortMonths = [
    "GEN",
    "FEB",
    "MAR",
    "APR",
    "MAG",
    "GIU",
    "LUG",
    "AGO",
    "SET",
    "OTT",
    "NOV",
    "DIC"
];

const days = [
    "Domenica",
    "Lunedì",
    "Martedì",
    "Mercoledì",
    "Giovedì",
    "Venerdì",
    "Sabato"
];

let currentDate = new Date();
let editMode = true;
let touchStartX = 0;
let touchEndX = 0;
let currentOffset = -33.3333;
let swipeDirection = null;

function setInputsDisabled(disabled) {

    document.getElementById("entryInput").readOnly = disabled;
    document.getElementById("exitInput").readOnly = disabled;
    document.getElementById("absenceInput").readOnly = disabled;
    document.getElementById("typeInput").disabled = disabled;
}
function openTypeModal(){

    if(!editMode){
        return;
    }

    document.getElementById(
        "typeModalOverlay"
    ).style.display = "flex";
}

function closeTypeModal(){

    document.getElementById(
        "typeModalOverlay"
    ).style.display = "none";
}
function openCustomTypeModal(){

    document.getElementById(
        "customTypeOverlay"
    ).style.display = "flex";

    document.getElementById(
        "customTypeInput"
    ).value = "";

    document.getElementById(
        "customTypeInput"
    ).focus();
}

function closeCustomTypeModal(){

    document.getElementById(
        "customTypeOverlay"
    ).style.display = "none";
}
async function openRecapModal(){

    await loadRecapData();

    document.getElementById(
        "recapOverlay"
    ).style.display = "flex";
}

function closeRecapModal(){

    document.getElementById(
        "recapOverlay"
    ).style.display = "none";
}
function openResetModal(){

    document.getElementById(
        "resetOverlay"
    ).style.display = "flex";
}

function closeResetModal(){

    document.getElementById(
        "resetOverlay"
    ).style.display = "none";
}
async function loadRecapData(){

    const allDays =
        await getAllDays();

    const currentMonth =
        currentDate.getMonth();

    const currentYear =
        currentDate.getFullYear();

    const monthDays =
        allDays.filter(day => {

            const date =
                new Date(day.date);

            return (
                date.getMonth() === currentMonth &&
                date.getFullYear() === currentYear
            );

        });

    let workedMinutes = 0;

monthDays.forEach(day => {

    if(
        day.entry.includes("--") ||
        day.exit.includes("--")
    ){
        return;
    }

    const [entryHour, entryMinute] =
        day.entry.split(":").map(Number);

    const [exitHour, exitMinute] =
        day.exit.split(":").map(Number);

    const [absenceHour, absenceMinute] =
        day.absence.split(":").map(Number);

    let dailyWorkedMinutes =
        ((exitHour * 60) + exitMinute)
        -
        ((entryHour * 60) + entryMinute)
        -
        ((absenceHour * 60) + absenceMinute);

    if(
        dailyWorkedMinutes < 0
    ){
        dailyWorkedMinutes = 0;
    }

    workedMinutes +=
        dailyWorkedMinutes;

});
        let holidayMinutes = 0;

monthDays.forEach(day => {

    if(day.type === "FERIE"){

        const parts =
            day.absence.split(":");

        holidayMinutes +=
            Number(parts[0]) * 60 +
            Number(parts[1]);
    }

});
let rolMinutes = 0;

monthDays.forEach(day => {

    if(day.type === "ROL"){

        const parts =
            day.absence.split(":");

        rolMinutes +=
            Number(parts[0]) * 60 +
            Number(parts[1]);
    }

});
let sickMinutes = 0;

monthDays.forEach(day => {

    if(day.type === "MALATTIA"){

        const parts =
            day.absence.split(":");

        sickMinutes +=
            Number(parts[0]) * 60 +
            Number(parts[1]);
    }

});

let smartDays = 0;

monthDays.forEach(day => {

    if(day.type === "SMART WORKING"){
        smartDays++;
    }

});

let presenceDays = 0;

monthDays.forEach(day => {

    const weekday =
        new Date(day.date).getDay();

    const isWeekend =
        weekday === 0 ||
        weekday === 6;

    if(
        !isWeekend &&
        (
            day.type === "--" ||
            day.type === "FERIE" ||
            ![
                "SMART WORKING",
                "ROL",
                "MALATTIA"
            ].includes(day.type)
        )
    ){
        presenceDays++;
    }

});

    document.getElementById(
    "recapWorkedDays"
).textContent =
    `${Math.floor(
        workedMinutes / 60
    )}h`;
        document.getElementById(
    "recapHolidayHours"
).textContent =
    `${Math.floor(
        holidayMinutes / 60
    )}h`;
    document.getElementById(
    "recapRolHours"
).textContent =
    `${Math.floor(
        rolMinutes / 60
    )}h`;
    document.getElementById(
    "recapSickHours"
).textContent =
    `${Math.floor(
        sickMinutes / 60
    )}h`;

document.getElementById(
    "recapSmartDays"
).textContent =
    smartDays;

document.getElementById(
    "recapPresenceDays"
).textContent =
    presenceDays;
    const recapContainer =
    document.getElementById(
        "recapDaysContainer"
    );

recapContainer.innerHTML = "";

const daysInMonth =
    new Date(
        currentYear,
        currentMonth + 1,
        0
    ).getDate();

for(
    let i = 1;
    i <= daysInMonth;
    i++
){

    const dateString =
        `${currentYear}-${String(currentMonth + 1).padStart(2,"0")}-${String(i).padStart(2,"0")}`;

    const day =
        monthDays.find(
            d => d.date === dateString
        );

    const currentLoopDate =
        new Date(
            currentYear,
            currentMonth,
            i
        );

    const card =
        document.createElement(
            "div"
        );

    card.className =
        "recap-day-card";
        const today =
    new Date();
    today.setHours(
    0,
    0,
    0,
    0
);
    

today.setHours(
    0,0,0,0
);

const currentCardDate =
    new Date(
        currentYear,
        currentMonth,
        i
    );

const isWeekend =
    currentCardDate.getDay() === 0 ||
    currentCardDate.getDay() === 6;

const isFuture =
    currentCardDate > today;

const isToday =
    currentCardDate.getTime() ===
    today.getTime();

if(
    day ||
    isWeekend
){
    card.classList.add(
        "recap-green"
    );
}

if(
    day ||
    isWeekend
){
    card.classList.add(
        "recap-green"
    );
}
else if(
    !isFuture
){
    card.classList.add(
        "recap-red"
    );
}
else{
    card.classList.add(
        "recap-white"
    );
}

if(
    isToday
){
    card.classList.add(
        "recap-current"
    );
}

    const date =
    currentLoopDate;

    const formattedDate =
    `${days[
        date.getDay()
    ]} ${String(
        date.getDate()
    ).padStart(
        2,
        "0"
    )} ${months[
        date.getMonth()
    ]}`;

    card.innerHTML = `
        <div class="recap-day-title">
    ${formattedDate}
</div>

        <div>Entrata: <b>${day?.entry || "--:--"}</b></div>
<div>Uscita: <b>${day?.exit || "--:--"}</b></div>
<div>Ore assenza: <b>${day?.absence || "--:--"}</b></div>
<div>Tipologia: <b>${day?.type || "--"}</b></div>
    `;

    recapContainer.appendChild(
        card
    );

};
}

function updateButtonState() {

    const button =
        document.getElementById("saveButton");

    if (editMode) {

        button.textContent = "SALVA";
        button.style.background = "#89A38F";

    } else {

        button.textContent = "MODIFICA";
        button.style.background = "#244C9F";
    }
}

function normalizeTime(value) {

    value = value.trim();

    if (
        value === "" ||
        value.includes(":") ||
        value.includes("--")
    ) {
        return value;
    }

    const numbers =
        value.replace(/\D/g, "");

    if (numbers.length === 1) {
        return `0${numbers}:00`;
    }

    if (numbers.length === 2) {
        return `${numbers}:00`;
    }

    if (numbers.length === 3) {
        return `0${numbers[0]}:${numbers.slice(1)}`;
    }

    if (numbers.length >= 4) {
        return `${numbers.slice(0,2)}:${numbers.slice(2,4)}`;
    }

    return value;
}

function calculateWorkedHours() {

    const entry =
        document.getElementById("entryInput").value;

    const exit =
        document.getElementById("exitInput").value;

    const absence =
        document.getElementById("absenceInput").value;

    if (
        entry.includes("--") ||
        exit.includes("--") ||
        absence.includes("--") ||
        !entry.includes(":") ||
        !exit.includes(":") ||
        !absence.includes(":")
    ) {

        document.querySelector(
            ".worked-hours"
        ).textContent =
            "Ore eff. lavorate: --h --m";

        return;
    }

    const [entryHour, entryMinute] =
        entry.split(":").map(Number);

    const [exitHour, exitMinute] =
        exit.split(":").map(Number);

    const [absenceHour, absenceMinute] =
        absence.split(":").map(Number);

    let workedMinutes =
        ((exitHour * 60) + exitMinute)
        -
        ((entryHour * 60) + entryMinute)
        -
        ((absenceHour * 60) + absenceMinute);

    if (workedMinutes < 0) {
        workedMinutes = 0;
    }

    const hours =
        Math.floor(workedMinutes / 60);

    const minutes =
        workedMinutes % 60;

    document.querySelector(
        ".worked-hours"
    ).textContent =
        `Ore eff. lavorate: ${String(hours).padStart(2,"0")}h ${String(minutes).padStart(2,"0")}m`;
}

function attachParser(id) {

    const input =
        document.getElementById(id);

    input.addEventListener(
        "blur",
        () => {

            input.value =
                normalizeTime(input.value);

            calculateWorkedHours();
        }
    );

    input.addEventListener(
        "input",
        calculateWorkedHours
    );
    input.addEventListener(
    "focus",
    () => {

        if(
            input.value === "--:--"
        ){
            input.value = "";
        }

    }
);

input.addEventListener(
    "blur",
    () => {

        if(
            input.value.trim() === ""
        ){
            input.value = "--:--";
        }

    }
);
}

async function loadCurrentDay() {

    const dateString =
        currentDate
            .toISOString()
            .split("T")[0];

    const savedDay =
        await getDay(dateString);

    const isWeekend =
        currentDate.getDay() === 0 ||
        currentDate.getDay() === 6;

    if (savedDay) {

        document.getElementById("entryInput").value =
            savedDay.entry;

        document.getElementById("exitInput").value =
            savedDay.exit;

        document.getElementById("absenceInput").value =
            savedDay.absence;

        document.getElementById("typeInput").value =
            savedDay.type;

        editMode = false;

        setInputsDisabled(true);

        updateButtonState();

        calculateWorkedHours();

        return;
    }

    if (isWeekend) {

        document.getElementById("entryInput").value =
            "--:--";

        document.getElementById("exitInput").value =
            "--:--";

        document.getElementById("absenceInput").value =
            "--:--";

        document.getElementById("typeInput").value =
            "--";

    } else {

        document.getElementById("entryInput").value =
            "10:00";

        document.getElementById("exitInput").value =
            "18:00";

        document.getElementById("absenceInput").value =
            "00:00";

        document.getElementById("typeInput").value =
            "--";
    }

    editMode = true;

    setInputsDisabled(false);

    updateButtonState();

    calculateWorkedHours();
}

async function renderGrid() {

    const daysGrid =
        document.getElementById("daysGrid");

    daysGrid.innerHTML = "";

    const month =
        currentDate.getMonth();

    const year =
        currentDate.getFullYear();

    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();

    const today =
        new Date();

    const savedDates =
        await getSavedDates();
        const firstDayOfMonth =
    new Date(
        year,
        month,
        1
    ).getDay();

const offset =
    firstDayOfMonth === 0
        ? 6
        : firstDayOfMonth - 1;

        for(
    let i = 0;
    i < offset;
    i++
){

    const empty =
        document.createElement(
            "div"
        );

    empty.classList.add(
        "day"
    );

    empty.style.visibility =
        "hidden";

    daysGrid.appendChild(
        empty
    );
}
    for (
        let i = 1;
        i <= daysInMonth;
        i++
    ) {

        const square =
            document.createElement(
                "div"
            );

        square.classList.add(
            "day"
        );
        const weekday =
    new Date(
        year,
        month,
        i
    ).getDay();

if(
    weekday === 6
){
    square.textContent = "S";
}

if(
    weekday === 0
){
    square.textContent = "D";
}

        const isCurrent =
            i === currentDate.getDate();

        const dateKey =
            `${year}-${String(month + 1).padStart(2,"0")}-${String(i).padStart(2,"0")}`;

        const isSaved =
    savedDates.includes(
        dateKey
    );

const isFuture =
    new Date(
        year,
        month,
        i
    ) > today;

const isWeekend =
    new Date(
        year,
        month,
        i
    ).getDay() === 0
    ||
    new Date(
        year,
        month,
        i
    ).getDay() === 6;

        if (isCurrent) {

            square.classList.add(
                "current"
            );

        }
        else if (
    isSaved ||
    isWeekend
) {

    square.classList.add(
        "green"
    );

}
        else if (!isFuture) {

            square.classList.add(
                "red"
            );

        }
        else {

            square.classList.add(
                "white"
            );
        }

        daysGrid.appendChild(
            square
        );
    }
}

async function renderPage() {

    const formattedDate =
        `${days[currentDate.getDay()]} ${currentDate.getDate()} ${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

    document.getElementById(
        "currentDate"
    ).textContent =
        formattedDate;

    document.getElementById(
        "monthButton"
    ).textContent =
        shortMonths[
            currentDate.getMonth()
        ];
        const previousDate =
    new Date(currentDate);

previousDate.setDate(
    previousDate.getDate() - 1
);

const nextDate =
    new Date(currentDate);

nextDate.setDate(
    nextDate.getDate() + 1
);

document.getElementById(
    "previousPreview"
).innerHTML =
    `
    ${days[
        previousDate.getDay()
    ]}
    <br>
    ${previousDate.getDate()}
    ${months[
        previousDate.getMonth()
    ]}
    `;

document.getElementById(
    "nextPreview"
).innerHTML =
    `
    ${days[
        nextDate.getDay()
    ]}
    <br>
    ${nextDate.getDate()}
    ${months[
        nextDate.getMonth()
    ]}
    `;

    await renderGrid();

    await loadCurrentDay();
}

document
    .getElementById(
        "prevDayBtn"
    )
    .addEventListener(
        "click",
        async () => {

            currentDate.setDate(
                currentDate.getDate() - 1
            );

            await renderPage();
        }
    );

document
    .getElementById(
        "nextDayBtn"
    )
    .addEventListener(
        "click",
        async () => {

            currentDate.setDate(
                currentDate.getDate() + 1
            );

            await renderPage();
        }
    );

document
    .getElementById(
        "saveButton"
    )
    .addEventListener(
        "click",
        async () => {

            if (!editMode) {

                editMode = true;

                setInputsDisabled(
                    false
                );

                updateButtonState();

                return;
            }

            const data = {

                date:
                    currentDate
                        .toISOString()
                        .split("T")[0],

                entry:
                    document.getElementById(
                        "entryInput"
                    ).value,

                exit:
                    document.getElementById(
                        "exitInput"
                    ).value,

                absence:
                    document.getElementById(
                        "absenceInput"
                    ).value,

                type:
                    document.getElementById(
                        "typeInput"
                    ).value
            };

            await saveDay(data);
            if(
    navigator.vibrate
){
    navigator.vibrate(
        10
    );
}

            editMode = false;

            setInputsDisabled(
                true
            );

            updateButtonState();

            await renderGrid();
        }
    );
document
    .querySelector(
        ".reset-btn"
    )
    .addEventListener(
        "click",
        () => {

            openResetModal();

        }
    );
    document
    .getElementById(
        "typeInput"
    )
    .addEventListener(
        "click",
        openTypeModal
    );

document
    .querySelectorAll(
        ".type-option"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const value =
                        button.textContent.trim();

                    if(
    value === "ALTRO"
){

    closeTypeModal();

    openCustomTypeModal();

    return;
}
else{

                        document.getElementById(
                            "typeInput"
                        ).value =
                            value;
                            if(
    value === "FERIE"
){

    document.getElementById(
        "entryInput"
    ).value = "--:--";

    document.getElementById(
        "exitInput"
    ).value = "--:--";

    document.getElementById(
        "absenceInput"
    ).value = "08:00";

    calculateWorkedHours();
}
                    }

                    closeTypeModal();

                }
            );

        }
    );

document
    .getElementById(
        "typeModalOverlay"
    )
    .addEventListener(
        "click",
        (event) => {

            if(
                event.target.id ===
                "typeModalOverlay"
            ){

                closeTypeModal();
            }

        }
    );
    document
    .querySelector(
        ".recap-button"
    )
    .addEventListener(
        "click",
        openRecapModal
    );

document
    .getElementById(
        "recapCloseBtn"
    )
    .addEventListener(
        "click",
        closeRecapModal
    );

document
    .getElementById(
        "recapOverlay"
    )
    .addEventListener(
        "click",
        (event) => {

            if(
                event.target.id ===
                "recapOverlay"
            ){

                closeRecapModal();
            }

        }
    );

document
    .getElementById(
        "customTypeCancel"
    )
    .addEventListener(
        "click",
        closeCustomTypeModal
    );

document
    .getElementById(
        "customTypeSave"
    )
    .addEventListener(
        "click",
        () => {

            const value =
                document
                    .getElementById(
                        "customTypeInput"
                    )
                    .value
                    .trim();

            if(
                value === ""
            ){
                return;
            }

            document
                .getElementById(
                    "typeInput"
                )
                .value =
                    value;

            closeCustomTypeModal();
            if(
    navigator.vibrate
){
    navigator.vibrate(
        10
    );
}
        }
    );
    document
    .getElementById(
        "customTypeInput"
    )
    .addEventListener(
        "keydown",
        (event) => {

            if(
                event.key !==
                "Enter"
            ){
                return;
            }

            document
                .getElementById(
                    "customTypeSave"
                )
                .click();

        }
    );

document
    .getElementById(
        "customTypeOverlay"
    )
    .addEventListener(
        "click",
        (event) => {

            if(
                event.target.id ===
                "customTypeOverlay"
            ){
                closeCustomTypeModal();
            }

        }
    );
    document
    .getElementById(
        "resetCancelBtn"
    )
    .addEventListener(
        "click",
        closeResetModal
    );

document
    .getElementById(
        "resetOverlay"
    )
    .addEventListener(
        "click",
        (event) => {

            if(
                event.target.id ===
                "resetOverlay"
            ){
                closeResetModal();
            }

        }
    );
    document
    .getElementById(
        "resetConfirmBtn"
    )
    .addEventListener(
        "click",
        async () => {

            await deleteDay(
                currentDate
                    .toISOString()
                    .split("T")[0]
            );

            document.getElementById(
                "entryInput"
            ).value = "--:--";

            document.getElementById(
                "exitInput"
            ).value = "--:--";

            document.getElementById(
                "absenceInput"
            ).value = "--:--";

            document.getElementById(
                "typeInput"
            ).value = "--";

            editMode = true;

            setInputsDisabled(
                false
            );

            updateButtonState();

            calculateWorkedHours();

            await renderGrid();

            closeResetModal();

        }
    );
    
async function startApp() {

    await initDB();

    attachParser(
        "entryInput"
    );

    attachParser(
        "exitInput"
    );

    attachParser(
        "absenceInput"
    );
const track =
    document.querySelector(
        ".day-track"
    );

track.addEventListener(
    "touchstart",
    (event) => {

        touchStartX =
            event.changedTouches[0].screenX;

    }
);
track.addEventListener(
    "touchmove",
    (event) => {

        const currentX =
            event.changedTouches[0].screenX;

        const delta =
            currentX - touchStartX;

        const percentage =
            (
                delta /
                window.innerWidth
            ) * 100;

        track.style.transform =
            `translateX(calc(${currentOffset}% + ${percentage}%))`;
            document

    }
);


track.addEventListener(
    "touchend",
    async (event) => {

        touchEndX =
            event.changedTouches[0].screenX;

        const difference =
            touchEndX - touchStartX;
            track.style.transform =
    `translateX(${currentOffset}%)`;
    

        if (difference > 50) {
            swipeDirection =
    "right";
    document
    .getElementById(
        "dotCenter"
    )
    .classList.remove(
        "active"
    );

document
    .getElementById(
        "dotLeft"
    )
    .classList.add(
        "active"
    );

    track.style.transition =
        "transform 0.25s ease";

    track.style.transform =
        "translateX(0%)";

    setTimeout(
        async () => {

            currentDate.setDate(
                currentDate.getDate() - 1
            );

            await renderPage();

            track.style.transition =
                "none";

            track.style.transform =
                "translateX(-33.3333%)";

        },
        250
    );

    return;
}

if (difference < -50) {
    swipeDirection =
    "left";
    document
    .getElementById(
        "dotCenter"
    )
    .classList.remove(
        "active"
    );

document
    .getElementById(
        "dotRight"
    )
    .classList.add(
        "active"
    );

    track.style.transition =
        "transform 0.25s ease";

    track.style.transform =
        "translateX(-66.6666%)";

    setTimeout(
        async () => {

            currentDate.setDate(
                currentDate.getDate() + 1
            );

            await renderPage();

            track.style.transition =
                "none";

            track.style.transform =
                "translateX(-33.3333%)";
                document
    .querySelectorAll(
        ".indicator-dot"
    )
    .forEach(
        dot =>
            dot.classList.remove(
                "active"
            )
    );
    document
    .getElementById(
        "dotCenter"
    )
    .classList.add(
        "active"
    );

document
    .getElementById(
        "dotCenter"
    )
    .classList.add(
        "active"
    );

        },
        250
    );

    return;
}

track.style.transition =
    "transform 0.25s ease";

track.style.transform =
    "translateX(-33.3333%)";
    document
    .querySelectorAll(
        ".indicator-dot"
    )
    .forEach(
        dot =>
            dot.classList.remove(
                "active"
            )
    );

document
    .getElementById(
        "dotCenter"
    )
    .classList.add(
        "active"
    );
    document
    .querySelectorAll(
        ".indicator-dot"
    )
    .forEach(
        dot =>
            dot.classList.remove(
                "active"
            )
    );

document
    .getElementById(
        "dotCenter"
    )
    .classList.add(
        "active"
    );
    }
);
    await renderPage();
document
    .getElementById(
        "firstDayBtn"
    )
    .addEventListener(
        "click",
        async () => {

            currentDate =
                new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    1
                );

            await renderPage();
        }
    );
    document
    .getElementById(
        "todayBtn"
    )
    .addEventListener(
        "click",
        async () => {

            currentDate =
                new Date();

            await renderPage();
        }
    );
    document
    .getElementById(
        "lastDayBtn"
    )
    .addEventListener(
        "click",
        async () => {

            currentDate =
                new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() + 1,
                    0
                );

            await renderPage();
        }
    );
}

startApp();