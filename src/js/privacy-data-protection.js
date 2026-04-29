/**
 * privacy-data-protection.js
 * Scroll activation, brand styling, behavioral CTA, role tabs, and lazy bounded-node 3D hero.
 */
(function () {
    'use strict';

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var isSmallScreen = window.matchMedia('(max-width: 768px)').matches;
    var page = document.querySelector('.privacy-page');
    var sections = [];
    var revealItems = [];
    var railLinks = [];
    var cta = document.getElementById('privacyBehaviorCta');
    var state = document.querySelector('.privacy-state span');
    var ticking = false;

    if (!page) return;

    sections = Array.prototype.slice.call(document.querySelectorAll('.privacy-section'));
    revealItems = Array.prototype.slice.call(document.querySelectorAll('.privacy-reveal, .privacy-reveal-card'));
    railLinks = Array.prototype.slice.call(document.querySelectorAll('.privacy-rail__link'));

    document.body.classList.add('privacy-page-active');
    styleBrandWords();
    staggerRevealDelays();
    initRevealObserver();
    initSectionObserver();
    initScrollState();
    initPrivacyHeroWhenReady();
    initAccessTabs();
    initAnalyticsToggle();
    initGateStrip();

    function styleBrandWords() {
        var walker = document.createTreeWalker(page, NodeFilter.SHOW_TEXT, {
            acceptNode: function (node) {
                if (!node.nodeValue || !/\btinker\b/i.test(node.nodeValue)) return NodeFilter.FILTER_REJECT;
                var parent = node.parentElement;
                if (!parent || parent.closest('script, style, svg, canvas, .privacy-brand-word'))
                    return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
        });
        var nodes = [];
        var current;

        while ((current = walker.nextNode())) nodes.push(current);

        nodes.forEach(function (node) {
            var fragment = document.createDocumentFragment();
            node.nodeValue.split(/(\btinker\b)/gi).forEach(function (part) {
                if (/^tinker$/i.test(part)) {
                    var span = document.createElement('span');
                    span.className = 'privacy-brand-word';
                    span.textContent = part;
                    fragment.appendChild(span);
                } else if (part) {
                    fragment.appendChild(document.createTextNode(part));
                }
            });
            node.parentNode.replaceChild(fragment, node);
        });
    }

    function staggerRevealDelays() {
        sections.forEach(function (section) {
            Array.prototype.slice
                .call(section.querySelectorAll('.privacy-reveal, .privacy-reveal-card'))
                .forEach(function (item, index) {
                    item.style.setProperty('--reveal-delay', Math.min(index * 0.052, 0.36) + 's');
                });
        });
    }

    function initRevealObserver() {
        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
            revealItems.forEach(function (item) {
                item.classList.add('is-visible');
            });
            return;
        }

        var observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { rootMargin: '0px 0px -12% 0px', threshold: 0.16 }
        );

        revealItems.forEach(function (item) {
            observer.observe(item);
        });
    }

    function initSectionObserver() {
        if (!('IntersectionObserver' in window)) return;

        var observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    var id = entry.target.id;
                    var stage = entry.target.getAttribute('data-privacy-stage') || 'boundary';

                    sections.forEach(function (section) {
                        section.classList.toggle('is-active', section.id === id);
                    });
                    railLinks.forEach(function (link) {
                        link.classList.toggle('active', link.getAttribute('href') === '#' + id);
                    });
                    if (state) {
                        state.textContent = 'Data Boundary: ' + getStageLabel(stage);
                    }
                });
            },
            { rootMargin: '-42% 0px -42% 0px', threshold: 0.01 }
        );

        sections.forEach(function (section) {
            observer.observe(section);
        });
    }

    function getStageLabel(stage) {
        var map = {
            boundary: 'Enforced',
            ownership: 'Ownership',
            collection: 'Minimal',
            purpose: 'Purpose-bound',
            isolation: 'Isolated',
            rbac: 'Role-scoped',
            ai: 'Contained',
            lifecycle: 'Lifecycle',
            deletion: 'Exit-ready',
            cookies: 'Controlled',
            vendor: 'Gated',
            compliance: 'Aligned',
            hierarchy: 'Institution-led',
            layered: 'Layered controls',
            oversight: 'Ongoing audit',
            trust: 'Controlled trust',
            explore: 'Next steps'
        };
        return map[stage] || 'Enforced';
    }

    function initScrollState() {
        updateScrollState();
        window.addEventListener('scroll', requestTick, { passive: true });
        window.addEventListener('resize', requestTick);
    }

    function requestTick() {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(function () {
            updateScrollState();
            ticking = false;
        });
    }

    function updateScrollState() {
        var scrollY = window.scrollY || window.pageYOffset;
        var docHeight = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
        var progress = Math.min(Math.max(scrollY / docHeight, 0), 1);

        page.style.setProperty('--privacy-progress', progress.toFixed(4));
        page.style.setProperty('--privacy-scroll-drift', Math.round(scrollY * -0.035) + 'px');
        page.style.setProperty(
            '--privacy-hero-depth',
            Math.min(scrollY / Math.max(window.innerHeight, 1), 1).toFixed(3)
        );

        if (cta) cta.textContent = progress > 0.52 ? 'Request Data Protection Briefing' : 'Schedule a Strategic Briefing';
    }

    function initPrivacyHeroWhenReady() {
        var mount = document.getElementById('privacyHeroScene');
        if (!mount || prefersReducedMotion || isSmallScreen || !('IntersectionObserver' in window)) return;

        var observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    observer.disconnect();
                    scheduleIdle(function () {
                        loadBoundedDataScene(mount);
                    });
                });
            },
            { rootMargin: '260px 0px', threshold: 0.01 }
        );

        observer.observe(mount);
    }

    function scheduleIdle(callback) {
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(callback, { timeout: 1200 });
            return;
        }
        window.setTimeout(callback, 120);
    }

    async function loadBoundedDataScene(mount) {
        try {
            var THREE = await import('../../node_modules/three/build/three.module.js');

            var scene = new THREE.Scene();
            var camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
            var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
            var outer = new THREE.Group();
            var isSceneVisible = true;
            var animationFrame = null;
            var boxSize = 1.75;

            var edges = new THREE.LineSegments(
                new THREE.EdgesGeometry(new THREE.BoxGeometry(boxSize, boxSize, boxSize)),
                new THREE.LineBasicMaterial({
                    color: 0x0099fd,
                    transparent: true,
                    opacity: 0.52
                })
            );

            outer.add(edges);

            var nodeGeo = new THREE.SphereGeometry(0.068, 16, 16);
            var nodeMatGold = new THREE.MeshStandardMaterial({ color: 0xfec000, roughness: 0.32, metalness: 0.18 });
            var nodeMatBlue = new THREE.MeshStandardMaterial({ color: 0x0099fd, roughness: 0.35, metalness: 0.14 });
            var spheres = [];

            function randInRange() {
                return (Math.random() - 0.5) * (boxSize - 0.35);
            }

            for (var n = 0; n < 10; n += 1) {
                var mesh = new THREE.Mesh(nodeGeo, n % 2 === 0 ? nodeMatGold : nodeMatBlue);
                mesh.position.set(randInRange(), randInRange(), randInRange());
                outer.add(mesh);
                spheres.push(mesh);
            }

            for (var a = 0; a < spheres.length - 1; a += 2) {
                var lineGeo = new THREE.BufferGeometry().setFromPoints([
                    spheres[a].position.clone(),
                    spheres[a + 1].position.clone()
                ]);
                var line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0x30c70b, transparent: true, opacity: 0.35 }));
                outer.add(line);
            }

            scene.add(new THREE.AmbientLight(0xffffff, 1.65));
            addLight(THREE, scene, 0x0099fd, 3, 3.6, 2.2, 4.2);
            addLight(THREE, scene, 0x30c70b, 2.2, -3.2, -1.8, 3.4);
            addLight(THREE, scene, 0xfec000, 1.35, -0.2, 3.4, 2.8);
            scene.add(outer);

            camera.position.set(0.4, 0.25, 4.85);

            var fallback = mount.querySelector('.privacy-boundary-fallback');
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
            renderer.outputColorSpace = THREE.SRGBColorSpace;
            mount.appendChild(renderer.domElement);
            if (fallback) fallback.style.opacity = '0';

            function resize() {
                var size = Math.max(mount.clientWidth, 260);
                var height = Math.max(mount.clientHeight, 260);
                camera.aspect = size / height;
                camera.updateProjectionMatrix();
                renderer.setSize(size, height);
            }

            function animate() {
                if (!isSceneVisible) {
                    animationFrame = null;
                    return;
                }
                var scrollRatio = Math.min((window.scrollY || window.pageYOffset) / Math.max(window.innerHeight, 1), 1.35);
                var lock = Math.min(scrollRatio * 1.15, 1);
                outer.rotation.y += 0.0016;
                outer.rotation.x = -0.28 + scrollRatio * 0.22;

                edges.material.opacity = 0.28 + lock * 0.52;

                renderer.render(scene, camera);
                animationFrame = window.requestAnimationFrame(animate);
            }

            function startAnimation() {
                if (animationFrame) return;
                isSceneVisible = true;
                animate();
            }

            resize();
            window.addEventListener('resize', resize);

            new IntersectionObserver(
                function (entries) {
                    entries.forEach(function (entry) {
                        isSceneVisible = entry.isIntersecting;
                        if (isSceneVisible) startAnimation();
                    });
                },
                { rootMargin: '160px 0px', threshold: 0.01 }
            ).observe(mount);

            startAnimation();
        } catch (e) {
            mount.classList.add('privacy-boundary--fallback-only');
        }
    }

    function addLight(THREE, scene, color, intensity, x, y, z) {
        var light = new THREE.PointLight(color, intensity, 10);
        light.position.set(x, y, z);
        scene.add(light);
    }

    function initAccessTabs() {
        var tabs = Array.prototype.slice.call(document.querySelectorAll('.privacy-access-tab'));
        var panelIds = ['privacy-panel-student', 'privacy-panel-teacher', 'privacy-panel-admin', 'privacy-panel-parent'];

        tabs.forEach(function (tab) {
            tab.addEventListener('click', function () {
                var targetId = tab.getAttribute('aria-controls');
                tabs.forEach(function (t) {
                    t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
                });
                panelIds.forEach(function (id) {
                    var p = document.getElementById(id);
                    if (!p) return;
                    if (id === targetId) {
                        p.removeAttribute('hidden');
                        p.classList.add('is-active');
                    } else {
                        p.setAttribute('hidden', '');
                        p.classList.remove('is-active');
                    }
                });
            });
        });

        tabs.forEach(function (tab, i) {
            tab.addEventListener('keydown', function (e) {
                if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
                e.preventDefault();
                var next = e.key === 'ArrowRight' ? Math.min(i + 1, tabs.length - 1) : Math.max(i - 1, 0);
                tabs[next].focus();
                tabs[next].click();
            });
        });
    }

    function initAnalyticsToggle() {
        var btn = document.getElementById('privacyAnalyticsToggle');
        if (!btn) return;
        btn.addEventListener('click', function () {
            var pressed = btn.getAttribute('aria-pressed') === 'true';
            btn.setAttribute('aria-pressed', pressed ? 'false' : 'true');
            btn.classList.toggle('is-on', !pressed);
        });
    }

    function initGateStrip() {
        var gates = Array.prototype.slice.call(document.querySelectorAll('.privacy-gate'));
        if (gates.length < 2 || prefersReducedMotion) return;
        var i = 0;
        window.setInterval(function () {
            gates.forEach(function (g, idx) {
                g.classList.toggle('is-active', idx === i);
            });
            i = (i + 1) % gates.length;
        }, 2600);
    }
})();
