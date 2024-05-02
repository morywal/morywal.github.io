window.addEventListener('scroll', function() {
    var nav = document.querySelector('.grid1');
  
    if (window.scrollY > 0) {
      nav.classList.add('grid1--scrolled');
    } else {
      nav.classList.remove('grid1--scrolled');
    }
  });

  document.addEventListener('DOMContentLoaded', function() {
    var imageContainer = document.querySelector('.image-scroll');
    var images = imageContainer.querySelectorAll('img');
    var currentIndex = 0;
    var interval = 3000; // Change this to adjust the interval between scrolls (in milliseconds)

    function scrollToNextImage() {
        var currentImage = images[currentIndex];
        var scrollAmount = currentImage.width; // Scroll amount based on current image width

        // Scroll to the next image
        imageContainer.scrollLeft += scrollAmount;

        // Increment index for the next image
        currentIndex = (currentIndex + 1) % images.length;

        // If reached the last image, reset to the first image
        if (currentIndex === 0) {
            setTimeout(function() {
                imageContainer.scrollLeft = 0;
            }, interval / 2); // Delay resetting to create smoother transition
        }

        setTimeout(scrollToNextImage, interval);
    }

    // Start scrolling automatically
    scrollToNextImage();
});

