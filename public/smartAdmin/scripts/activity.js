/* jade

	span.activity-dropdown(id='activity')
		i.fa.fa-user
		b.badge  21
	div.ajax-dropdown
		div.btn-group.btn-group-justified(data-toggle='buttons')
			label.btn.btn-default
				input(type='radio', name='activity',id='/smartAdmin/ajax/notify/mail.html')
				| Msgs (14)
			label.btn.btn-default
				input(type='radio', name='activity',id='/smartAdmin/ajax/notify/notifications.html')
				| notify (3)
			label.btn.btn-default
				input(type='radio', name='activity',id='/smartAdmin/ajax/notify/tasks.html')
				| Tasks (4)
		div.ajax-notifications.custom-scroll
			div.alert.alert-transparent
				h4 Click a button to show messages here
				| This blank page message helps protect your privacy, or you can show the first message here automatically.
			i.fa.fa-lock.fa-4x.fa-border
		button.btn.btn-default
			i.glyphicon.glyphicon-refresh

*/

//----------

jQuery(document).ready(function() {
	// ACTIVITY
	// ajax drop
	$('#activity').click(function(e) {
		var $this = $(this);
		if ($this.find('.badge').hasClass('bg-color-red')){
			$this.find('.badge').removeClass('bg-color-');
			$this.find('.badge').text("0");
		}
		if (!$this.next('.ajax-dropdown').is(':visible')) {
			$this.next('.ajax-dropdown').fadeIn(150);
			$this.addClass('active');
		} else {
			$this.next('.ajax-dropdown').fadeOut(150);
			$this.removeClass('active');
		}
		var mytest = $this.next('.ajax-dropdown').find('.btn-group > .active > input').attr('id');
		//console.log(mytest)
		e.preventDefault();
	});
	$('input[name="activity"]').change(function() {
		//alert($(this).val())
		var $this = $(this);
		url = $this.attr('id');
		container = $('.ajax-notifications');
		loadURL(url, container);
	});
	$(document).mouseup(function(e) {
		if (!$('.ajax-dropdown').is(e.target) && $('.ajax-dropdown').has(e.target).length === 0) {
			$('.ajax-dropdown').fadeOut(150);
			$('.ajax-dropdown').prev().removeClass("active");
		}
	});
	$('button[data-btn-loading]').on('click', function() {
		var btn = $(this);
		btn.button('loading');
		setTimeout(function() {
			btn.button('reset');
		}, 3000);
	});
	// NOTIFICATION IS PRESENT
	function notification_check() {
		$this = $('#activity > .badge');
		if (parseInt($this.text()) > 0) {
			$this.addClass("bg-color-red bounceIn animated");
		}
	}
	notification_check();
});

function loadURL(url, container) {
	$.ajax({
		type : "GET",
		url : url,
		dataType : 'html',
		cache : true, // (warning: setting it to false will cause a timestamp and will call the request twice)
		beforeSend : function() {

			//IE11 bug fix for googlemaps
			//check if the page is ajax = true, has google map class and the container is #content
			if ($.navAsAjax && $(".google_maps")[0] && (container[0] == $("#content")[0])) {

				// target gmaps if any on page
				var collection = $(".google_maps"),
					i = 0;
				// run for each	map
				collection.each(function() {
					i ++;
					// get map id from class elements
					var divDealerMap = document.getElementById(this.id);

					if(i == collection.length + 1) {
						// "callback"
						//console.log("all maps destroyed");
					} else {
						// destroy every map found
						if (divDealerMap) divDealerMap.parentNode.removeChild(divDealerMap);
						//console.log(this.id + " destroying maps...");
					}
				});

				//console.log("google maps nuked!!!");

			}; //end fix

			// destroy all datatable instances
			if ( $.navAsAjax && $('.dataTables_wrapper')[0] && (container[0] == $("#content")[0])) {

				var tables = $.fn.dataTable.fnTables(true);
				$(tables).each(function () {
					$(this).dataTable().fnDestroy();
				});
				//console.log("datatable nuked!!!");
			}
			// end destroy

			// pop intervals
			if ( $.navAsAjax && $.intervalArr.length > 0 && (container[0] == $("#content")[0])) {

				while($.intervalArr.length > 0)
					clearInterval($.intervalArr.pop());
				//console.log("all intervals cleared..")

			}
			// end pop intervals

			// place cog
			container.html('<h1 class="ajax-loading-animation"><i class="fa fa-cog fa-spin"></i> Loading...</h1>');
			//console.log('cog replaced')

			// Only draw breadcrumb if it is main content material
			// TODO: see the framerate for the animation in touch devices

			if (container[0] == $("#content")[0]) {
				drawBreadCrumb();
				// scroll up
				$("html").animate({
					scrollTop : 0
				}, "fast");
			}

			// end if
		},
		success : function(data) {
			container.css({
				opacity : '0.0'
			}).html(data).delay(50).animate({
				opacity : '1.0'
			}, 300);
		},
		error : function(xhr, ajaxOptions, thrownError) {
			container.html('<h4 class="ajax-loading-error"><i class="fa fa-warning txt-color-orangeDark"></i> Error 404! Page not found.</h4>');
		},
		async : true
	});

	//console.log("ajax request sent");
}