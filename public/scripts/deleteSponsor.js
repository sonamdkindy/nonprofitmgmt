function deleteSponsor(id){
	$.ajax({
		url: `/sponsors/${id}`,
		type: 'DELETE',
		success: function(result){
			window.location.reload(true);
		}
	});
};