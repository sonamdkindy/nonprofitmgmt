function updateSponsor(id) {
	const payload = $('#editSponsor').serialize();
	$.ajax({
		url: `/sponsors/${id}`,
		type: 'PUT',
		data: payload,
		success: function(result){
			window.location.replace(".");
		}
	});
};