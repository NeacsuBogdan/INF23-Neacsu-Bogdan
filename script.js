var explicit_content = false;
var slideshow;

async function init() {
  var localStorageAccepted = localStorage.getItem('localStorageAccepted');
  var snowfallSwitch = $('#snowfall-switch');
  var explicitSwitch = $('#explicit-switch');

  var popup = $('#cookie-popup');
  
  var acceptLocalStorageButton = $('#accept-localstorage-button');

  if (localStorageAccepted === null) {
    popup.css('display', 'block');
  } else {
    popup.css('display', 'none');
    var snowfallValue = localStorage.getItem('snowfall');
    var explicitValue = localStorage.getItem('explicit_content');
    snowfall.stopSnowfall();
    if (snowfallValue !== null) {
      snowfallSwitch.prop('checked', snowfallValue === 'true');
      if (snowfallValue === 'true') {
        snowfall.startSnowfall();
      } else {
        snowfall.stopSnowfall();
      }
    }

    if (explicitValue !== null) {
      explicitSwitch.prop('checked', explicitValue === 'true');
      explicit_content = explicitValue === 'true';
    }
  }

  acceptLocalStorageButton.click(function() {
    localStorage.setItem('localStorageAccepted', 'true');
    popup.css('display', 'none');
  
    localStorage.setItem('snowfall', 'true');
    localStorage.setItem('explicit_content', 'false');
  });

  $('#reject-button').click(function() {
    localStorage.removeItem('localStorageAccepted');
    popup.css('display', 'none');
  });

  await getPoeziiAndStoreInSessionStorage();

  slideshow = new Slideshow();
  slideshow.loadPoezii();
  slideshow.startSlideshow();

}

function getPoeziiAndStoreInSessionStorage() {
  return fetch('https://gist.githubusercontent.com/NeacsuBogdan/77699b57520104f3bc81940e560b14f9/raw/ad7fcfca5ae7afc3086a1776352445956424ba5b/poems.json')
    .then(response => response.json())
    .then(poezii => {
      if (Array.isArray(poezii)) {
        sessionStorage.setItem('poezii', JSON.stringify(poezii));
      } else {
        console.error('Data is not an array');
      }
    })
    .catch(error => console.error('Error:', error));
}

class Slideshow {
  constructor() {
    this.currentSlideIndex = 0;
    this.slides = [];
    this.slideshowContainer = $('#slideshow');
    this.popup = $('#popup');
    this.popupTitle = $('#popup-title');
    this.popupPoem = $('#popup-poem');
    this.closePopup = $('#close-popup');

    this.addClosePopupEvent();
  }

  loadPoezii() {
    const storedPoezii = sessionStorage.getItem('poezii');
    if (storedPoezii) {
      const poezii = JSON.parse(storedPoezii);
      let filteredPoezii;
      if (explicit_content) {
        filteredPoezii = poezii; 
      } else {
        filteredPoezii = poezii.filter(poezie => !poezie.explicit); 
      }      
      this.createSlides(filteredPoezii);
      this.showSlide(this.currentSlideIndex);
    } else {
      console.error('Nu sunt poezii in localstorage');
    }
  }


  hideSlides() {
    this.slides.forEach((slide) => {
      slide.css('display', 'none');
      slide.css('animation', '');
    });
  }

  showSlide(index) {
    this.slides[index].css('animation', 'slideAnimation 1s forwards');
    this.slides[index].css('position', 'relative');
    this.slides[index].css('display', 'block');
  }

  showNextSlide() {
    this.hideSlides();
    this.currentSlideIndex = (this.currentSlideIndex + 1) % this.slides.length;
    this.showSlide(this.currentSlideIndex);
  }

  createSlides(poezii) {
    poezii.forEach((poezie, index) => {
      const slide = $('<div></div>').addClass('slide');
  
      const versuri = poezie.continut.split('\n');
      const continut = $('<p></p>');
      if (versuri.length > 4) {
        const versuriAfisate = versuri.slice(0, 4);
        versuriAfisate.push('...');
        continut.text(versuriAfisate.join('\n'));
      } else {
        continut.text(versuri.join('\n'));
      }
      slide.append(continut);
  
      slide.click(() => {
        this.showPopup(poezie.titlu, poezie.continut);
      });
  
      this.slideshowContainer.append(slide);
      this.slides.push(slide);
    });
  
    this.hideSlides();
  }
  
