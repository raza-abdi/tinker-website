/**
 * ai-governance.js
 * Scroll activation, page state, behavioral CTA, and lazy neural-core 3D scene.
 */
(function () {
    'use strict';

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var isSmallScreen = window.matchMedia('(max-width: 768px)').matches;
    var page = document.querySelector('.ai-governance-page');
    var sections = Array.prototype.slice.call(document.querySelectorAll('.ai-section'));
    var revealItems = Array.prototype.slice.call(document.querySelectorAll('.ai-reveal, .ai-reveal-card'));
    var railLinks = Array.prototype.slice.call(document.querySelectorAll('.ai-rail__link'));
    var cta = document.getElementById('aiBehaviorCta');
    var ticking = false;

    if (!page) return;

    document.body.classList.add('ai-governance-active');
    styleBrandWords();
    staggerRevealDelays();
    initRevealObserver();
    initSectionObserver();
    initScrollState();
    initNeuralCoreWhenReady();

    function styleBrandWords() {
        var walker = document.createTreeWalker(page, NodeFilter.SHOW_TEXT, {
            acceptNode: function (node) {
                if (!node.nodeValue || !/\btinker\b/i.test(node.nodeValue)) {
                    return NodeFilter.FILTER_REJECT;
                }

                var parent = node.parentElement;
                if (!parent || parent.closest('script, style, svg, canvas, .ai-brand-word')) {
                    return NodeFilter.FILTER_REJECT;
                }

                return NodeFilter.FILTER_ACCEPT;
            }
        });
        var nodes = [];
        var current;

        while ((current = walker.nextNode())) {
            nodes.push(current);
        }

        nodes.forEach(function (node) {
            var fragment = document.createDocumentFragment();
            var parts = node.nodeValue.split(/(\btinker\b)/gi);

            parts.forEach(function (part) {
                if (/^tinker$/i.test(part)) {
                    var span = document.createElement('span');
                    span.className = 'ai-brand-word';
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
            Array.prototype.slice.call(section.querySelectorAll('.ai-reveal, .ai-reveal-card')).forEach(function (item, index) {
                item.style.setProperty('--reveal-delay', Math.min(index * 0.055, 0.38) + 's');
            });
        });
    }

    function initRevealObserver() {
        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
            revealItems.forEach(function (item) { item.classList.add('is-visible'); });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -12% 0px', threshold: 0.16 });

        revealItems.forEach(function (item) { observer.observe(item); });
    }

    function initSectionObserver() {
        if (!('IntersectionObserver' in window)) return;

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var id = entry.target.id;

                sections.forEach(function (section) {
                    section.classList.toggle('is-active', section.id === id);
                });
                railLinks.forEach(function (link) {
                    link.classList.toggle('active', link.getAttribute('href') === '#' + id);
                });
            });
        }, { rootMargin: '-42% 0px -42% 0px', threshold: 0.01 });

        sections.forEach(function (section) { observer.observe(section); });
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

        page.style.setProperty('--ai-progress', progress.toFixed(4));
        page.style.setProperty('--ai-scroll-drift', Math.round(scrollY * -0.035) + 'px');
        page.style.setProperty('--ai-hero-depth', Math.min(scrollY / Math.max(window.innerHeight, 1), 1).toFixed(3));

        if (cta) {
            cta.textContent = progress > 0.55 ? 'Request Technical Briefing' : 'Explore Capabilities';
        }
    }

    function initNeuralCoreWhenReady() {
        var mount = document.getElementById('aiHeroScene');
        if (!mount || prefersReducedMotion || isSmallScreen || !('IntersectionObserver' in window)) return;

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                observer.disconnect();
                scheduleIdle(function () {
                    loadNeuralCore(mount);
                });
            });
        }, { rootMargin: '260px 0px', threshold: 0.01 });

        observer.observe(mount);
    }

    function scheduleIdle(callback) {
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(callback, { timeout: 1200 });
            return;
        }

        window.setTimeout(callback, 120);
    }

    async function loadNeuralCore(mount) {
        try {
            var THREE = await import('../../node_modules/three/build/three.module.js');
            var scene = new THREE.Scene();
            var camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
            var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
            var group = new THREE.Group();
            var fallback = mount.querySelector('.ai-core-fallback');
            var isSceneVisible = true;
            var animationFrame = null;

            camera.position.set(0, 0, 5.2);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
            renderer.outputColorSpace = THREE.SRGBColorSpace;
            mount.appendChild(renderer.domElement);
            if (fallback) fallback.style.opacity = '0';

            scene.add(new THREE.AmbientLight(0xffffff, 1.7));
            addLight(THREE, scene, 0x0099fd, 3.2, 3, 2, 4);
            addLight(THREE, scene, 0x30c70b, 2.2, -3, -2, 3);
            addLight(THREE, scene, 0xfec000, 1.4, 0, 3, 2);
            scene.add(group);

            var core = new THREE.Mesh(
                new THREE.IcosahedronGeometry(1.08, 4),
                new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    roughness: 0.28,
                    metalness: 0.14,
                    transparent: true,
                    opacity: 0.68,
                    wireframe: true
                })
            );
            group.add(core);
            addOrbitRings(THREE, group);
            addAgentNodes(THREE, group);

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

                var scrollRatio = Math.min((window.scrollY || window.pageYOffset) / Math.max(window.innerHeight, 1), 1.4);
                group.rotation.y += 0.0024;
                group.rotation.x = -0.18 + scrollRatio * 0.18;
                group.position.y = -scrollRatio * 0.16;
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

            if ('IntersectionObserver' in window) {
                new IntersectionObserver(function (entries) {
                    entries.forEach(function (entry) {
                        isSceneVisible = entry.isIntersecting;
                        if (isSceneVisible) startAnimation();
                    });
                }, { rootMargin: '160px 0px', threshold: 0.01 }).observe(mount);
            }

            startAnimation();
        } catch (error) {
            mount.classList.add('ai-core--fallback-only');
        }
    }

    function addLight(THREE, scene, color, intensity, x, y, z) {
        var light = new THREE.PointLight(color, intensity, 10);
        light.position.set(x, y, z);
        scene.add(light);
    }

    function addOrbitRings(THREE, group) {
        var material = new THREE.LineBasicMaterial({ color: 0x0099fd, transparent: true, opacity: 0.28 });
        var points = [];
        for (var i = 0; i <= 160; i += 1) {
            var angle = (i / 160) * Math.PI * 2;
            points.push(new THREE.Vector3(Math.cos(angle) * 1.55, Math.sin(angle) * 1.55, 0));
        }
        [0, 1, 2].forEach(function (_, index) {
            var ring = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material.clone());
            ring.rotation.x = Math.PI / (2.25 + index * 0.32);
            ring.rotation.y = index * 0.72;
            ring.material.opacity = 0.18 + index * 0.05;
            group.add(ring);
        });
    }

    function addAgentNodes(THREE, group) {
        var geometry = new THREE.SphereGeometry(0.045, 14, 14);
        var material = new THREE.MeshStandardMaterial({ color: 0xfec000, roughness: 0.3, metalness: 0.2 });

        for (var i = 0; i < 14; i += 1) {
            var angle = (i / 14) * Math.PI * 2;
            var node = new THREE.Mesh(geometry, material.clone());
            node.position.set(Math.cos(angle) * 1.62, Math.sin(angle) * 1.62, Math.sin(angle * 2) * 0.32);
            group.add(node);
        }
    }
})();
