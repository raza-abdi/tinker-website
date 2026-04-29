/**
 * global-nav.js
 * Initialises navbar and footer interactive behaviour for all static pages.
 * Requires: nav + footer HTML already present in the DOM.
 */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        initMobileToggle();
        initSparkles();
        initCTA();
        initCompanyAnchors();
        initAIGovernanceAnchors();
        initSecurityAnchors();
        initFooterObserver();
    });

    /* ── 1. Mobile nav toggle ── */
    function initMobileToggle() {
        var toggle = document.getElementById('mobileToggle');
        var navbar = document.getElementById('navbar');
        if (!toggle || !navbar) return;
        if (toggle.dataset.companyInlineBound === 'true') return;

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
                    var t = window.matchMedia('(max-width: 768px)').matches
                        ? 'Talk to an Expert'
                        : 'Not Sure? Talk to an Expert';
                    updateCTAText(t);
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

    /* ── 4. Company dropdown deep links ── */
    function initCompanyAnchors() {
        var anchors = [
            'company.html#how-tinker-sees-itself',
            'company.html#founding-vision',
            'company.html#mission',
            'company.html#our-values',
            'company.html#leadership-governance',
            'company.html#guiding-principles',
            'company.html#student-learning',
            'company.html#what-matters',
            'company.html#philosophy-schools',
            'company.html#tinker-way',
            'company.html#impact'
        ];
        var cards = document.querySelectorAll('.company-dropdown .company-card');

        cards.forEach(function (card, index) {
            if (anchors[index]) {
                card.setAttribute('href', anchors[index]);
            }
        });
    }

    /* ── 5. AI Governance section deep links ── */
    function initAIGovernanceAnchors() {
        var aiTop = 'tinker-ai-governance.html#tinker-ai';
        var aiGovernance = 'tinker-ai-governance.html#ai-governance-standard';

        document.querySelectorAll('a[href="novelty-in-tinker.html"]').forEach(function (link) {
            if (link.textContent.toLowerCase().indexOf('novelty') !== -1) {
                link.setAttribute('href', aiTop);
            }
        });

        document.querySelectorAll('a[href="tinker-ai-governance.html"]').forEach(function (link) {
            link.setAttribute('href', aiGovernance);
        });
    }

    /* ── 6. Security section deep links ── */
    function initSecurityAnchors() {
        document.querySelectorAll('a[href="security-user-safety.html"]').forEach(function (link) {
            link.setAttribute('href', 'security-user-safety.html#security-is-not-a-feature');
        });
    }

    /* ── 7. Footer reveal observer ── */
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
