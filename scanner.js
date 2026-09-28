/************************************************
 SMART BASKET TRACKER
 Scanner
************************************************/

const WEBAPP_URL =
    "https://script.google.com/macros/s/AKfycbx24B1tWuPuMCEbAXaNG92WGT4ffLlPWYvXzjBKv6N12pAbsqsT87ekVPxS2OX9e-mMWA/exec";


let html5QrCode = null;

let scannerRunning = false;


// ================================================
// ตรวจสอบ Login
// ================================================

const employeeJSON =
    sessionStorage.getItem("employee");


if (!employeeJSON) {

    window.location.href =
        "login.html";

}


const employee =
    JSON.parse(employeeJSON);


// แสดงข้อมูลพนักงาน

document.getElementById(
    "employeeName"
).textContent =
    employee.name;


document.getElementById(
    "employeeTeam"
).textContent =
    employee.team;


// ================================================
// Logout
// ================================================

document
    .getElementById("logoutButton")
    .addEventListener(
        "click",
        function() {

            sessionStorage.removeItem(
                "employee"
            );

            window.location.href =
                "login.html";

        }
    );


// ================================================
// Start Scanner
// ================================================

document
    .getElementById("startScanner")
    .addEventListener(
        "click",
        startScanner
    );


async function startScanner() {

    // ตรวจสอบข้อมูลก่อนเปิดกล้อง

    const station =
        document
            .getElementById("station")
            .value;


    const action =
        document
            .getElementById("action")
            .value;


    const weight =
        document
            .getElementById("weight")
            .value;


    if (!station ||
        !action ||
        weight === "") {

        alert(
            "กรุณากรอกข้อมูลให้ครบทุกช่องก่อนทำการสแกน"
        );

        return;

    }


    if (Number(weight) < 0) {

        alert(
            "น้ำหนักต้องไม่ติดลบ"
        );

        return;

    }


    try {

        html5QrCode =
            new Html5Qrcode(
                "scanner"
            );


        await html5QrCode.start(

            {
                facingMode: "environment"
            },

            {
                fps: 10,

                qrbox: {
                    width: 250,
                    height: 250
                }

            },

            onScanSuccess,

            onScanFailure

        );


        scannerRunning = true;


        document
            .getElementById(
                "startScanner"
            )
            .style.display =
            "none";


        document
            .getElementById(
                "stopScanner"
            )
            .style.display =
            "block";


    } catch (error) {

        console.error(error);

        alert(
            "ไม่สามารถเปิดกล้องได้\n\n" +
            error.message
        );

    }

}


// ================================================
// Scan Success
// ================================================

async function onScanSuccess(
    decodedText,
    decodedResult
) {

    console.log(
        "QR:",
        decodedText
    );


    // ป้องกัน Scan ซ้ำ
    if (!scannerRunning)
        return;


    scannerRunning = false;


    await stopScanner();


    const basketId =
        decodedText.trim();


    // ตรวจสอบ Basket ID

    if (!/^\d{8}$/.test(basketId)) {

        alert(
            "QR นี้ไม่ใช่ Basket ID 8 หลัก"
        );

        return;

    }


    // Feedback

    successFeedback();


    // บันทึกข้อมูล

    await processBasket(
        basketId
    );

}


// ================================================
// Scan Failure
// ================================================

function onScanFailure(error) {

    // ไม่ต้องแสดง error ทุก frame

}


// ================================================
// Stop Scanner
// ================================================

async function stopScanner() {

    if (
        html5QrCode &&
        scannerRunning
    ) {

        try {

            await html5QrCode.stop();

        } catch(error) {

            console.error(error);

        }

    }


    scannerRunning = false;


    document
        .getElementById(
            "startScanner"
        )
        .style.display =
        "block";


    document
        .getElementById(
            "stopScanner"
        )
        .style.display =
        "none";

}


// ================================================
// Process Basket
// ================================================

async function processBasket(
    basketId
) {

    const station =
        document
            .getElementById("station")
            .value;


    const action =
        document
            .getElementById("action")
            .value;


    const weight =
        document
            .getElementById("weight")
            .value;


    const data = {

        actionType:
            "transaction",

        basketId:

            basketId,

        employeeId:

            employee.id,

        team:

            employee.team,

        station:

            station,

        action:

            action,

        weight:

            weight,

        device:

            navigator.userAgent

    };


    try {

        showMessage(
            "กำลังบันทึกข้อมูล...",
            "info"
        );


        const response =
            await fetch(
                WEBAPP_URL,
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "text/plain;charset=utf-8"

                    },

                    body:
                        JSON.stringify(data)

                }
            );


        const result =
            await response.json();


        console.log(
            "Save result:",
            result
        );


        if (!result.success) {

            throw new Error(
                result.message ||
                "ไม่สามารถบันทึกข้อมูลได้"
            );

        }


        showBasketResult(
            result
        );


        showMessage(
            "บันทึกข้อมูลสำเร็จ",
            "success"
        );


    } catch(error) {

        console.error(error);


        showMessage(
            "เกิดข้อผิดพลาดในการเชื่อมต่อ: " +
            error.message,
            "error"
        );

    }

}


// ================================================
// แสดงข้อมูล Basket
// ================================================

function showBasketResult(
    result
) {

    const basket =
        result.basket;


    document.getElementById(
        "basketResult"
    ).style.display =
        "block";


    document.getElementById(
        "resultBasketId"
    ).textContent =
        basket.id;


    document.getElementById(
        "resultStatus"
    ).textContent =
        basket.status;


    document.getElementById(
        "resultLocation"
    ).textContent =
        basket.location;


    document.getElementById(
        "resultPreviousWeight"
    ).textContent =
        Number(
            basket.previousWeight || 0
        ).toFixed(2) +
        " kg";


    document.getElementById(
        "resultCurrentWeight"
    ).textContent =
        Number(
            basket.currentWeight || 0
        ).toFixed(2) +
        " kg";


    document.getElementById(
        "resultWeightLoss"
    ).textContent =
        Number(
            basket.weightLoss || 0
        ).toFixed(2) +
        " kg";


    document.getElementById(
        "resultYield"
    ).textContent =
        Number(
            basket.yieldRate || 0
        ).toFixed(2) +
        "%";


    document.getElementById(
        "resultProcessTime"
    ).textContent =
        Number(
            basket.processTime || 0
        ) +
        " min";


    const warning =
        document.getElementById(
            "processWarning"
        );


    if (
        result.processCheck &&
        !result.processCheck.ok
    ) {

        warning.textContent =
            "⚠️ " +
            result.processCheck.message;

        warning.style.display =
            "block";

    } else {

        warning.textContent =
            "✓ Process Flow ถูกต้อง";

        warning.style.display =
            "block";

    }

}


// ================================================
// Feedback
// ================================================

function successFeedback() {

    // Android
    if (
        navigator.vibrate
    ) {

        navigator.vibrate(
            [100, 50, 100]
        );

    }


    // เสียง
    try {

        const audio =
            new Audio(
                "success.mp3"
            );

        audio.play()
            .catch(
                function(error) {

                    console.log(
                        "Audio blocked:",
                        error
                    );

                }
            );

    } catch(error) {

        console.log(error);

    }

}


// ================================================
// Message
// ================================================

function showMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "scannerMessage"
        );


    element.textContent =
        message;


    element.className =
        "message " + type;

}
