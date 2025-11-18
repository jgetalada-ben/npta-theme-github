document.addEventListener('DOMContentLoaded', function () {
  // 1. Find Pop Convert's trigger button
  function getPopConvertTriggerButton() {
    // ❗ Replace this selector with the real one from Inspect
    return document.querySelector('.pc-sticky-button');
  }

  // 2. Attach click handler to your custom buttons
  var customButtons = document.querySelectorAll('.js-popconvert-trigger');
  if (!customButtons.length) return;

  customButtons.forEach(function (btn) {
    btn.addEventListener('click', function (event) {
      event.preventDefault();

      var trigger = getPopConvertTriggerButton();
      if (trigger) {
        trigger.click(); // Open the Pop Convert popup
      } else {
        console.warn('Pop Convert trigger button not found. Check the selector in getPopConvertTriggerButton().');
      }
    });
  });
});
