(function(){
  "use strict";

  /* ---------- PARTICLES (ambient dust behind the whole page) ---------- */
  function initPetals(){
    var MAX_PETALS = 9;
    var activePetals = 0;
    var field = document.getElementById('petalField');
    if(!field) return;

    function spawnPetal(){
      if(activePetals >= MAX_PETALS) return;
      var p = document.createElement('div');
      p.className = 'petal';
      var size = 10 + Math.random()*10;
      var startX = Math.random()*100;
      var driftX = (Math.random()*140 - 70);
      var dur = 9 + Math.random()*7;
      var rot = (Math.random()*360);
      p.style.left = startX+'vw';
      p.style.width = size+'px';
      p.innerHTML = '<svg viewBox="-12 -12 24 24" style="width:100%"><use href="#petalShape" transform="rotate('+Math.round(rot)+')"/></svg>';
      field.appendChild(p);
      activePetals++;

      var start = null;
      function frame(ts){
        if(!start) start = ts;
        var t = (ts - start) / (dur*1000);
        if(t >= 1){
          p.remove();
          activePetals--;
          return;
        }
        var y = t * (window.innerHeight + 60) - 30;
        var x = startX + Math.sin(t*Math.PI*2) * (driftX/50) + (driftX*t*0.3);
        var opacity = t < 0.08 ? t/0.08 : (t > 0.85 ? (1-t)/0.15 : 1);
        p.style.transform = 'translate('+x+'vw,'+y+'px) rotate('+(rot + t*160)+'deg)';
        p.style.opacity = Math.max(0, Math.min(1, opacity)) * 0.85;
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }

    spawnPetal();
    setInterval(function(){
      if(document.visibilityState === 'visible') spawnPetal();
    }, 2600);
  }

  /* ---------- AUDIO (the actual wedding song; started on user gesture) ---------- */
  var audioEl = null, audioPlaying = false, audioFadeTimer = null, audioStarting = false;
  var TARGET_VOLUME = 0.55;

  function fadeAudio(to, ms){
    if(!audioEl) return;
    if(audioFadeTimer) clearInterval(audioFadeTimer);
    var from = audioEl.volume;
    var steps = Math.max(1, Math.round(ms/40));
    var i = 0;
    audioFadeTimer = setInterval(function(){
      i++;
      audioEl.volume = from + (to-from) * (i/steps);
      if(i >= steps){
        audioEl.volume = to;
        clearInterval(audioFadeTimer);
        audioFadeTimer = null;
        if(to === 0) audioEl.pause();
      }
    }, 40);
  }

  function setPlayingUI(isPlaying){
    audioPlaying = isPlaying;
    var btn = document.getElementById('musicToggle');
    if(btn) btn.classList.toggle('playing', isPlaying);
  }

  function playAudio(){
    if(!audioEl || audioPlaying || audioStarting) return;
    audioStarting = true;
    audioEl.volume = 0;
    var p = audioEl.play();
    if(p && typeof p.then === 'function'){
      p.then(function(){
        audioStarting = false;
        setPlayingUI(true);
        fadeAudio(TARGET_VOLUME, 700);
      }).catch(function(){
        audioStarting = false;
        /* Autoplay blocked: wait for the next real tap anywhere on the page. */
        setPlayingUI(false);
        armFirstInteractionFallback();
      });
    } else {
      audioStarting = false;
      setPlayingUI(true);
      fadeAudio(TARGET_VOLUME, 700);
    }
  }

  function pauseAudio(){
    if(!audioEl || !audioPlaying) return;
    setPlayingUI(false);
    fadeAudio(0, 400);
  }

  function toggleAudio(){
    if(!audioEl) return;
    if(audioPlaying) pauseAudio(); else playAudio();
  }

  var fallbackArmed = false;
  function armFirstInteractionFallback(){
    if(fallbackArmed) return;
    fallbackArmed = true;
    var events = ['pointerdown','touchstart','click','keydown'];
    function tryStart(){
      events.forEach(function(ev){ document.removeEventListener(ev, tryStart, true); });
      fallbackArmed = false;
      if(!audioPlaying) playAudio();
    }
    events.forEach(function(ev){ document.addEventListener(ev, tryStart, {capture:true, once:true, passive:true}); });
  }

  function initAudio(){
    audioEl = document.getElementById('bgAudio');
    if(!audioEl) return;
    audioEl.volume = 0;
    /* If the visitor arrived from the envelope, the tap that opened it already
       counts as a real gesture in most browsers — try to start the song right away. */
    var arrivedFromEnvelope = document.documentElement.classList.contains('from-envelope');
    if(arrivedFromEnvelope){
      playAudio();
    } else {
      armFirstInteractionFallback();
    }
  }

  /* ---------- COUNTDOWN ---------- */
  function initCountdown(){
    var target = new Date("2026-10-23T21:00:00+01:00").getTime();
    var days=document.getElementById('cd-days'), hours=document.getElementById('cd-hours'),
        mins=document.getElementById('cd-mins'), secs=document.getElementById('cd-secs'),
        msg=document.getElementById('cd-message');
    function tick(){
      var diff = target - Date.now();
      if(diff <= 0){
        days.textContent='00'; hours.textContent='00'; mins.textContent='00'; secs.textContent='00';
        msg.style.display='block'; clearInterval(timer); return;
      }
      days.textContent = String(Math.floor(diff/86400000)).padStart(2,'0');
      hours.textContent = String(Math.floor((diff%86400000)/3600000)).padStart(2,'0');
      mins.textContent = String(Math.floor((diff%3600000)/60000)).padStart(2,'0');
      secs.textContent = String(Math.floor((diff%60000)/1000)).padStart(2,'0');
    }
    tick();
    var timer = setInterval(tick, 1000);
  }

  /* ---------- SCROLL REVEALS ---------- */
  function initScrollAnimations(){
    var els = document.querySelectorAll('.reveal, .divider');
    if(!('IntersectionObserver' in window)){ els.forEach(function(e){ e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
      });
    },{threshold:.18});
    els.forEach(function(e){ io.observe(e); });
  }

  function initNavVisibility(){
    var nav = document.getElementById('siteNav');
    window.addEventListener('scroll', function(){
      if(window.scrollY > 60) nav.classList.add('show'); else nav.classList.remove('show');
    }, {passive:true});
  }

  function initVenue(){
    var link = document.getElementById('mapLink');
    var q = encodeURIComponent('Salle De Fêtes Versailles, Kairouan');
    link.href = 'https://www.google.com/maps/search/?api=1&query=' + q;
  }

  /* ---------- ENTRY TRANSITION CLEANUP ---------- */
  function initEntryTransition(){
    var root = document.documentElement;
    if(!root.classList.contains('from-envelope')) return;
    window.setTimeout(function(){
      root.classList.remove('from-envelope');
      try{ sessionStorage.removeItem('wedding:from-envelope'); }catch(e){}
    }, 1550);
  }

  /* ---------- INIT ---------- */
  function initializeApp(){

    initAudio();
    initPetals();
    initCountdown();
    initScrollAnimations();
    initNavVisibility();
    initVenue();
    initEntryTransition();
    document.getElementById('musicToggle').addEventListener('click', toggleAudio);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initializeApp);
  } else {
    initializeApp();
  }
})();
