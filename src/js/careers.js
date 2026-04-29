/**
 * Careers page: scroll progress, reveals, subtle hero parallax, brand word spans for "tinker".
 * Job cards: hydrate from window.__CAREERS_JOBS__, API, or admin/CMS when available — see comments.
 */
(function () {
    'use strict';

    var page = document.querySelector('.careers-page');
    if (!page) return;

    document.body.classList.add('careers-page-active');

    wrapBrandWords();
    initProgress();
    initStaggerDelays();
    initReveals();
    initSectionState();
    initSmoothAnchors();

    /** Optional CMS: set window.__CAREERS_JOBS__ = [{ id, dept, title, excerpt, detailUrl }] before this script loads, or fetch from admin API later. */
    tryHydrateJobCardsFromWindow();

    function wrapBrandWords() {
        var walker = document.createTreeWalker(page, NodeFilter.SHOW_TEXT, {
            acceptNode: function (node) {
                if (!node.nodeValue || !/\btinker\b/i.test(node.nodeValue)) return NodeFilter.FILTER_REJECT;
                var p = node.parentElement;
                if (!p || p.closest('script, style, svg, canvas, .careers-em')) return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
        });
        var nodes = [];
        var n;
        while ((n = walker.nextNode())) nodes.push(n);
        nodes.forEach(function (node) {
            var frag = document.createDocumentFragment();
            node.nodeValue.split(/(\btinker\b)/gi).forEach(function (part) {
                if (/^tinker$/i.test(part)) {
                    var s = document.createElement('span');
                    s.className = 'careers-em';
                    s.textContent = part;
                    frag.appendChild(s);
                } else if (part) frag.appendChild(document.createTextNode(part));
            });
            node.parentNode.replaceChild(frag, node);
        });
    }

    function initProgress() {
        var ticking = false;
        function tick() {
            var y = window.scrollY || window.pageYOffset;
            var max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
            page.style.setProperty('--careers-progress', Math.min(Math.max(y / max, 0), 1).toFixed(4));
            ticking = false;
        }
        function req() {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(tick);
        }
        tick();
        window.addEventListener('scroll', req, { passive: true });
        window.addEventListener('resize', req);

        /* Very light hero parallax */
        var hero = document.querySelector('.careers-hero__gif');
        if (hero && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            window.addEventListener(
                'scroll',
                function () {
                    var h = document.querySelector('.careers-hero');
                    if (!h || h.getBoundingClientRect().bottom < 0) return;
                    var p = Math.min(window.scrollY * 0.08, 40);
                    hero.style.transform = 'translate3d(0,' + (p * 0.5) + 'px, 0)';
                },
                { passive: true }
            );
        }
    }

    function initReveals() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            Array.prototype.slice.call(document.querySelectorAll('.careers-reveal')).forEach(function (el) {
                el.classList.add('is-visible');
            });
            return;
        }

        var io = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (e) {
                    if (e.isIntersecting) {
                        e.target.classList.add('is-visible');
                        io.unobserve(e.target);
                    }
                });
            },
            { rootMargin: '0px 0px -14% 0px', threshold: 0.08 }
        );
        Array.prototype.slice.call(document.querySelectorAll('.careers-reveal')).forEach(function (el) {
            io.observe(el);
        });
    }

    function initStaggerDelays() {
        var groups = ['.careers-jobs-feed .careers-job-card', '.careers-ayat-stair .careers-ayat-card', '.careers-pillars .careers-pillar', '.careers-ethics-grid .careers-ethics-card'];
        groups.forEach(function (selector) {
            Array.prototype.slice.call(document.querySelectorAll(selector)).forEach(function (el, idx) {
                if (el.style.transitionDelay) return;
                el.style.transitionDelay = Math.min(idx * 70, 360) + 'ms';
            });
        });
    }

    function initSectionState() {
        var sections = Array.prototype.slice.call(document.querySelectorAll('main .careers-section, main .careers-impact'));
        if (!sections.length) return;

        var io = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        sections.forEach(function (s) {
                            s.classList.remove('is-active');
                        });
                        entry.target.classList.add('is-active');
                    }
                });
            },
            { threshold: 0.3, rootMargin: '-10% 0px -45% 0px' }
        );

        sections.forEach(function (section) {
            io.observe(section);
        });
    }

    function initSmoothAnchors() {
        Array.prototype.slice.call(document.querySelectorAll('a[href^="#"]')).forEach(function (a) {
            var id = a.getAttribute('href');
            if (id.length < 2) return;
            a.addEventListener('click', function (e) {
                var target = document.querySelector(id);
                if (!target) return;
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }

    function tryHydrateJobCardsFromWindow() {
        var feed = document.getElementById('careersJobsFeed');
        var jobs =
            typeof window.__CAREERS_JOBS__ !== 'undefined' && Array.isArray(window.__CAREERS_JOBS__)
                ? window.__CAREERS_JOBS__
                : null;

        if (!jobs || jobs.length === 0) return;

        feed.innerHTML = '';
        jobs.forEach(function (job) {
            var art = document.createElement('article');
            art.className = 'careers-job-card careers-reveal';
            art.setAttribute('data-career-job-id', job.id || '');
            art.innerHTML =
                '<span class="careers-job-card__meta">' +
                escapeHtml(job.dept || 'Open role') +
                '</span>' +
                '<h3 class="careers-job-card__title">' +
                escapeHtml(job.title || '') +
                '</h3>' +
                '<p class="careers-intro" style="margin:0;font-size:.95rem;">' +
                escapeHtml(job.excerpt || '') +
                '</p>' +
                (job.detailUrl
                    ? '<a class="careers-job-card__cta" href="' +
                      escapeHtmlAttr(job.detailUrl) +
                      '">' +
                      (job.ctaLabel || 'View role') +
                      '</a>'
                    : '<span class="careers-job-card__cta">' + (job.ctaLabel || 'Details soon') + '</span>');
            feed.appendChild(art);
        });

        initStaggerDelays();

        Array.prototype.slice.call(feed.querySelectorAll('.careers-reveal')).forEach(function (el) {
            el.classList.add('is-visible');
        });
    }

    function escapeHtml(s) {
        var div = document.createElement('div');
        div.textContent = s == null ? '' : String(s);
        return div.innerHTML;
    }

    function escapeHtmlAttr(s) {
        return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }
})();
