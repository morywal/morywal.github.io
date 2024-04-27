window.addEventListener('scroll', function() {
    var nav = document.querySelector('.grid1');
  
    if (window.scrollY > 0) {
      nav.classList.add('grid1--scrolled');
    } else {
      nav.classList.remove('grid1--scrolled');
    }
  });