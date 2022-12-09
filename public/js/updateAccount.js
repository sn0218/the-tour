/* eslint-disable */
// Wait for the dom to be loaded
document.addEventListener('DOMContentLoaded', (event) => {
  console.log('Dom content is loaded.');

  // Listen for submit of change photo
  document
    .querySelector('.form-photo')
    .addEventListener('submit', async (e) => {
      e.preventDefault();

      // create multipart form data
      const form = new FormData();
      form.append('photo', document.getElementById('photo').files[0]);

      const res = await updateUserPhoto(form);

      // rerender the new photo
      loadUserPhoto(res.data.user.photo);
    });

  // Listen for submit of updating user data
  document
    .querySelector('.form-user-data')
    .addEventListener('submit', async (e) => {
      e.preventDefault();

      // create multipart form data
      const form = new FormData();
      form.append('username', document.getElementById('name').value);
      form.append('email', document.getElementById('email').value);

      const username = document.getElementById('name').value;
      const email = document.getElementById('email').value;

      updateUserInfo(form, 'info');

      document.getElementById('profile-username').textContent = username;
      document.getElementById('nav-username').textContent = username;
    });

  // listen for submit of changing password
  document
    .querySelector('.form-user-password')
    .addEventListener('submit', async (e) => {
      e.preventDefault();

      // set button value when updating password
      document.querySelector('.btn--save-password').textContent =
        'Updating password';

      const passwordCurrent = document.getElementById('password-current').value;
      const password = document.getElementById('password').value;
      const passwordConfirm = document.getElementById('password-confirm').value;

      await updateUserInfo(
        { passwordCurrent, password, passwordConfirm },
        'password'
      );

      // after updating password, set all the fields to empty value
      document.querySelector('.btn--save-password').textContent =
        'Save password';
      document.getElementById('password-current').value = '';
      document.getElementById('password').value = '';
      document.getElementById('password-confirm').value = '';
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

const updateUserInfo = async (data, type) => {
  const url =
    type === 'password'
      ? `/api/v1/users/updatepassword`
      : `/api/v1/users/updateinfo`;
  console.log(data);
  await axios({
    method: 'PATCH',
    url: url,
    data: data,
  })
    .then((response) => {
      console.log(response.data.status);
      if (response.data.status === 'success') {
        showAlert('success', `Your ${type} is updated successfully.`);
      }
    })
    .catch((error) => {
      showAlert('error', 'Error in updating account info. Please try again.');
    });
};

const updateUserPhoto = async (data) => {
  const url = `/api/v1/users/updateinfo`;

  return await axios({
    method: 'PATCH',
    url: url,
    data: data,
  })
    .then((response) => {
      if (response.data.status === 'success') {
        showAlert('success', `Your profile picture is updated successfully.`);
      }
      return response.data;
    })
    .catch((error) => {
      showAlert('error', 'Error in updating account info. Please try again.');
    });
};

const loadUserPhoto = (filename) => {
  let img = document.querySelector('#user-photo');
  let navImg = document.querySelector('#user-photo-nav');
  img.src = `/img/users/${filename}?` + new Date().getTime();
  navImg.src = `/img/users/${filename}?` + new Date().getTime();
};
