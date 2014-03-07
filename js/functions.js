// cache the currently active item
var current_active;

// init foundation
$(document).foundation();

// init anchor
$('.anchor').waypoint(function(direction) {
	var itemname = this.id;
	var $previous = $(this).waypoint('prev');
	var $sidebar_nav_item = $('a.'+itemname);

	// if we're scrolling down, set the hit to be 
	if (direction == 'down') {
		$sidebar_nav_item.addClass('active');
	} else if (direction == 'up') {

		itemname = $previous.attr('id');
		$sidebar_nav_item = $('a.'+itemname);

		$sidebar_nav_item.addClass('active');
	}

	if (current_active)
		current_active.removeClass('active');
	current_active = $sidebar_nav_item;
}, { offset: 80 });

$('#Overview').waypoint(function(direction) {
	if (direction == 'down') {
		$('.nav').addClass('fixed');
	} else if (direction == 'up') {
		$('.nav').removeClass('fixed');
	}
}, { offset: -30 });

// $('.sidebar-nav').on('click', function() {
// 	$('.sidebar-nav').removeClass('active');
// 	$(this).addClass('active');
// });

// check to see if the window is too small for the sidebar. if so, make sure to make the overflow work!