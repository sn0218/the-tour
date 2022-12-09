/* eslint-disable */
//import showAlert from '/alert.js';

// Wait for the dom to be loaded
document.addEventListener('DOMContentLoaded', (event) => {
  console.log('Dom content is loaded.');

  // Listen for the form submit
  document.querySelector('.login-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password);
  });
});

const showAlert = (type, msg) => {
  // before showing alert, hide alert first
  hideAlert();
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);

  window.setTimeout(hideAlert, 5000);
};

const hideAlert = () => {
  const element = document.querySelector('.alert');

  if (element) {
    element.parentElement.removeChild(element);
  }
};

const login = async (email, password) => {
  await axios({
    method: 'POST',
    url: '/api/v1/users/login',
    data: {
      email,
      password,
    },
  })
    .then((response) => {
      console.log(response.data);
      if (response.data.status === 'success') {
        showAlert('success', 'You log in successfully.');

        window.setTimeout(() => {
          location.assign('/');
        }, 1000);
      }
    })
    .catch((error) => {
      console.log('Error:', error.response.data.message);
      showAlert('error', error.response.data.message);
    });
};

// ALTERNATIVE: Fetch API
/* const login = async (email, password) => {
  console.log(email, password);
  const url = 'http://127.0.0.1:3000/api/v1/users/login';
  const res = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    body: JSON.stringify({ email, password }),
  })
    .then((response) => response.json())
    .then((result) => {
      console.log('Status:', result.status);
      // redirect to homepage if login successfully
      if (result.status === 'success') {
        window.setTimeout(() => {
          location.assign('/');
        }, 1000);
      } else if (result.status === 'fail') {
        alert(result.message);
        console.log('Message:', result.message);
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
};
 */
