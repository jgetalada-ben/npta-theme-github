document.addEventListener('DOMContentLoaded', function () {
  // 1. Find Pop Convert's trigger button
  function getPopConvertTriggerButton() {
    // Uses the live sticky button rendered by Pop Convert
    return document.querySelector('.pc-button.clickable-effect');
  }

  // 2. Attach click handler to your custom buttons
  var customButtons = document.querySelectorAll('.js-popconvert-trigger');
  if (!customButtons.length) return;

  customButtons.forEach(function (btn) {
    btn.addEventListener('click', function (event) {
      event.preventDefault(); // prevent # link jump

      var trigger = getPopConvertTriggerButton();
      if (trigger) {
        trigger.click(); // Open the Pop Convert popup
      } else {
        console.warn('Pop Convert trigger button not found. Check if the popup button is enabled.');
      }
    });
  });
});
