document.addEventListener('DOMContentLoaded', function () {
  // Helper: find the Pop Convert trigger button
  function getPopConvertTriggerButton() {
    // 1. Try normal DOM (just in case)
    var btn = document.querySelector('.pc-button.clickable-effect');
    if (btn) return btn;

    // 2. Try inside Pop Convert's shadow root
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
      event.preventDefault(); // stop the "#" jump

      var trigger = getPopConvertTriggerButton();
      if (trigger) {
        trigger.click(); // open the popup
      } else {
        console.warn('Pop Convert trigger button not found (including shadow root).');
      }
    });
  });

  // (Optional) hide the sticky Pop Convert button visually
  var host = document.querySelector('#pop-convert-app');
  if (host && host.shadowRoot) {
    var wrapper = host.shadowRoot.querySelector('.pc-buttons-trigger-wrapper');
    if (wrapper) {
      wrapper.style.display = 'none';
    }
  }
});
