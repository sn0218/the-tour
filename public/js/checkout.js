/* eslint-disable */
// Wait for the dom to be loaded
document.addEventListener('DOMContentLoaded', (event) => {
  console.log('Dom content is loaded.');

  // listen for click of book button
  document.querySelector('#book-tour').addEventListener('click', async (e) => {
    document.getElementById('book-tour').textContent = `Processing...`;

    // extract tourId
    const { tourId } = e.target.dataset;
    bookTour(tourId);
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

const bookTour = async (tourId) => {
  try {
    // get access to the stripe checkout page
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    showAlert('success', 'You book the tour successfully.');

    // works as expected
    window.location.replace(session.data.session.url);
  } catch (err) {
    showAlert('error', 'Something went wrong in booking tour.');
    console.log(err);
  }
};
