function deleteSchool(id){
	$.ajax({
		url: `/schools/${id}`,
		type: 'DELETE',
		success: function(result){
			window.location.reload(true);
		}
	});
};