  showPopup(titlu, continut) {
    this.popupTitle.text(titlu);
    this.popupPoem.text(continut);
    this.popup.css('display', 'block');
  }

  hidePopup() {
    this.popup.css('display', 'none');
  }

  addClosePopupEvent() {
    this.closePopup.click(() => {
      this.hidePopup();
    });
  }

  startSlideshow() {
    setInterval(() => {
      this.showNextSlide();
    }, 6000);
  }
}

class Snowfall {
  constructor() {
    this.canvas = $('<canvas></canvas>')
      .css('position', 'fixed')
      .css('top', '0')
      .css('left', '0')
      .css('pointer-events', 'none');
    $('body').append(this.canvas);

    this.ctx = this.canvas[0].getContext('2d');
    this.particles = [];
    this.animationFrameId = null;

    this.resizeCanvas();
    this.createParticles();
    this.drawParticles();
    this.addResizeEvent();
  }

  createParticle() {
    return {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 2 + 1,
      speedX: Math.random() * 1 - 0.5,
      speedY: Math.random() * 1 + 0.5
    };
  }

  createParticles() {
    this.particles = [];
    const numParticles = Math.floor(window.innerWidth / 10);
    for (let i = 0; i < numParticles; i++) {
      this.particles.push(this.createParticle());
    }
  }

  drawParticles() {
    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();

    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      this.ctx.moveTo(particle.x, particle.y);
      this.ctx.arc(
        particle.x,
        particle.y,
        particle.size,
        0,
        Math.PI * 2,
        true
      );

      particle.x += particle.speedX;
      particle.y += particle.speedY;

      if (particle.y > window.innerHeight) {
        particle.y = 0;
      }
    }

    this.ctx.fill();

    this.animationFrameId = requestAnimationFrame(() =>
      this.drawParticles()
    );
  }

  startSnowfall() {
    this.createParticles();
    this.drawParticles();
    this.resizeCanvas();
  }

  stopSnowfall() {
    cancelAnimationFrame(this.animationFrameId);
    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }

  resizeCanvas() {
    this.canvas[0].width = window.innerWidth;
    this.canvas[0].height = window.innerHeight;
    this.createParticles();
  }

  addResizeEvent() {
    $(window).resize(() => this.resizeCanvas());
  }
}

const snowfall = new Snowfall();

function startSnowfallBasedOnLocalStorage() {
  const snowfallLocalStorage = localStorage.getItem('snowfall');
  const snowfallSwitch = $('#snowfall-switch');
  snowfall.stopSnowfall(); // Am corectat aici
  if (snowfallLocalStorage === null || snowfallLocalStorage === 'true') {
    snowfall.startSnowfall();
    snowfallSwitch.prop('checked', true);
  } else {
    snowfall.stopSnowfall();
    snowfallSwitch.prop('checked', false);
  }
}

function toggleSnowfall() {
  const snowfallSwitch = $('#snowfall-switch');
  if (snowfallSwitch.prop('checked')) {
    snowfall.startSnowfall();
    if (localStorage.getItem('localStorageAccepted')) {
      localStorage.setItem('snowfall', 'true');
    }
  } else {
    snowfall.stopSnowfall();
    if (localStorage.getItem('localStorageAccepted')) {
      localStorage.setItem('snowfall', 'false');
    }
  }
}

function toggleExplicitContent() {
  const explicitSwitch = $('#explicit-switch');
  explicit_content = explicitSwitch.prop('checked');
  if (localStorage.getItem('localStorageAccepted')) {
    localStorage.setItem('explicit_content', explicit_content.toString());
  }
  updateSlidesVisibility();
}

function updateSlidesVisibility() {
  const storedPoezii = sessionStorage.getItem('poezii');
  if (storedPoezii) {
    const poezii = JSON.parse(storedPoezii);
    let filteredPoezii = [];
    if (explicit_content) {
      filteredPoezii = poezii;
    } else {
      filteredPoezii = poezii.filter(poezie => !poezie.explicit);
    }
    slideshow.createSlides(filteredPoezii);
    slideshow.showSlide(slideshow.currentSlideIndex);
  } else {
    console.error('Nu sunt poezii in localstorage!');
  }
}

