(function () {
    'use strict';

    var SafeDOM = window.SafeDOM;
    var page = document.querySelector('.faq-page');
    if (!page || !SafeDOM) return;

    var ALLOWED_RETURN_PREFIXES = ['index', 'company', 'tinker', 'for-', 'privacy', 'security', 'contact', 'pricing', 'careers', 'help-faqs', 'features', 'start-learning'];

    var defaultData = {
        categories: [
            'App', 'Core features', 'About tinker AI', 'ALI-ACE(tm) Algorithm', 'Quasar-3', 'IoT-based connectivity',
            'Using tinker Apps on different devices', 'All app related technical user based persona', 'Learning', 'Teachers', 'Students',
            'Admins', 'Parents', 'Alumni', 'Assessments and Curriculum', 'Analytics', 'Privacy and Data Protection', 'Legal', 'IP and Trademarks'
        ],
        personas: {
            executives: [
                { q: 'How is data isolated per institution?', a: 'Each tenant is logically isolated and governed by role-based access controls with auditability.' },
                { q: 'What is the deployment timeline?', a: 'Timeline depends on school size, migration needs, and training scope. Implementation plans are shared during onboarding.' },
                { q: 'How does AI operate within governance boundaries?', a: 'AI actions are bounded by policy guardrails, role permissions, and explicit configuration controls.' }
            ],
            teachers: [
                { q: 'How do I upload curriculum?', a: 'Use curriculum import in admin/teacher workflows. Mapping and validation are logged before publication.' },
                { q: 'How are assessments generated?', a: 'Assessment generation follows configured curriculum scope and grade constraints with teacher oversight.' },
                { q: 'Can I override AI recommendations?', a: 'Yes. Human override remains available where institutional policy allows and is logged for traceability.' }
            ],
            parents: [
                { q: 'What can parents see?', a: 'Parents can view approved progress insights, activity summaries, and teacher-shared outcomes.' },
                { q: 'Is student data safe?', a: 'Data is protected through access controls, encryption standards, and privacy governance policies.' },
                { q: 'How does personalized learning work?', a: 'Learning pathways adapt to assessed performance and teacher input, with age-appropriate constraints.' }
            ],
            general: [
                { q: 'Which devices are supported?', a: 'Platform support varies by app surface; current compatibility lists are maintained in device guidance articles.' },
                { q: 'Where can I contact support?', a: 'Use Contact Support or Submit a Problem from this help center for technical routing.' },
                { q: 'Can FAQs be updated through CMS?', a: 'Yes. This page is designed to be populated dynamically from the admin CMS pipeline.' }
            ]
        },
        products: [
            { name: 'tinker World', description: 'Admin operations, school setup, analytics, and teacher workflows for institutional scale.', href: 'tinker-world.html' },
            { name: 'tinker Kids', description: 'Learning paths, student experiences, parent dashboards, and assessment support.', href: 'tinker-kids.html' }
        ],
        domains: [
            { label: 'App & Platform', href: 'help-faqs.html#faq-categories' },
            { label: 'Learning System', href: 'help-faqs.html#faq-persona' },
            { label: 'AI & Algorithms', href: 'tinker-ai-governance.html' },
            { label: 'Security & Privacy', href: 'privacy-data-protection.html' },
            { label: 'Legal & Compliance', href: 'terms.html' }
        ]
    };

    var state = {
        data: defaultData,
        persona: 'executives'
    };

    initData().then(function () {
        initRender();
        initEvents();
        initProgressAndReveal();
        initReturnLink();
    });

    function initData() {
        if (window.__HELP_FAQS_DATA__ && typeof window.__HELP_FAQS_DATA__ === 'object') {
            state.data = mergeData(defaultData, window.__HELP_FAQS_DATA__);
            return Promise.resolve();
        }
        return fetch('/api/help-faqs', { method: 'GET', credentials: 'same-origin' })
            .then(function (res) {
                if (!res.ok) throw new Error('help-faqs fetch failed');
                return res.json();
            })
            .then(function (payload) {
                state.data = mergeData(defaultData, payload || {});
            })
            .catch(function () {
                state.data = defaultData;
            });
    }

    function mergeData(base, custom) {
        return {
            categories: Array.isArray(custom.categories) ? custom.categories : base.categories,
            personas: custom.personas && typeof custom.personas === 'object' ? custom.personas : base.personas,
            products: Array.isArray(custom.products) ? custom.products : base.products,
            domains: Array.isArray(custom.domains) ? custom.domains : base.domains
        };
    }

    function initRender() {
        renderCategories();
        renderPersonaFaqs(state.persona);
        renderProducts();
        renderDomains();
    }

    function initEvents() {
        var tabs = Array.prototype.slice.call(document.querySelectorAll('.faq-tab'));
        tabs.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var persona = btn.getAttribute('data-persona');
                if (!persona || !state.data.personas[persona]) return;
                state.persona = persona;
                tabs.forEach(function (b) {
                    b.classList.toggle('is-active', b === btn);
                    b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
                });
                renderPersonaFaqs(persona);
            });
        });

        var searchForm = document.getElementById('faqSearchForm');
        var searchInput = document.getElementById('faqSearchInput');
        searchInput.addEventListener('input', handleSearchInput);
        searchForm.addEventListener('submit', function (e) {
            e.preventDefault();
            handleSearchInput();
        });

        var cantFindToggle = document.getElementById('faqCantFindToggle');
        var cantFind = document.getElementById('faqCantFindLauncher');
        cantFindToggle.addEventListener('click', function () {
            var open = cantFind.classList.toggle('is-open');
            cantFindToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });

        Array.prototype.slice.call(document.querySelectorAll('#faqCantFindPanel a')).forEach(function (link) {
            link.addEventListener('click', function (e) {
                var action = link.getAttribute('data-action');
                if (action === 'request-article') {
                    e.preventDefault();
                    var issueInput = document.getElementById('faqIssueInput');
                    issueInput.value = 'Request article creation: ';
                    issueInput.focus();
                    document.getElementById('faq-submit-problem').scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        var problemForm = document.getElementById('faqProblemForm');
        problemForm.addEventListener('submit', handleProblemSubmit);
        initFileDropPlaceholder(problemForm);
    }

    /** Styled drop zone + filename line; aligns with persona/product row layout in CSS grid. */
    function initFileDropPlaceholder(problemForm) {
        var drop = document.querySelector('.faq-file-drop');
        var input = document.getElementById('faqFilePlaceholder');
        var nameEl = document.querySelector('.faq-file-drop__filename');
        if (!drop || !input) return;

        function updateFileCaption() {
            if (!nameEl) return;
            var f = input.files && input.files[0];
            nameEl.textContent = f ? SafeDOM.toSafeString(f.name, 160) : '';
        }

        var dragDepth = 0;

        drop.addEventListener('dragenter', function (e) {
            e.preventDefault();
            dragDepth += 1;
            drop.classList.add('is-drag');
        });

        drop.addEventListener('dragleave', function (e) {
            e.preventDefault();
            dragDepth = Math.max(0, dragDepth - 1);
            if (dragDepth === 0) drop.classList.remove('is-drag');
        });

        drop.addEventListener('dragover', function (e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        });

        drop.addEventListener('drop', function (e) {
            e.preventDefault();
            dragDepth = 0;
            drop.classList.remove('is-drag');
            var files = e.dataTransfer && e.dataTransfer.files;
            if (!files || !files.length) return;
            var file = files[0];
            try {
                var dt = new DataTransfer();
                dt.items.add(file);
                input.files = dt.files;
            } catch (err) {
                return;
            }
            updateFileCaption();
        });

        input.addEventListener('change', updateFileCaption);

        if (problemForm) {
            problemForm.addEventListener('reset', updateFileCaption);
        }
    function renderCategories() {
        var grid = document.getElementById('faqCategoryGrid');
        SafeDOM.clearChildren(grid);
        state.data.categories.forEach(function (label) {
            var item = SafeDOM.createEl('a', 'faq-category-item faq-reveal');
            item.setAttribute('href', 'help-faqs.html#faq-persona');
            item.textContent = SafeDOM.toSafeString(label, 120);
            grid.appendChild(item);
        });
    }

    function renderPersonaFaqs(persona) {
        var list = document.getElementById('faqAccordionList');
        SafeDOM.clearChildren(list);
        var faqs = Array.isArray(state.data.personas[persona]) ? state.data.personas[persona] : [];
        faqs.forEach(function (entry) {
            var item = SafeDOM.createEl('article', 'faq-accordion-item faq-reveal');
            var trigger = SafeDOM.createEl('button', 'faq-accordion-trigger', entry.q);
            trigger.type = 'button';
            var panel = SafeDOM.createEl('div', 'faq-accordion-panel');
            var content = SafeDOM.createEl('p', 'faq-accordion-content', entry.a);

            panel.appendChild(content);
            trigger.addEventListener('click', function () {
                item.classList.toggle('is-open');
            });
            item.appendChild(trigger);
            item.appendChild(panel);
            list.appendChild(item);
        });
    }

    function renderProducts() {
        var grid = document.getElementById('faqProductCards');
        SafeDOM.clearChildren(grid);
        state.data.products.forEach(function (prod) {
            var card = SafeDOM.createEl('article', 'faq-product-card faq-reveal');
            var name = SafeDOM.createEl('h3', 'faq-product-card__name', prod.name);
            var desc = SafeDOM.createEl('p', 'faq-product-card__meta', prod.description);
            var cta = SafeDOM.createEl('a', 'faq-product-card__cta', 'View Articles');
            SafeDOM.setSafeHref(cta, prod.href, { allowedProtocols: ['https:'], allowedHosts: [window.location.hostname] });
            if (!cta.getAttribute('href')) cta.setAttribute('href', '#');
            card.appendChild(name);
            card.appendChild(desc);
            card.appendChild(cta);
            grid.appendChild(card);
        });
    }

    function renderDomains() {
        var grid = document.getElementById('faqDomainGrid');
        SafeDOM.clearChildren(grid);
        state.data.domains.forEach(function (d) {
            var item = SafeDOM.createEl('a', 'faq-domain-item faq-reveal', d.label);
            SafeDOM.setSafeHref(item, d.href, { allowedProtocols: ['https:'], allowedHosts: [window.location.hostname] });
            if (!item.getAttribute('href')) item.setAttribute('href', '#');
            grid.appendChild(item);
        });
    }

    function handleSearchInput() {
        var input = document.getElementById('faqSearchInput');
        var suggestions = document.getElementById('faqSearchSuggestions');
        var noResult = document.getElementById('faqNoResultHint');
        var q = SafeDOM.normalizeQuery(input.value);

        SafeDOM.clearChildren(suggestions);
        noResult.hidden = true;
        if (!q) return;

        var pool = [];
        Object.keys(state.data.personas).forEach(function (key) {
            (state.data.personas[key] || []).forEach(function (entry) {
                pool.push({ type: 'faq', title: entry.q, description: entry.a, href: 'help-faqs.html#faq-persona' });
            });
        });
        state.data.categories.forEach(function (c) {
            pool.push({ type: 'category', title: c, description: 'Open category in Help Center.', href: 'help-faqs.html#faq-categories' });
        });

        var results = pool.filter(function (item) {
            var hay = SafeDOM.normalizeQuery(item.title + ' ' + item.description);
            return hay.indexOf(q) > -1;
        }).slice(0, 6);

        if (!results.length) {
            noResult.hidden = false;
            return;
        }

        results.forEach(function (item) {
            var link = SafeDOM.createEl('a', 'faq-suggestion');
            var text = SafeDOM.createEl('strong', '', item.title);
            var desc = SafeDOM.createEl('span', '', ' — ' + item.description);
            SafeDOM.setSafeHref(link, item.href, { allowedProtocols: ['https:'], allowedHosts: [window.location.hostname] });
            link.appendChild(text);
            link.appendChild(desc);
            suggestions.appendChild(link);
        });
    }

    function handleProblemSubmit(e) {
        e.preventDefault();
        var status = document.getElementById('faqProblemStatus');
        var persona = SafeDOM.toSafeString(document.getElementById('faqPersonaInput').value, 40);
        var product = SafeDOM.toSafeString(document.getElementById('faqProductInput').value, 40);
        var issue = SafeDOM.toSafeString(document.getElementById('faqIssueInput').value, 1200);
        var attachment = SafeDOM.toSafeString(document.getElementById('faqAttachmentInput').value, 300);
        var fileInput = document.getElementById('faqFilePlaceholder');
        var fileName = fileInput && fileInput.files && fileInput.files[0] ? SafeDOM.toSafeString(fileInput.files[0].name, 120) : '';

        if (!product) {
            status.textContent = 'Please select a product before submitting the problem.';
            return;
        }
        if (!issue || issue.length < 12) {
            status.textContent = 'Please add a clearer issue description (minimum 12 characters).';
            return;
        }

        var safeAttachment = attachment ? SafeDOM.validateUrl(attachment, { allowedProtocols: ['https:'] }) : null;
        var payload = {
            persona: persona,
            product: product,
            issue: issue,
            attachmentUrl: safeAttachment || '',
            filePlaceholderName: fileName,
            repeatedQueryKey: SafeDOM.normalizeQuery(issue),
            source: 'help-faqs'
        };

        // TODO (admin CMS integration): POST payload to /api/help-faqs/problems
        // This payload is designed for future admin workflows and article-creation loop.
        status.textContent = fileName
            ? 'Problem captured with file placeholder "' + fileName + '". Upload will be wired to CMS pipeline.'
            : 'Problem captured. A support ticket + CMS article-request signal can be created from this payload.';
        e.target.reset();
        window.__HELP_FAQS_LAST_PROBLEM__ = payload;
    }

    function initProgressAndReveal() {
        var ticking = false;
        var reveals = Array.prototype.slice.call(document.querySelectorAll('.faq-reveal'));

        function updateProgress() {
            var y = window.scrollY || window.pageYOffset;
            var max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
            page.style.setProperty('--faq-progress', Math.min(Math.max(y / max, 0), 1).toFixed(4));
            ticking = false;
        }

        function req() {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(updateProgress);
        }

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            reveals.forEach(function (el) {
                el.classList.add('is-visible');
            });
        } else {
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        io.unobserve(entry.target);
                    }
                });
            }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
            reveals.forEach(function (el, idx) {
                el.style.transitionDelay = Math.min(idx * 24, 280) + 'ms';
                io.observe(el);
            });
        }

        updateProgress();
        window.addEventListener('scroll', req, { passive: true });
        window.addEventListener('resize', req);
    }

    function initReturnLink() {
        var btn = document.getElementById('faqReturnButton');
        var ref = document.referrer;
        var fallback = 'index.html';
        var safe = fallback;

        if (ref) {
            try {
                var u = new URL(ref);
                if (u.origin === window.location.origin) {
                    safe = SafeDOM.toSafePath(u.pathname + (u.search || ''), ALLOWED_RETURN_PREFIXES, fallback);
                }
            } catch (err) {
                safe = fallback;
            }
        } else {
            var stored = sessionStorage.getItem('tinker:last-safe-path') || '';
            safe = SafeDOM.toSafePath(stored, ALLOWED_RETURN_PREFIXES, fallback);
        }

        btn.textContent = safe === 'index.html' ? 'Back to Home' : 'Back to previous page';
        btn.setAttribute('href', safe);
        btn.hidden = false;

        sessionStorage.setItem('tinker:last-safe-path', window.location.pathname.replace(/^\//, ''));
    }
})();
