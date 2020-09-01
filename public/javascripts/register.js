$(document).ready(function(){

	var emailSpan = document.createElement("span");
	emailSpan.id= "emailSpan";
	emailSpan.style.display="none"
	$("#email").after(emailSpan);
	var emailAvailable = false;
	var userAvailable = false;
	var passavail = false;
	$("#email").blur(function () {
		if(!$(this).val().includes('@')){
			$(emailSpan).text("please enter valid email").css("display", "inline");
			emailAvailable = false;
		}else {
			$(emailSpan).text("OK").css("display", "inline");
			emailAvailable = true;
		}
		if(!passavail||!userAvailable||!emailAvailable){
			$("#submit").hide();
		}else{
			$("#submit").show();
		}
	})

	var userSpan = document.createElement("span");
	userSpan.id = "userspan";
	userSpan.style.display="none"
	$("#username").after(userSpan);

	$("#username").blur(function(){
		if ($(this).val() == "") {
			$(userSpan).text("Username cannot be empty").css("display", "inline");
			userAvailable = false;
		} else {
			var name= $(this).val()
			$.ajax({
				type: "GET",
				url: "checkuser?username=" + name,
				success: function(good){
					console.log(good)
					if (good) {

						$(userSpan).text("choose another name").css("display", "inline");
						userAvailable = false;
					} else {
						$(userSpan).text("OK").css("display", "inline");
						userAvailable = true;
					}
				}
			});
		}
		if(!passavail||!userAvailable||!emailAvailable){
			$("#submit").hide();
		}else{
			$("#submit").show();
		}
	});

	var passSpan = document.createElement("span");
	passSpan.id = passSpan,
	passSpan.style.display="none"
	$("#password").after(passSpan);


	$("#password").blur(function(){
		if(!$(this).val().match('^(?=.*[0-9]+.*)(?=.*[a-zA-Z]+.*)[0-9a-zA-Z]{6,}$')){
			$(passSpan).text("Password must contain at least one letter one number and > six charaters.").css("display", "inline");
			passavail = false;
		} else {
			passavail = true;
			$(passSpan).text("OK").css("display", "inline");

		}
		if(!passavail||!userAvailable||!emailAvailable){
			$("#submit").hide();
		}else{
			$("#submit").show();
		}
	});



});
