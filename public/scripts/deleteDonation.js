function deleteDonation(id){
	$.ajax({
		url: `/donations/${id}`,
		type: 'DELETE',
		success: function(result){
			window.location.reload(true);
		}
	});
};