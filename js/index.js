$(document).ready(function () {

	$('#signon-button').click(function(e) {
		login(e, computeUrl('users'));
	});

	$('#login-button').click(function(e) {
		login(e, computeUrl('login'));
	});
});

function login(e, url) {
	username = $('#username').val();
	password = $('#password').val();
	e.preventDefault();
	$.ajax({
		type: 'POST',
		url: url,
		data: JSON.stringify({
			'username': `${username}`,
			'password': `${password}`
		}),
		contentType: 'application/json; charset=utf-8',
		success: function(result) {
			localStorage.clear();
			localStorage['logged'] = true;
			localStorage['username'] = username;
			localStorage['token'] = result.token;
			window.location.href = 'reports.html';
		},
		error: function(result) {
			console.log(result);
			$('#login-error-message').text(result.responseJSON.message);
			$('#login-error').show();
		}
	});
}