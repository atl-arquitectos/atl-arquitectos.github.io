/* Conteo de visitas privado (GoatCounter). El panel solo lo ve el dueño de la cuenta.
   Pon aquí el código de tu sitio de GoatCounter (el de https://CODIGO.goatcounter.com). */
(function () {
    var CODE = '';
    if (!CODE) return;
    if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) return;
    var s = document.createElement('script');
    s.async = true;
    s.src = '//gc.zgo.at/count.js';
    s.setAttribute('data-goatcounter', 'https://' + CODE + '.goatcounter.com/count');
    document.head.appendChild(s);
})();