function myFunction() {
  var x = $('#myTopnav');
  if (x.hasClass('responsive')) {
    x.removeClass('responsive');
  } else {
    x.addClass('responsive');
  }
}

function loadPortofoliu() {
  $('#portofoliu').removeClass('hidden');
  $('#slideshow').addClass('hidden');
  $('#moon-container').hide();
  $('.topnav a.active').removeClass('active');
  $('.topnav a[href="#portofoliu"]').addClass('active');
}

function loadHome() {
  $('#slideshow').removeClass('hidden');
  $('#portofoliu').addClass('hidden');
  $('#moon-container').show(); // Afișează containerul de lună
  $('.topnav a.active').removeClass('active');
  $('.topnav a[href="#home"]').addClass('active');
}

function openSettingsPanel() {
  const settingsPanel = $('#settings-panel');
  settingsPanel.css('right', '0');
}

function closeSettingsPanel() {
  const settingsPanel = $('#settings-panel');
  settingsPanel.css('right', '-500px');
}

class MoonPhase {
  constructor(svgId, containerId, phases) {
    this.svg = $('#' + svgId);
    this.container = $('#' + containerId);
    this.phases = phases;
    this.currentPhase = 0;
    this.direction = 1;

    this.setup();
    this.startTransition();
  }

  setup() {
    this.svg.css('transition', 'opacity 1s');
  }

  startTransition() {
    setInterval(() => {
      this.currentPhase += this.direction;
      if (this.currentPhase >= this.phases.length || this.currentPhase < 0) {
        this.direction *= -1;
        this.currentPhase += this.direction * 2;
      }
      this.transitionToNextPhase();
    }, 3000);
  }

  transitionToNextPhase() {
    const newMoonPhase = this.phases[this.currentPhase];
  
    const nextMoonPhase = $('<path></path>').attr('d', newMoonPhase);
    nextMoonPhase.css('opacity', 0);
    this.svg.append(nextMoonPhase);
  
    setTimeout(() => {
      this.svg.css('opacity', 0);
      nextMoonPhase.css('opacity', 1);
  
      setTimeout(() => {
        this.svg.attr('d', newMoonPhase);
        nextMoonPhase.remove(); // Am corectat aici
        this.svg.css('opacity', 1);
      }, 500); // Timpul de așteptare între trecerea fazelor (500ms)
    }, 100); // Timpul de așteptare înainte de a începe tranziția (100ms)
  }
}

var moonPhases = [
  'M5,201.9c35.2,24.1,28.4,79,3.1,94.6c-5.5,3.4,10.8,0.4,19-4C73,267.6,52.1,200.1,5,201.9z',
  'M63.6,297.9c34.8,2,62.2-40.4,40.1-74.3c-10.8-16.5-28.8-22.3-40.1-21.6C63.6,233.9,63.6,265.9,63.6,297.9z',
  'M136.1,296.5c5,4.6,47.9,2.8,56.9-35.9c7.7-33.3-21.4-64-55.2-58c-4.1,0.7-11.5,10.8-14.3,15.9C110.3,243.1,115.7,277.8,136.1,296.5z',
  'M250,201.7c26.6,0,48.2,21.6,48.2,48.2c-0.1,26.6-21.6,48.1-48.2,48.1c-26.5,0-48.1-21.5-48.2-48.1C201.7,223.5,223.4,201.8,250,201.7z',
  'M376.5,218.4c-2.8-5.1-10.2-15.2-14.3-15.9c-33.9-6-62.9,24.8-55.2,58c9,38.7,51.9,40.5,56.9,35.9C384.3,277.8,389.7,243.1,376.5,218.4z',
  'M436.4,201.9c-11.4-0.7-29.4,5-40.1,21.6c-22.1,33.9,5.4,76.4,40.1,74.3C436.4,265.9,436.4,233.9,436.4,201.9z',
  'M472.9,292.5c8.2,4.4,24.5,7.4,19,4c-25.3-15.7-32.1-70.6,3.1-94.6C447.9,200.1,427,267.6,472.9,292.5z'
];

var moon = new MoonPhase('moon-svg', 'moon-container', moonPhases);

$(document).ready(function() {
  init();
  startSnowfallBasedOnLocalStorage();
});
