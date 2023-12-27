const registerSwitch = document.getElementById('registerSwitch');
const loginSwitch = document.getElementById('loginSwitch');

const registerButton = document.getElementById('registerButton');
const loginButton = document.getElementById('loginButton');

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

const signText = document.getElementById('signText');

const errorAlert = document.getElementById('errorAlert');
const successAlert = document.getElementById('successAlert');

if (localStorage.getItem('user')) {
    window.location.href = 'note';
}


registerSwitch.addEventListener('click', () => {
    loginForm.classList.toggle('hidden');
    registerForm.classList.remove('hidden');
    signText.innerText = 'Sign up to your account';
});

loginSwitch.addEventListener('click', () => {
    registerForm.classList.toggle('hidden');
    loginForm.classList.remove('hidden');
    signText.innerText = 'Sign in to your account';
});

registerButton.addEventListener('click', (e) => {
    e.preventDefault();
    registerUser();
});

loginButton.addEventListener('click', (e) => {
    e.preventDefault();
    loginUser();
});

function registerUser() {
    const registerUsername = document.getElementById('registerUsername').value;
    const registerPassword = document.getElementById('registerPassword').value;
    const registerPasswordConfirm = document.getElementById('registerPasswordConfirm').value;

    if (registerUsername && registerPassword && registerPassword == registerPasswordConfirm) {
            const userData = {
                username: registerUsername,
                password: registerPassword,
            }
    
            fetch('/registerUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            })
            .then(response => response.text())
            .then(data => {
                if (data == 'Такое имя пользователя уже занято' || data == 'Ошибка при проверке имени пользователя' || data == 'Ошибка при добавлении пользователя') {
                    setTimeout(showAlert(errorAlert, data), 5000);
                } else {
                    setTimeout(showAlert(successAlert, data), 5000);
                    registerForm.classList.toggle('hidden');
                    loginForm.classList.remove('hidden');
                    signText.innerText = 'Sign in to your account';
                }
            })
            .catch((error) => {
                console.log(error);
            });
    } else {
        setTimeout(showAlert(errorAlert, 'Не хватает данных для создания или пароли не совпадают'), 5000);
    }
}

function showAlert(alert, data) {
    alert.classList.remove('hidden');
    alert.classList.add('block');
    alert.innerText = data;

    setTimeout(() => {
        alert.classList.remove('block');
        alert.classList.add('hidden');
    }, 5000);
}

function loginUser() {
    const loginUsername = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (loginUsername && password) {
        fetch(`/login/${loginUsername}`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ password: password })
        })
        .then(response => response.json())
        .then((data) => {
            if (data.success) {
                localStorage.setItem('user', JSON.stringify(data.userInfo));

                if (localStorage.getItem('user')) {
                    window.location.href = 'note';
                }
            } else {
                console.log('Ошибка' + data.message);   
            }
        })
        .catch((error) => {
            console.log(error);
            setTimeout(() => showAlert(errorAlert, 'Произошла ошибка'), 5000);
        });
    } else {
        setTimeout(() => showAlert(errorAlert, 'Введите Логин и Пароль'), 5000);
    }
}