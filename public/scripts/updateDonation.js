function updateDonation(id) {
	const payload = $('#editDonation').serialize();
	$.ajax({
		url: `/donations/${id}`,
		type: 'PUT',
		data: payload,
		success: function(result){
			window.location.replace(".");
		}
	});
};