document.addEventListener('DOMContentLoaded', function() {
  var forms = document.querySelectorAll('form');

  forms.forEach(function(form) {
    form.addEventListener('submit', function(event) {
      event.preventDefault();  // Prevent form submission immediately
      console.log('Form submission triggered.');

      // Execute reCAPTCHA before submitting the form
      executeRecaptcha('submit_form', function(token) {
        console.log('reCAPTCHA token generated:', token);  // Log token

        // Check if the token was generated
        if (token) {
          var recaptchaField = form.querySelector('input[name="recaptcha_token"]');
          
          // If recaptchaField doesn't exist, create it
          if (!recaptchaField) {
            recaptchaField = document.createElement('input');
            recaptchaField.type = 'hidden';
            recaptchaField.name = 'recaptcha_token';
            form.appendChild(recaptchaField);
          }

          // Set the token in the hidden field
          recaptchaField.value = token;
          console.log('Token set in form:', recaptchaField.value);

          // Submit the form after setting the token
          form.submit();
        } else {
          console.error('No reCAPTCHA token generated.');
        }
      });
    });
  });
});
