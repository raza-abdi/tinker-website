(function () {
    'use strict';

    var DEFAULT_ALLOWED_PROTOCOLS = ['https:', 'mailto:'];

    function toSafeString(value, maxLen) {
        var str = value == null ? '' : String(value);
        if (typeof str.normalize === 'function') str = str.normalize('NFKC');
        str = str.trim();
        if (typeof maxLen === 'number' && maxLen > 0) str = str.slice(0, maxLen);
        return str;
    }

    function clearChildren(node) {
        while (node.firstChild) node.removeChild(node.firstChild);
    }

    function createEl(tag, className, text) {
        var el = document.createElement(tag);
        if (className) el.className = className;
        if (typeof text !== 'undefined') el.textContent = toSafeString(text);
        return el;
    }

    function toSafePath(rawPath, allowedPaths, fallbackPath) {
        var fallback = fallbackPath || 'index.html';
        var val = toSafeString(rawPath, 240);
        if (!val) return fallback;
        if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(val) || val.startsWith('//')) return fallback;
        if (!/^\/?[a-zA-Z0-9._\-\/#?=&]*$/.test(val)) return fallback;
        var path = val.startsWith('/') ? val.slice(1) : val;
        if (!path) return fallback;
        if (!allowedPaths || !allowedPaths.length) return path;
        var isAllowed = allowedPaths.some(function (p) {
            return path.indexOf(p) === 0;
        });
        return isAllowed ? path : fallback;
    }

    function validateUrl(rawUrl, options) {
        var opts = options || {};
        var allowedProtocols = Array.isArray(opts.allowedProtocols) && opts.allowedProtocols.length ? opts.allowedProtocols : DEFAULT_ALLOWED_PROTOCOLS;
        var allowedHosts = Array.isArray(opts.allowedHosts) ? opts.allowedHosts : [];
        var val = toSafeString(rawUrl, 480);
        if (!val) return null;

        try {
            var parsed = new URL(val, window.location.origin);
            if (allowedProtocols.indexOf(parsed.protocol) === -1) return null;
            if (allowedHosts.length && parsed.origin !== window.location.origin) {
                if (allowedHosts.indexOf(parsed.hostname) === -1) return null;
            }
            return parsed.href;
        } catch (err) {
            return null;
        }
    }

    function setSafeHref(anchor, rawUrl, options) {
        var safe = validateUrl(rawUrl, options);
        if (!safe) {
            anchor.removeAttribute('href');
            anchor.setAttribute('aria-disabled', 'true');
            return false;
        }
        anchor.setAttribute('href', safe);
        if (/^https?:\/\//i.test(safe) && !safe.startsWith(window.location.origin)) {
            anchor.setAttribute('target', '_blank');
            anchor.setAttribute('rel', 'noopener noreferrer');
        }
        return true;
    }

    function normalizeQuery(raw) {
        var q = toSafeString(raw, 120).toLowerCase();
        q = q.replace(/\s+/g, ' ');
        return q;
    }

    window.SafeDOM = {
        toSafeString: toSafeString,
        clearChildren: clearChildren,
        createEl: createEl,
        toSafePath: toSafePath,
        validateUrl: validateUrl,
        setSafeHref: setSafeHref,
        normalizeQuery: normalizeQuery
    };
})();
