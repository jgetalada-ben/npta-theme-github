document.addEventListener('DOMContentLoaded', function () {

  // Hide the floating "Sign up now!" button inside Pop Convert's shadow root
  function hidePopConvertFloatingButton() {
    var host = document.querySelector('#pop-convert-app');
    if (!host || !host.shadowRoot) return false;

    var wrapper = host.shadowRoot.querySelector('.pc-buttons-trigger-wrapper');
    if (!wrapper) return false;

    // hide the wrapper (but keep it in the DOM so we can still click the button programmatically)
    wrapper.style.display = 'none';
    return true;
  }

  // Try repeatedly until Pop Convert finishes rendering
  (function watchForFloatingButton() {
    var attempts = 0;
    var maxAttempts = 40; // ~10 seconds if interval=250ms

    var intervalId = setInterval(function () {
      if (hidePopConvertFloatingButton() || attempts >= maxAttempts) {
        clearInterval(intervalId);
      }
      attempts++;
    }, 250);
  })();

  // Find Pop Convert's trigger button (inside shadow DOM)
  function getPopConvertTriggerButton() {
    // Just in case it ever appears in the normal DOM:
    var btn = document.querySelector('.pc-button.clickable-effect');
    if (btn) return btn;

    // Main case: inside #pop-convert-app shadow root
    var host = document.querySelector('#pop-convert-app');
    if (host && host.shadowRoot) {
      btn = host.shadowRoot.querySelector('.pc-button.clickable-effect');
      if (btn) return btn;
    }

    return null;
  }

  // Attach click handler to your custom buttons
  var customButtons = document.querySelectorAll('.js-popconvert-trigger');
  if (!customButtons.length) return;

  customButtons.forEach(function (btn) {
    btn.addEventListener('click', function (event) {
      event.preventDefault();

      var trigger = getPopConvertTriggerButton();
      if (trigger) {
        trigger.click(); // open popup
      } else {
        console.warn('Pop Convert trigger button not found (including shadow root).');
      }
    });
  });
});
