/* eslint-disable */
//import showAlert from '/alert.js';

// Wait for the dom to be loaded
document.addEventListener('DOMContentLoaded', (event) => {
  console.log('Dom content is loaded.');

  // Listen for the form submit
  document.querySelector('.register-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('confirm-password').value;

    console.log(username, email);

    register(username, email, password, passwordConfirm);
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

const register = async (username, email, password, passwordConfirm) => {
  await axios({
    method: 'POST',
    url: 'http://127.0.0.1:3000/api/v1/users/signup',
    data: {
      username,
      email,
      password,
      passwordConfirm,
    },
  })
    .then((response) => {
      console.log(response.data);
      if (response.data.status === 'success') {
        showAlert('success', 'You register successfully.');

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
