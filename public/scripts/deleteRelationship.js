function deleteStudentsDonation(studentId, donationId){
	$.ajax({
		url: `/studentsDonations/${studentId}/${donationId}`,
		type: 'DELETE',
		success: function(result){
			window.location.reload(true);
		}
	});
};

function deleteStudentSponsor(studentId, sponsorId){
	$.ajax({
		url: `/studentsSponsors/${studentId}/${sponsorId}`,
		type: 'DELETE',
		success: function(result){
			window.location.reload(true);
		}
	});
};

$(document).ready(function() {
	$('#addStudentDonation').submit(addStudentsDonation);
	$('#add').click(addStudentsDonation);
	$('#filterOn').click(filterByStudent);
	$('#filterOff').click(viewAll);
});

function addStudentsDonation(event) {
	event.preventDefault();

	const payload = $('#addStudentDonation').serialize();
	$.ajax({
		url: `/studentsDonations`,
		type: 'POST',
		data: payload,
		success: function(result) {
			window.location.reload(true);
		},
		error: function(err) {
			console.error(err.responseText);
			$('#errMsg').text(err.responseText);
		}
	});
};

function filterByStudent() {
	const studentId = $('#filterBy option:selected').val();
	window.location.href = '/studentsDonations/filter?id=' + studentId;
}

function viewAll() {
	window.location.replace('.');
}

