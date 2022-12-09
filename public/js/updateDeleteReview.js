/* eslint-disable */
// Wait for the dom to be loaded
document.addEventListener('DOMContentLoaded', (event) => {
  console.log('Dom content is loaded.');

  let checkBoxElems = document.querySelectorAll("input[type='checkbox']");
  let reviewId = '';
  let tourName = '';
  let reviewRating = '';
  let reviewContent = '';

  // listen for multiple checkboxes
  if (checkBoxElems.length > 0) {
    for (let i = 0; i < checkBoxElems.length; i++) {
      checkBoxElems[i].addEventListener('click', (e) => {
        reviewId = e.target.dataset.reviewId;
        tourName = e.target.dataset.tourName;
        reviewRating = e.target.dataset.reviewRating;
        reviewContent = e.target.dataset.reviewContent;
      });
    }
  }

  // listen for click of cancel button
  const cancelBtn = document.querySelector('.cancel-btn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', (e) => {
      document.querySelector(
        '#modal-text'
      ).innerHTML = `Are you sure you want to cancel this review - ${tourName}?`;
    });
  }

  // listen for click of review cancel button
  const bookingCancelBtn = document.querySelector('.review-cancel-btn');
  if (bookingCancelBtn) {
    bookingCancelBtn.addEventListener('click', async (e) => {
      await cancelReview(reviewId);
    });
  }

  // listen for edit button
  const editBtn = document.querySelector('.edit-btn');
  if (editBtn) {
    editBtn.addEventListener('click', async (e) => {
      console.log('edit clicked');
      document.querySelector(
        '#form-review-data-text'
      ).innerHTML = `Update Your Review - ${tourName}`;

      // pre-fill the form with data
      document.getElementById('rating').value = reviewRating;
      document.getElementById('message').value = reviewContent;
    });
  }

  // Listen for submit of review btn
  const reviewForm = document.querySelector('#form-review-data');

  if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const rating = document.getElementById('rating').value;
      const content = document.getElementById('message').value;

      await editReview({ rating, content }, reviewId);
    });
  }
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

const editReview = async (data, reviewId) => {
  const url = `/api/v1/reviews/${reviewId}/`;
  await axios({
    method: 'PATCH',
    url: url,
    data: data,
  })
    .then((response) => {
      if (response.data.status === 'success') {
        showAlert('success', `Your review is updated successfully.`);

        window.setTimeout(() => {
          location.assign(`/my-reviews`);
        }, 1200);
      }
    })
    .catch((error) => {
      showAlert('error', 'Error in updating review. Please try again.');
    });
};

const cancelReview = async (reviewId) => {
  // cancel the booking via API
  try {
    // get access to the stripe checkout page
    const session = await axios.delete(`/api/v1/reviews/${reviewId}`);

    showAlert('success', 'You delete the review successfully.');

    window.setTimeout(() => {
      location.assign(`/my-reviews`);
    }, 1200);
  } catch (err) {
    showAlert('error', 'Something went wrong in deleting the review.');
    console.log(err);
  }
};
