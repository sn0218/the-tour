/* eslint-disable */

// Wait for the dom to be loaded
document.addEventListener('DOMContentLoaded', (event) => {
  console.log('Dom content is loaded.');

  // Listen for click of log out button
  const logoutBtn = document.querySelector('.nav__el--logout');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      console.log('clicked');
      logout();
    });
  }
});

const logout = async () => {
  await axios({
    method: 'GET',
    url: '/api/v1/users/logout',
  })
    .then((response) => {
      if (response.data.status === 'success') {
        // redirect user to home page
        window.location.href = `/`;
      }
    })
    .catch((error) => {
      showAlert('error', 'Error in logging our. Please try again.');
    });
};
