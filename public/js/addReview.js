/* eslint-disable */
// Wait for the dom to be loaded
document.addEventListener('DOMContentLoaded', (event) => {
  console.log('Dom content is loaded.');

  // Listen for submit of review btn
  const reviewForm = document.querySelector('#form-review-data');

  if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const rating = document.getElementById('rating').value;
      const content = document.getElementById('message').value;

      // extract our Id and slugified name
      const { tourId, slug } = e.target.dataset;

      await createReview({ rating, content }, tourId, slug);
    });
  }
});

const createReview = async (data, tourId, slug) => {
  const url = `/api/v1/tours/${tourId}/reviews`;
  await axios({
    method: 'POST',
    url: url,
    data: data,
  })
    .then((response) => {
      if (response.data.status === 'success') {
        showAlert('success', `Your review is posted successfully.`);

        window.setTimeout(() => {
          location.assign(`/tours/${slug}`);
        }, 1200);
      }
    })
    .catch((error) => {
      showAlert(
        'error',
        'Error in posting review or duplicated review. Please try again.'
      );
    });
};
