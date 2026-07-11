/* ── ATL SOUND SYSTEM v2 — Audio real ── */
(function() {
    'use strict';
    const SRC = 'assets/audio/ambient.mp3';
    let audio     = null;
    let isOn      = false;
    let fadeTimer = null;
    let busy      = false; // evita doble disparo en móvil

    function fadeIn(el, target, ms) {
        clearInterval(fadeTimer);
        const steps = ms / 50;
        const step  = (target - el.volume) / steps;
        fadeTimer = setInterval(function() {
            el.volume = Math.min(target, Math.max(0, +(el.volume + step).toFixed(4)));
            if (Math.abs(el.volume - target) < 0.001) {
                el.volume = target;
                clearInterval(fadeTimer);
            }
        }, 50);
    }

    function fadeOut(el, ms) {
        clearInterval(fadeTimer);
        const startVol = el.volume || 0.13;
        const steps    = ms / 50;
        const step     = startVol / steps;
        fadeTimer = setInterval(function() {
            el.volume = Math.max(0, +(el.volume - step).toFixed(4));
            if (el.volume <= 0) {
                el.volume = 0;
                el.pause();
                clearInterval(fadeTimer);
            }
        }, 50);
        // Seguro de pausa para móvil
        setTimeout(function() { el.pause(); el.volume = 0; }, ms + 200);
    }

    function toggle() {
        if (busy) return;
        busy = true;
        setTimeout(function() { busy = false; }, 400);

        if (!audio) {
            audio = new Audio(SRC);
            audio.loop   = true;
            audio.volume = 0;
        }
        if (!isOn) {
            audio.play().then(function() {
                fadeIn(audio, 0.08, 4000);
            }).catch(function() {});
            isOn = true;
            btn.classList.add('atl-sound-on');
            lbl.textContent = 'AMBIENT';
            state.textContent = 'ON';
        } else {
            fadeOut(audio, 2500);
            isOn = false;
            btn.classList.remove('atl-sound-on');
            lbl.textContent = 'AMBIENT';
            state.textContent = 'OFF';
        }
    }

    const btn = document.createElement('button');
    btn.className = 'atl-sound-btn';
    btn.setAttribute('aria-label', 'Activar modo ambiental');
    btn.innerHTML =
        '<span class="atl-sound-dot"></span>' +
        '<span class="atl-sound-label">AMBIENT</span>' +
        '<span class="atl-switch"></span>' +
        '<span class="atl-state">OFF</span>';
    document.body.appendChild(btn);
    const lbl   = btn.querySelector('.atl-sound-label');
    const state = btn.querySelector('.atl-state');

    // touchstart + preventDefault evita el doble disparo touch→click en móvil
    btn.addEventListener('touchstart', function(e) {
        e.preventDefault();
        toggle();
    }, { passive: false });
    btn.addEventListener('click', toggle);
})();
