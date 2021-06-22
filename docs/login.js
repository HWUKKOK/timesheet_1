
//======== login modal =======
// Get the modal
var modal = document.getElementById('id01');

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}


const formlog = document.getElementById("login-form");
const BtnLogin = document.getElementById("login-form-submit");
// const ErrorMessage = document.getElementById("login-error-msg");
BtnLogin.addEventListener("click", (e) => {

    e.preventDefault();
    const username = formlog.uname.value;
    const password = formlog.psw.value;

    if (username == "admin" && password == "admin") { 
        location.replace("approval.html"); 
    }else if (username === "talent" && password === "talent") { 
        location.replace("timesheet-checkin.html"); 
    }else if (username === "account" && password === "account") { 
        location.replace("billing.html"); 
    }else{
        alert("Sorry, wrong username or password. Pleaee try again.");
    }

});

