const fs = require('fs');

['terms.html', 'privacy.html'].forEach(f => {
    try {
        let content = fs.readFileSync(f, 'utf8');

        // Remove old consent bar wrapper and content
        // E.g. <div class="consent-bar" id="consentBar"> ... </div>
        content = content.replace(/<(!--\s*Bottom Interactive Consent Bar\s*--|div class="consent-bar"[^>]*>)[\s\S]*?(<\/div>\s*<\/div>|<\/div>\s*(?:<\!-- Footer|<footer))/i, "");

        const newCSS = "\n" +
        "        /* --- MODERN CONSENT BAR --- */\n" +
        "        .consent-bar-m {\n" +
        "            position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%) translateY(120px);\n" +
        "            background: rgba(255, 255, 255, 0.85);\n" +
        "            backdrop-filter: blur(25px) saturate(180%); -webkit-backdrop-filter: blur(25px) saturate(180%);\n" +
        "            border: 1px solid rgba(200, 220, 240, 0.4); border-radius: 16px; \n" +
        "            padding: 14px 28px; display: flex; align-items: center; gap: 24px;\n" +
        "            box-shadow: 0 20px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.03); z-index: 9999;\n" +
        "            width: max-content; max-width: 90vw; flex-wrap: wrap; justify-content: space-between;\n" +
        "            opacity: 0; animation: slideUpConsent 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.5s forwards;\n" +
        "            overflow: hidden;\n" +
        "        }\n" +
        "        .consent-gradient-line {\n" +
        "            position: absolute; top: 0; left: 0; width: 100%; height: 3px;\n" +
        "            background: linear-gradient(90deg, #0099FD, #FFE600, #30C70B, #0099FD);\n" +
        "            background-size: 200% 100%;\n" +
        "            animation: gradient-flow-bar 3s linear infinite;\n" +
        "        }\n" +
        "        @keyframes gradient-flow-bar { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }\n" +
        "        @keyframes slideUpConsent { to { transform: translateX(-50%) translateY(0); opacity: 1; } }\n" +
        "\n" +
        "        .consent-text { font-size: 0.9rem; color: #444; font-weight: 500; margin: 0; padding-right: 10px; }\n" +
        "        .c-actions { display: flex; gap: 12px; align-items: center; }\n" +
        "\n" +
        "        .btn-c-accept {\n" +
        "            display: flex; align-items: center; gap: 6px;\n" +
        "            background: linear-gradient(135deg, #0099FD, #30C70B);\n" +
        "            background-size: 150% 150%;\n" +
        "            color: #FFF; border: none; padding: 8px 20px; border-radius: 30px;\n" +
        "            font-size: 0.9rem; font-weight: 600; cursor: pointer;\n" +
        "            transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);\n" +
        "            position: relative; box-shadow: 0 4px 12px rgba(0,153,253,0.3);\n" +
        "        }\n" +
        "        .btn-c-accept:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 8px 20px rgba(0,153,253,0.4); background-position: 100% center; }\n" +
        "        .btn-c-accept:active { transform: translateY(1px) scale(0.98); }\n" +
        "\n" +
        "        .svg-tick {\n" +
        "            width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 2.5;\n" +
        "            stroke-linecap: round; stroke-linejoin: round;\n" +
        "            stroke-dasharray: 20; stroke-dashoffset: 20; transition: stroke-dashoffset 0.4s ease 0.1s;\n" +
        "        }\n" +
        "        .btn-c-accept:hover .svg-tick { stroke-dashoffset: 0; }\n" +
        "\n" +
        "        .btn-c-details {\n" +
        "            display: flex; align-items: center; gap: 6px;\n" +
        "            background: transparent; color: #555; border: 1px solid rgba(0,0,0,0.1); \n" +
        "            padding: 8px 18px; border-radius: 30px; font-size: 0.9rem; font-weight: 500; \n" +
        "            cursor: pointer; text-decoration: none; transition: all 0.3s ease; position: relative; overflow: hidden;\n" +
        "        }\n" +
        "        .btn-c-details::before {\n" +
        "            content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;\n" +
        "            background: linear-gradient(90deg, transparent, rgba(0,153,253,0.08), transparent);\n" +
        "            transition: left 0.4s ease; z-index: 0;\n" +
        "        }\n" +
        "        .btn-c-details:hover::before { left: 100%; }\n" +
        "        .btn-c-details:hover { border-color: rgba(0,153,253,0.3); color: #0099FD; background: rgba(0,153,253,0.02); transform: translateY(-1px); }\n" +
        "        .btn-c-details span { z-index: 1; }\n" +
        "\n" +
        "        .svg-arrow {\n" +
        "            width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 2;\n" +
        "            stroke-linecap: round; stroke-linejoin: round; z-index: 1; transition: transform 0.3s ease;\n" +
        "        }\n" +
        "        .btn-c-details:hover .svg-arrow { transform: translateX(3px); }\n" +
        "        /* --- END MODERN CONSENT BAR --- */\n</style>\n";

        const newHTML = "\n        <!-- Modern Animated Consent Bar -->\n" +
        "        <div class=\"consent-bar-m\" id=\"consentBarModern\">\n" +
        "            <div class=\"consent-gradient-line\"></div>\n" +
        "            <p class=\"consent-text\">By continuing to use this platform, you agree to our Terms & Data Practices.</p>\n" +
        "            <div class=\"c-actions\">\n" +
        "                <button class=\"btn-c-accept\" onclick=\"document.getElementById('consentBarModern').style.opacity='0'; setTimeout(function(){document.getElementById('consentBarModern').style.display='none';}, 400)\">\n" +
        "                    <svg class=\"svg-tick\" viewBox=\"0 0 24 24\"><path d=\"M4 12l5 5L20 6\"></path></svg>\n" +
        "                    Accept\n" +
        "                </button>\n" +
        "                <a href=\"privacy.html\" class=\"btn-c-details\">\n" +
        "                    <span>View Details</span>\n" +
        "                    <svg class=\"svg-arrow\" viewBox=\"0 0 24 24\"><path d=\"M5 12h14M12 5l7 7-7 7\"></path></svg>\n" +
        "                </a>\n" +
        "            </div>\n" +
        "        </div>\n";

        if (!content.includes('consent-bar-m')) {
            content = content.replace('</style>', newCSS);
        }
        
        if (!content.includes('consentBarModern')) {
            content = content.replace(/(?=<!-- Footer)/i, newHTML);
        }

        fs.writeFileSync(f, content);
        console.log('Fixed', f);
    } catch(e) {
        console.log('Failed', f, e.message);
    }
});
