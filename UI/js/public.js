  // Initialize Swiper
const swiper = new Swiper('.swiper-container', {
    slidesPerView: 3,  // Default to 3 testimonials per slide
    spaceBetween: 30,
    loop: true,
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    breakpoints: {
        // When the screen width is 0px to 430px
        0: {
            slidesPerView: 1,  // Show only 1 testimonial per slide on small screens
            spaceBetween: 10,
        },
        // When the screen width is 768px or larger
        768: {
            slidesPerView: 2,  // Show 2 testimonials on tablets
            spaceBetween: 20,
        },
        // When the screen width is 1024px or larger
        1024: {
            slidesPerView: 3,  // Show 3 testimonials per slide on desktops and laptops
            spaceBetween: 30,
        }
    },
  });