$(document).ready(function() {
    $("#signinform").submit(function(event) {
      event.preventDefault(); 
  
    
      var email = $("#email").val();
      var password = $("#password").val();
      var confirmPassword = $("#confirmpassword").val();
      if (email.indexOf("@") === -1) {
        $("#errorparams").text("L'email deve contenere il simbolo '@'.");
        return; 
      } else {
        $("#errorparams").text(""); 
      }
      if (password !== confirmPassword) {
        $("#errorparams").text("Le password non corrispondono.");
        return; 
      } else {
        $("#errorparams").text(""); 
      } 
    });
  });