/* eslint-disable */
// Wait for the dom to be loaded
document.addEventListener('DOMContentLoaded', (event) => {
  console.log('Dom content is loaded.');

  let checkBoxElems = document.querySelectorAll("input[type='checkbox']");
  let bookingId;
  let tourName;

  // listen for multiple checkboxes
  if (checkBoxElems.length > 0) {
    for (let i = 0; i < checkBoxElems.length; i++) {
      checkBoxElems[i].addEventListener('click', (e) => {
        bookingId = e.target.dataset.bookingId;
        tourName = e.target.dataset.tourName;
      });
    }
  }
  // listen for click of booking cancel button
  const cancelBtn = document.querySelector('.cancel-btn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', (e) => {
      document.querySelector(
        '#modal-text'
      ).innerHTML = `Are you sure you want to cancel this booking - ${tourName}?`;
    });
  }

  // listen for click of booking cancel button
  const bookingCancelBtn = document.querySelector('.booking-cancel-btn');
  if (bookingCancelBtn) {
    bookingCancelBtn.addEventListener('click', async (e) => {
      await cancelBooking(bookingId);
    });
  }
});

const cancelBooking = async (bookingId) => {
  // cancel the booking via API
  try {
    // get access to the stripe checkout page
    const session = await axios.delete(`/api/v1/bookings/${bookingId}`);

    showAlert('success', 'You cancel the booking successfully.');

    // works as expected
    location.assign('/bookings');
  } catch (err) {
    showAlert('error', 'Something went wrong in canceling the booking.');
    console.log(err);
  }
  /* await axios
    .delete(`/api/v1/bookings/${bookingId}`)
    .then((response) => {
      console.log(response.data);
      if (response.data.status === 'success') {
        showAlert('success', 'You cancel the booking successfully.');

        window.setTimeout(() => {
          location.assign('/');
        }, 1000);
      }
    })
    .catch((error) => {
      showAlert('error', 'Something went wrong in canceling the booking.');
      console.log(error);
    }); */
};

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
