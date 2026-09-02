document.addEventListener('DOMContentLoaded', function(){
  // Menu mobile
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('mainNav');
  if(toggle && nav){
    toggle.addEventListener('click', function(){
      nav.classList.toggle('open');
    });
  }

  // Sous-menu Services au clic (mobile)
  document.querySelectorAll('.has-dropdown > .dropdown-toggle').forEach(function(link){
    link.addEventListener('click', function(e){
      if(window.innerWidth <= 860){
        e.preventDefault();
        link.parentElement.classList.toggle('open');
      }
    });
  });

  // Apparition au scroll
  var revealEls = document.querySelectorAll('.min-reveal');
  if('IntersectionObserver' in window){
    var obs = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, {threshold:.15});
    revealEls.forEach(function(el){ obs.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('is-visible'); });
  }

  // Chiffres animés
  var counters = document.querySelectorAll('.min-stat-num[data-count]');
  var counted = new WeakSet();
  function animateCount(el){
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1200, start = null;
    function step(ts){
      if(!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      el.textContent = Math.floor(progress * target) + suffix;
      if(progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if('IntersectionObserver' in window){
    var cobs = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting && !counted.has(entry.target)){
          counted.add(entry.target);
          animateCount(entry.target);
        }
      });
    }, {threshold:.4});
    counters.forEach(function(el){ cobs.observe(el); });
  } else {
    counters.forEach(animateCount);
  }
});
