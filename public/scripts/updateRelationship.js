function updateStudentsDonation(studentId, donationId) {
	const payload = $('#editStudentDonation').serialize();
	$.ajax({
		url: `/studentsDonations/${studentId}/${donationId}`,
		type: 'PUT',
		data: payload,
		success: function(result) {
			window.location.replace("..");
		},
		error: function(err) {
			console.error(err.responseText);
			$('#errMsg').text(err.responseText);
		}
	});
};

function updateStudentSponsor(studentId, sponsorId) {
	const payload = $('#editStudentSponsor').serialize();
	$.ajax({
		url: `/studentsSponsors/${studentId}/${sponsorId}`,
		type: 'PUT',
		data: payload,
		success: function(result){
			window.location.replace("..");
		}
	});
};