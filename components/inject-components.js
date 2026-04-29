/**
 * inject-components.js
 * Dynamically loads components/header.html and components/footer.html into
 * any page that has <div id="global-header"></div> / <div id="global-footer"></div>.
 * Also initialises all nav + footer interactive behaviour (mobile toggle,
 * sparkles, CTA rotation, footer reveal observer).
 */
(function () {
    'use strict';

    /* ── helper ── */
    function loadComponent(url, placeholderId, callback) {
        var el = document.getElementById(placeholderId);
        if (!el) { if (callback) callback(); return; }

        fetch(url)
            .then(function (r) {
                if (!r.ok) throw new Error(r.status);
                return r.text();
            })
            .then(function (html) {
                var tmp = document.createElement('div');
                tmp.innerHTML = html;
                var parent = el.parentNode;
                while (tmp.firstChild) parent.insertBefore(tmp.firstChild, el);
                parent.removeChild(el);
                if (callback) callback();
            })
            .catch(function (err) {
                console.error('[inject-components] Failed to load:', url, err);
                if (callback) callback();
            });
    }

    /* ── boot ── */
    var headerReady = false, footerReady = false;

    function onComponentReady() {
        if (headerReady && footerReady) initAll();
    }

    document.addEventListener('DOMContentLoaded', function () {
        loadComponent('components/header.html', 'global-header', function () {
            /* Mark the active nav item based on current page filename */
            var page = window.location.pathname.split('/').pop() || 'index.html';
            document.querySelectorAll('a.nav-item').forEach(function (a) {
                var href = a.getAttribute('href');
                if (href && href === page) {
                    a.classList.add('active');
                } else {
                    a.classList.remove('active');
                }
            });
            /* index.html special-case: Home is active when path is "/" or "" */
            if (page === '' || page === 'index.html') {
                var homeLink = document.querySelector('a.nav-item[href="index.html"]');
                if (homeLink) homeLink.classList.add('active');
            }
            headerReady = true;
            onComponentReady();
        });

        loadComponent('components/footer.html', 'global-footer', function () {
            footerReady = true;
            onComponentReady();
        });
    });

    /* ══════════════════════════════════════════════════
       Behaviour initialisers  (run once both components are in the DOM)
    ══════════════════════════════════════════════════ */
    function initAll() {
        initMobileToggle();
        initSparkles();
        initCTA();
        initFooterObserver();
    }

    /* ── 1. Mobile nav toggle ── */
    function initMobileToggle() {
        var toggle = document.getElementById('mobileToggle');
        var navbar = document.getElementById('navbar');
        if (!toggle || !navbar) return;

        toggle.addEventListener('click', function () {
            if (navbar.classList.contains('active')) {
                navbar.classList.add('closing');
                navbar.classList.remove('active');
                toggle.classList.remove('active');
                setTimeout(function () { navbar.classList.remove('closing'); }, 400);
            } else {
                navbar.classList.remove('closing');
                navbar.classList.add('active');
                toggle.classList.add('active');
            }
        });
    }

    /* ── 2. Cursor sparkle + CTA star emitter ── */
    function initSparkles() {
        var COLORS = ['#0099FD', '#30C70B', '#FEC000'];
        var lastSpawn = 0;

        function spawnAt(x, y, scaleOverride) {
            var el = document.createElement('div');
            el.className = 'cursor-sparkle';
            el.style.left = x + 'px';
            el.style.top  = y + 'px';
            el.style.setProperty(
                '--scale-factor',
                scaleOverride != null ? scaleOverride : (0.5 + Math.random())
            );
            el.style.color = COLORS[Math.floor(Math.random() * COLORS.length)];
            el.innerHTML = '<div class="star-shape"></div><div class="sparkle-shine"></div>';
            document.body.appendChild(el);
            setTimeout(function () { el.parentNode && el.parentNode.removeChild(el); }, 1200);
        }

        window.addEventListener('mousemove', function (e) {
            var nw = document.querySelector('.navbar-wrapper');
            if (nw) {
                var r = nw.getBoundingClientRect();
                if (e.clientX >= r.left && e.clientX <= r.right &&
                    e.clientY >= r.top  && e.clientY <= r.bottom) return;
            }
            var now = Date.now();
            if (now - lastSpawn < 25) return;
            lastSpawn = now;
            spawnAt(
                e.clientX + (Math.random() - 0.5) * 40,
                e.clientY + (Math.random() - 0.5) * 40
            );
        }, { passive: true });

        function spawnButtonStar() {
            if (window.innerWidth <= 1350) return;
            var cw = document.querySelector('.dynamic-cta-wrapper');
            if (!cw) return;
            var r = cw.getBoundingClientRect();
            if (!r.width) return;
            spawnAt(
                r.left + r.width  / 2 + (Math.random() - 0.5) * (r.width  + 40),
                r.top  + r.height / 2 + (Math.random() - 0.5) * (r.height + 40),
                0.1 + Math.random() * 0.25
            );
        }

        setInterval(spawnButtonStar, 300);
        window.addEventListener('scroll', function () {
            if (Math.random() > 0.3) spawnButtonStar();
        }, { passive: true });
    }

    /* ── 3. Behavioural CTA text system ── */
    function initCTA() {
        var currentText = 'Ready? Partner Now';
        var idleTimer = null, dwellTimer = null;

        function updateCTAText(newText) {
            if (currentText === newText) return;
            currentText = newText;
            document.querySelectorAll('.cta-text').forEach(function (el) {
                el.classList.remove('show');
                el.classList.add('fade-out');
                setTimeout(function () {
                    el.textContent = '';
                    el.classList.remove('fade-out', 'fade-in');
                    el.classList.add('show');
                    var i = 0;
                    (function type() {
                        if (currentText !== newText) return;
                        if (i < newText.length) {
                            el.textContent += newText[i++];
                            setTimeout(type, 35);
                        }
                    })();
                }, 400);
            });
        }

        function processBehaviorState() {
            var scrollMax = document.documentElement.scrollHeight - window.innerHeight;
            var pct = scrollMax > 0 ? window.scrollY / scrollMax : 0;
            var isPricing = window.location.pathname.indexOf('pricing') !== -1;
            var high = pct > 0.4 || isPricing;

            var ctas   = document.querySelectorAll('.dynamic-cta');
            var meshes = document.querySelectorAll('.cta-mesh-pulse');
            var orbs   = document.querySelectorAll('.attention-orb');

            if (high) {
                updateCTAText('Get a Quote');
                meshes.forEach(function (m) { m.classList.add('active'); });
                ctas.forEach(function (c) { c.classList.add('intent-high'); });
                orbs.forEach(function (o) { o.classList.remove('hidden'); });
            } else {
                updateCTAText('Ready? Partner Now');
                meshes.forEach(function (m) { m.classList.remove('active'); });
                ctas.forEach(function (c) { c.classList.remove('intent-high'); });
                orbs.forEach(function (o) { o.classList.remove('hidden'); });
            }

            clearTimeout(dwellTimer);
            dwellTimer = setTimeout(function () {
                if (high) {
                    var expertText = window.matchMedia('(max-width: 768px)').matches
                        ? 'Talk to an Expert'
                        : 'Not Sure? Talk to an Expert';
                    updateCTAText(expertText);
                    document.querySelectorAll('.cta-mesh-pulse').forEach(function (m) { m.classList.add('active'); });
                    document.querySelectorAll('.dynamic-cta').forEach(function (c) { c.classList.add('intent-high'); });
                }
            }, 5000);

            clearTimeout(idleTimer);
            idleTimer = setTimeout(function () {
                updateCTAText("Have Questions? We're Here");
                document.querySelectorAll('.cta-mesh-pulse').forEach(function (m) { m.classList.remove('active'); });
                document.querySelectorAll('.dynamic-cta').forEach(function (c) { c.classList.remove('intent-high'); });
                document.querySelectorAll('.attention-orb').forEach(function (o) { o.classList.add('hidden'); });
            }, 12000);
        }

        window.addEventListener('scroll', processBehaviorState, { passive: true });
        window.addEventListener('mousemove', function () {
            if (currentText === "Have Questions? We're Here") {
                processBehaviorState();
            } else {
                clearTimeout(idleTimer);
                idleTimer = setTimeout(function () {
                    updateCTAText("Have Questions? We're Here");
                    document.querySelectorAll('.cta-mesh-pulse').forEach(function (m) { m.classList.remove('active'); });
                    document.querySelectorAll('.dynamic-cta').forEach(function (c) { c.classList.remove('intent-high'); });
                    document.querySelectorAll('.attention-orb').forEach(function (o) { o.classList.add('hidden'); });
                }, 12000);
            }
        }, { passive: true });

        processBehaviorState();
    }

    /* ── 4. Footer reveal observer ── */
    function initFooterObserver() {
        var footer = document.getElementById('siteFooter');
        if (!footer) return;
        var items = footer.querySelectorAll('.reveal-item');
        if (!items.length) return;

        var obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        items.forEach(function (item) {
            item.style.opacity   = '0';
            item.style.transform = 'translateY(30px)';
            item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            obs.observe(item);
        });
    }

})();
