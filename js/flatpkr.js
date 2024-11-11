flatpickr("#checkin-date", {
    dateFormat: "M d, Y",
    minDate: "today",
    onChange: function(selectedDates, dateStr, instance) {
        flatpickr("#checkout-date", {
            dateFormat: "M d, Y",
            minDate: dateStr
        });
    }
});

flatpickr("#checkout-date", {
    dateFormat: "M d, Y",
    minDate: "today"
});
