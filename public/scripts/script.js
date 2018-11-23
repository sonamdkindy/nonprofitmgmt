$("document").ready(function() {
	setActiveInNav();
	initYearPicker();
});

function setActiveInNav() {
	let pathname = window.location.pathname;
	if(pathname.lastIndexOf('/') > 0) {
		pathname = pathname.substr(0, pathname.lastIndexOf('/') - 1);
	}
	$('.navbar').find('.active').removeClass('active');
	$(`.navbar a[href='${pathname}']`).addClass('active');
}

function initYearPicker() {
	$("#datepicker").datepicker({
		format: "yyyy",
		viewMode: "years", 
		minViewMode: "years"
	});
}