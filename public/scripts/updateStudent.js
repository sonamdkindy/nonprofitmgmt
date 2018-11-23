function updateStudent(id) {
	const payload = $('#editStudent').serialize();
	$.ajax({
		url: `/students/${id}`,
		type: 'PUT',
		data: payload,
		success: function(result){
			window.location.replace(".");
		}
	});
};

$(document).ready(function() {
	checkSelectInIndia();
	$('#school').on('change', checkSelectInIndia);
});

function checkSelectInIndia() {
	if($('#school option:selected').text().indexOf('Uni') === -1 || $('#isSecondary').val() === '0') {
		$('#inIndia').prop('checked', true);
	} else {
		$('#inIndia').prop('checked', false);
	}
};