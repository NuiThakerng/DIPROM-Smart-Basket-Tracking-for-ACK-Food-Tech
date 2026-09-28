/************************************************
 SMART BASKET TRACKER
 Login
************************************************/

const WEBAPP_URL =
    "https://script.google.com/macros/s/AKfycbx24B1tWuPuMCEbAXaNG92WGT4ffLlPWYvXzjBKv6N12pAbsqsT87ekVPxS2OX9e-mMWA/exec";


const loginForm =
    document.getElementById("loginForm");


const loginButton =
    document.getElementById("loginButton");


const loginMessage =
    document.getElementById("loginMessage");


loginForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        const employeeId =
            document
                .getElementById("employeeId")
                .value
                .trim();

        const pin =
            document
                .getElementById("pin")
                .value
                .trim();


        if (!employeeId || !pin) {

            showMessage(
                "กรุณากรอก Employee ID และ PIN",
                "error"
            );

            return;
        }


        loginButton.disabled = true;

        loginButton.textContent =
            "กำลังเข้าสู่ระบบ...";


        try {

            const response =
                await fetch(WEBAPP_URL, {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "text/plain;charset=utf-8"
                    },

                    body: JSON.stringify({

                        actionType: "login",

                        employeeId: employeeId,

                        pin: pin

                    })

                });


            const result =
                await response.json();


            console.log(
                "Login response:",
                result
            );


            if (!result.success) {

                throw new Error(
                    result.message ||
                    "เข้าสู่ระบบไม่สำเร็จ"
                );

            }


            // เก็บข้อมูลพนักงานไว้ใน Session
            sessionStorage.setItem(
                "employee",
                JSON.stringify(
                    result.employee
                )
            );


            showMessage(
                "เข้าสู่ระบบสำเร็จ",
                "success"
            );


            setTimeout(
                function() {

                    window.location.href =
                        "index.html";

                },
                500
            );


        } catch (error) {

            console.error(error);

            showMessage(
                "ไม่สามารถเชื่อมต่อระบบได้: " +
                error.message,
                "error"
            );

        } finally {

            loginButton.disabled = false;

            loginButton.textContent =
                "Login";

        }

    }
);


function showMessage(
    message,
    type
) {

    loginMessage.textContent =
        message;

    loginMessage.className =
        "message " + type;

}
