/* Barra de categorías de ATL Library: se dibuja en #bar desde assets/data/library-catalog.json */
(function () {
    var bar = document.getElementById('bar');
    if (!bar) return;
    var LANG = 'es';
    var params = new URLSearchParams(location.search);
    var G = params.get('g'), C = params.get('c'), S = params.get('s');

    function t(o) { return o[LANG] || o.es; }
    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    function url(p) {
        var q = [];
        if (p.g) q.push('g=' + p.g);
        if (p.c) q.push('c=' + p.c);
        if (p.s) q.push('s=' + p.s);
        return 'library-catalog.html' + (q.length ? '?' + q.join('&') : '');
    }

    function render(data) {
        var cats = {};
        data.categories.forEach(function (c) { cats[c.id] = c; });
        function count(cid) { return data.objects.filter(function (o) { return o.cat === cid; }).length; }

        var ag = G;
        if (C && cats[C]) {
            var owner = data.groups.filter(function (x) { return x.categories.indexOf(C) >= 0; })[0];
            ag = owner ? owner.id : null;
        }
        var h = '';
        Array.prototype.forEach.call(document.querySelectorAll('nav .nav-links a[data-g]'), function (a) {
            a.classList.toggle('active', (a.getAttribute('data-g') || null) === (ag || null) && (ag !== null || (G === null && C === null && location.pathname.indexOf('catalog') >= 0)));
        });

        var visible = ag
            ? data.groups.filter(function (x) { return x.id === ag; })[0].categories
            : data.categories.map(function (c) { return c.id; });
        h += '<div class="bar-row bar-cats">';
        visible.forEach(function (cid) {
            var c = cats[cid], n = count(cid);
            h += '<a href="' + url({ c: cid }) + '" class="' + (C === cid ? 'active' : '') + '"><span class="num">' + c.num + '</span>' + esc(t(c)) +
                (n ? '<span class="cnt">' + n + '</span>' : '<span class="soon-tag">Pronto</span>') + '</a>';
        });
        h += '</div>';

        if (C && cats[C]) {
            h += '<div class="bar-row bar-subs"><a href="' + url({ c: C }) + '" class="' + (!S ? 'active' : '') + '">Todas</a>';
            cats[C].subs.forEach(function (sb) {
                h += '<a href="' + url({ c: C, s: sb.id }) + '" class="' + (S === sb.id ? 'active' : '') + '">' + esc(t(sb)) + '</a>';
            });
            h += '</div>';
        }
        bar.innerHTML = h;
    }

    var nav = document.querySelector('nav');
    function syncTop() { if (nav) document.documentElement.style.setProperty('--nav-h', nav.offsetHeight + 'px'); }
    var tmr;
    window.addEventListener('scroll', function () {
        syncTop();
        clearTimeout(tmr);
        tmr = setTimeout(syncTop, 500);
    }, { passive: true });
    window.addEventListener('resize', syncTop);
    syncTop();

    fetch('assets/data/library-catalog.json')
        .then(function (r) { return r.json(); })
        .then(render)
        .catch(function () {});
})();
