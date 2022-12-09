/* eslint-disable */
// wait for the dom to be loaded
document.addEventListener('DOMContentLoaded', (event) => {
  console.log('dom is already loaded.');
  // extract the string from HTML
  const locations = JSON.parse(
    // eslint-disable-next-line no-undef
    document.getElementById('map').dataset.locations
  );
});

/* const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations); */
