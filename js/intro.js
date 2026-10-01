(function(){
  "use strict";

  var APP_STATES = { INTRO:"intro", READY:"ready", OPENING:"opening", LEAVING:"leaving" };
  var state = APP_STATES.INTRO;

  /* ---------- PARTICLES ---------- */
  function initParticles(){
    var field = document.getElementById('particles');
    if(!field) return;
    for(var i=0;i<18;i++){
      var m = document.createElement('div');
      m.className = 'mote';
      m.style.left = (Math.random()*100)+'%';
      m.style.top = (Math.random()*100)+'%';
      m.style.animationDelay = (Math.random()*6)+'s';
      m.style.animationDuration = (7+Math.random()*6)+'s';
      field.appendChild(m);
    }
  }

  /* ---------- FALLING PETALS (subtle, limited count) ---------- */
  var MAX_PETALS = 9;
  var activePetals = 0;
  function spawnPetal(){
    if(activePetals >= MAX_PETALS) return;
    var field = document.getElementById('petalField');
    if(!field) return;
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
  var petalTimer = null;
  function initPetals(){
    spawnPetal();
    petalTimer = setInterval(function(){
      if(document.visibilityState === 'visible') spawnPetal();
    }, 2600);
  }

  /* ---------- DOVES ---------- */
  var dovesCreated = false;
  function createDoves(){
    if(dovesCreated) return;
    dovesCreated = true;
    var field = document.getElementById('doveField');
    var count = 18;
    for(var i=0;i<count;i++){
      var d = document.createElement('div');
      d.className = 'dove';
      var size = 16 + Math.random()*26;
      var angle = (Math.random()*160 - 80);
      var dist = 150 + Math.random()*260;
      var tx = Math.sin(angle*Math.PI/180) * dist;
      var ty = -(110 + Math.random()*280);
      var scale = 0.8 + Math.random()*0.6;
      d.style.width = size+'px';
      d.style.left = (48 + (Math.random()*14-7))+'%';
      d.style.top = (36 + Math.random()*8)+'%';
      d.style.setProperty('--tx', tx+'px');
      d.style.setProperty('--ty', ty+'px');
      d.style.setProperty('--sc', scale.toFixed(2));
      d.style.setProperty('--r0', (Math.random()*10-5)+'deg');
      d.style.setProperty('--r1', (Math.random()*46-23)+'deg');
      d.style.setProperty('--dur', (2.2 + Math.random()*1.6)+'s');
      d.style.animationDelay = (Math.random()*1.1)+'s';
      d.innerHTML = '<svg viewBox="0 0 60 40"><use href="#doveShape" transform="translate(28,22)"/></svg>';
      field.appendChild(d);
    }
  }

  /* ---------- ENVELOPE / OPENING SEQUENCE ---------- */
  function initEnvelope(){
    var btn = document.getElementById('openBtn');
    var wrap = document.getElementById('envelopeWrap');
    var intro = document.getElementById('intro');
    var label = document.getElementById('openBtnLabel');
    var dot = document.getElementById('loadingDot');
    if(!btn || !wrap || !intro) return;

    function armButton(){
      btn.disabled = false;
      label.textContent = 'فتح الدعوة';
      dot.style.display = 'none';
      state = APP_STATES.READY;
      btn.addEventListener('click', openInvitation, {once:true});
    }

    function openInvitation(){
      if(state !== APP_STATES.READY) return;
      state = APP_STATES.OPENING;
      btn.disabled = true;
      intro.classList.add('opening');
      wrap.classList.add('opening');

      /* The browser may block audio, but the gesture itself is still used as the
         trusted interaction that starts the cross-page handoff. */
      try { sessionStorage.setItem('wedding:from-envelope','1'); } catch(e){}

      /* The physical opening is allowed to breathe before the page changes. */
      window.setTimeout(function(){
        if(state !== APP_STATES.OPENING) return;
        state = APP_STATES.LEAVING;
        intro.classList.add('leaving');
      }, 1880);

      window.setTimeout(function(){
        window.location.assign('main.html');
      }, 2470);
    }

    /* Small progressive reveal: no arbitrary loading lock once the DOM is ready. */
    window.setTimeout(armButton, 620);
  }

  /* ---------- INIT ---------- */
  function initializeApp(){
    initParticles();
    initEnvelope();
    initPetals();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initializeApp);
  } else {
    initializeApp();
  }
})();
