define(['core/ajax', 'core/notification', 'core/str', 'core/url'], function(Ajax, Notification, Str, Url) {

    function onReady(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
            return;
        }
        fn();
    }

    function init(config) {
        onReady(function() {
            const cfg = config || {};
            const enabled = {
                text: !!cfg.enabletext,
                image: !!cfg.enableimage,
                reading: !!cfg.enablereading,
                navigation: !!cfg.enablenavigation,
                audio: !!cfg.enableaudio,
                tts: !!cfg.enabletts,
                stt: !!cfg.enablestt
            };

            const canUseRemote = !!cfg.loggedin;

            const LS_KEY = 'local_fullaccessibility_state';

            function clamp(v, min, max) {
                return Math.max(min, Math.min(max, v));
            }

            function findAnchor() {
                const usernav = document.querySelector('#usernavigation');
                if (usernav) {
                    const notifRegion = usernav.querySelector('#nav-notification-popover-container');
                    if (notifRegion) {
                        return {type: 'before', el: notifRegion};
                    }
                    return {type: 'append', el: usernav};
                }

                const menu = document.querySelector('.usermenu') || document.querySelector('[data-region="user-menu"]');
                if (menu) {
                    return {type: 'append', el: menu};
                }

                const headerActions = document.querySelector('[data-region="header-actions"]');
                if (headerActions) {
                    return {type: 'append', el: headerActions};
                }

                const nav = document.querySelector('.navbar-nav');
                if (nav) {
                    return {type: 'append', el: nav};
                }

                const header = document.querySelector('header');
                if (header) {
                    return {type: 'append', el: header};
                }

                return null;
            }

            if (document.querySelector('#nav-accessibility-popover-container')) {
                return;
            }

            const a11yRegion = document.createElement('div');
            a11yRegion.id = 'nav-accessibility-popover-container';
            a11yRegion.className = 'popover-region collapsed popover-region-notifications';
            a11yRegion.setAttribute('data-region', 'popover-region');

            const popId = 'popover-region-container-accessibility-' + Date.now();

            function btn(label, action, kind) {
                const cls = kind === 'danger'
                    ? 'btn btn-sm btn-outline-danger'
                    : (kind === 'primary' ? 'btn btn-sm btn-outline-primary' : 'btn btn-sm btn-outline-secondary');

                return '<button type="button" class="' + cls + '" data-action="' + action + '">' + label + '</button>';
            }

            function h(label) {
                return '<div class="fullaccessibility-section-title">' + label + '</div>';
            }

            function sectionWrap(inner, mbClass) {
                const cls = mbClass ? ('fullaccessibility-section-wrap ' + mbClass) : 'fullaccessibility-section-wrap';
                return '<div class="' + cls + '">' + inner + '</div>';
            }

            function buildContent(strings) {
                let html = '';

                if (enabled.text) {
                    html += h(strings.section_text);
                    html += sectionWrap(
                        btn(strings.btn_font_plus, 'a11y-font-plus') +
                        btn(strings.btn_font_minus, 'a11y-font-minus') +
                        btn(strings.btn_font_readable, 'a11y-font-readable'),
                        'fullaccessibility-mb-75'
                    );

                    html += h(strings.section_contrast);
                    html += sectionWrap(
                        btn(strings.btn_contrast, 'a11y-contrast') +
                        btn(strings.btn_invert, 'a11y-invert') +
                        btn(strings.btn_grayscale, 'a11y-grayscale'),
                        'fullaccessibility-mb-75'
                    );
                }

                if (enabled.image) {
                    html += h(strings.section_image);
                    html += sectionWrap(
                        btn(strings.btn_sat_plus, 'a11y-sat-plus') +
                        btn(strings.btn_sat_minus, 'a11y-sat-minus') +
                        btn(strings.btn_bright_plus, 'a11y-bright-plus') +
                        btn(strings.btn_bright_minus, 'a11y-bright-minus'),
                        'fullaccessibility-mb-75'
                    );
                }

                if (enabled.reading) {
                    html += h(strings.section_reading);
                    html += sectionWrap(
                        btn(strings.btn_letter_plus, 'a11y-letter-plus') +
                        btn(strings.btn_letter_minus, 'a11y-letter-minus') +
                        btn(strings.btn_line_plus, 'a11y-line-plus') +
                        btn(strings.btn_line_minus, 'a11y-line-minus') +
                        btn(strings.btn_underline_links, 'a11y-underline-links'),
                        'fullaccessibility-mb-75'
                    );
                }

                if (enabled.navigation) {
                    html += h(strings.section_navigation);
                    html += sectionWrap(
                        btn(strings.btn_focus, 'a11y-focus') +
                        btn(strings.btn_reduce_motion, 'a11y-reduce-motion'),
                        'fullaccessibility-mb-75'
                    );
                }

                if (enabled.audio && (enabled.tts || enabled.stt)) {
                    html += h(strings.section_audio);

                    let aud = '';
                    if (enabled.tts) {
                        aud += btn(strings.btn_read_selection, 'a11y-read-selection');
                        aud += btn(strings.btn_read_page, 'a11y-read-page');
                        aud += btn(strings.btn_stop_audio, 'a11y-stop-audio');
                    }

                    if (enabled.stt) {
                        aud += btn(strings.btn_transcribe_start, 'a11y-transcribe-toggle', 'primary');
                    }

                    html += sectionWrap(aud, 'fullaccessibility-mb-50');

                    if (enabled.stt) {
                        html += '<textarea class="form-control fullaccessibility-transcript" ' +
                            'data-region="fullaccessibility-transcript" ' +
                            'placeholder="' + strings.transcription_placeholder + '" ' +
                            'aria-label="' + strings.transcription_placeholder + '" readonly></textarea>';
                        html += '<div class="fullaccessibility-mb-75"></div>';
                    } else {
                        html += '<div class="fullaccessibility-mb-75"></div>';
                    }
                }

                html += '<div class="fullaccessibility-footer">' +
                    btn(strings.btn_reset, 'a11y-reset', 'danger') +
                '</div>';

                return html;
            }

            function insertOnce() {
                if (document.querySelector('#nav-accessibility-popover-container')) {
                    return true;
                }

                const anchor = findAnchor();
                if (!anchor) {
                    return false;
                }

                if (anchor.type === 'before') {
                    anchor.el.insertAdjacentElement('beforebegin', a11yRegion);
                } else {
                    anchor.el.appendChild(a11yRegion);
                }

                return true;
            }

            function waitForAnchorAndInsert() {
                if (insertOnce()) {
                    return;
                }

                let done = false;

                const obs = new MutationObserver(function() {
                    if (done) {
                        return;
                    }
                    if (insertOnce()) {
                        done = true;
                        try {
                            obs.disconnect();
                        } catch (ex) {
                            /* */
                        }
                    }
                });

                try {
                    obs.observe(document.body, {childList: true, subtree: true});
                } catch (ex) {
                    /* */
                }

                window.setTimeout(function() {
                    if (done) {
                        return;
                    }
                    try {
                        obs.disconnect();
                    } catch (ex) {
                        /* */
                    }

                    if (!document.querySelector('#nav-accessibility-popover-container')) {
                        try {
                            a11yRegion.classList.add('fullaccessibility-fallback');
                            document.body.appendChild(a11yRegion);
                        } catch (ex) {
                            /* */
                        }
                    }
                }, 8000);
            }

            function closePopover() {
                toggle.setAttribute('aria-expanded', 'false');
                container.setAttribute('aria-hidden', 'true');
                container.style.display = 'none';
                a11yRegion.classList.add('collapsed');
            }

            function openPopover() {
                toggle.setAttribute('aria-expanded', 'true');
                container.setAttribute('aria-hidden', 'false');
                container.style.display = '';
                a11yRegion.classList.remove('collapsed');
            }

            function togglePopover() {
                const expanded = toggle.getAttribute('aria-expanded') === 'true';
                if (expanded) {
                    closePopover();
                } else {
                    openPopover();
                }
            }

            const state = {
                fontStep: 0,
                letterStep: 0,
                lineStep: 0,
                saturation: 100,
                brightness: 100
            };

            function applyRootSizing() {
                document.documentElement.style.fontSize = (100 + state.fontStep * 5) + '%';
            }

            function applyFilter() {
                const parts = [];

                if (document.body.classList.contains('fullaccessibility-a11y-contrast')) {
                    parts.push('contrast(1.2)');
                }
                if (document.body.classList.contains('fullaccessibility-a11y-invert')) {
                    parts.push('invert(1)');
                }
                if (document.body.classList.contains('fullaccessibility-a11y-grayscale')) {
                    parts.push('grayscale(1)');
                }

                parts.push('saturate(' + (state.saturation / 100) + ')');
                parts.push('brightness(' + (state.brightness / 100) + ')');

                document.documentElement.style.filter = parts.join(' ');
            }

            function applyReading() {
                const letter = (state.letterStep * 0.02);
                const line = (state.lineStep * 0.08);

                document.documentElement.style.letterSpacing = (letter === 0 ? '' : (letter.toFixed(2) + 'em'));
                document.documentElement.style.lineHeight = (line === 0 ? '' : (1.2 + line).toFixed(2));
            }

            function updateActiveButtons() {
                const cls = {
                    contrast: document.body.classList.contains('fullaccessibility-a11y-contrast'),
                    invert: document.body.classList.contains('fullaccessibility-a11y-invert'),
                    grayscale: document.body.classList.contains('fullaccessibility-a11y-grayscale'),
                    focus: document.body.classList.contains('fullaccessibility-a11y-focus'),
                    underlineLinks: document.body.classList.contains('fullaccessibility-a11y-underline-links'),
                    readableFont: document.body.classList.contains('fullaccessibility-a11y-readable-font'),
                    reduceMotion: document.body.classList.contains('fullaccessibility-a11y-reduce-motion')
                };

                const btnMap = {
                    'a11y-font-readable': !!cls.readableFont,
                    'a11y-contrast': !!cls.contrast,
                    'a11y-invert': !!cls.invert,
                    'a11y-grayscale': !!cls.grayscale,
                    'a11y-underline-links': !!cls.underlineLinks,
                    'a11y-focus': !!cls.focus,
                    'a11y-reduce-motion': !!cls.reduceMotion,
                    'a11y-font-plus': state.fontStep > 0,
                    'a11y-font-minus': state.fontStep < 0,
                    'a11y-letter-plus': state.letterStep > 0,
                    'a11y-letter-minus': state.letterStep < 0,
                    'a11y-line-plus': state.lineStep > 0,
                    'a11y-line-minus': state.lineStep < 0,
                    'a11y-sat-plus': state.saturation !== 100,
                    'a11y-sat-minus': state.saturation !== 100,
                    'a11y-bright-plus': state.brightness !== 100,
                    'a11y-bright-minus': state.brightness !== 100
                };

                Object.keys(btnMap).forEach(function(action) {
                    const el = a11yRegion.querySelector('button[data-action="' + action + '"]');
                    if (!el) {
                        return;
                    }
                    el.classList.toggle('active', !!btnMap[action]);
                });
            }

            function resetAll() {
                state.fontStep = 0;
                state.letterStep = 0;
                state.lineStep = 0;
                state.saturation = 100;
                state.brightness = 100;

                document.documentElement.style.fontSize = '';
                document.documentElement.style.filter = '';
                document.documentElement.style.letterSpacing = '';
                document.documentElement.style.lineHeight = '';

                document.body.classList.remove(
                    'fullaccessibility-a11y-contrast',
                    'fullaccessibility-a11y-invert',
                    'fullaccessibility-a11y-grayscale',
                    'fullaccessibility-a11y-focus',
                    'fullaccessibility-a11y-underline-links',
                    'fullaccessibility-a11y-readable-font',
                    'fullaccessibility-a11y-reduce-motion'
                );

                if (enabled.tts) {
                    try {
                        window.speechSynthesis.cancel();
                    } catch (ex) {
                        /* */
                    }
                }

                if (enabled.stt) {
                    stopTranscription();
                    const ta = a11yRegion.querySelector('[data-region="fullaccessibility-transcript"]');
                    if (ta) {
                        ta.value = '';
                    }
                }

                const activeBtns = a11yRegion.querySelectorAll('button[data-action].active');
                if (activeBtns && activeBtns.length) {
                    activeBtns.forEach(function(el) {
                        el.classList.remove('active');
                    });
                }
            }

            function getPayload() {
                return {
                    fontStep: state.fontStep,
                    letterStep: state.letterStep,
                    lineStep: state.lineStep,
                    saturation: state.saturation,
                    brightness: state.brightness,
                    classes: {
                        contrast: document.body.classList.contains('fullaccessibility-a11y-contrast'),
                        invert: document.body.classList.contains('fullaccessibility-a11y-invert'),
                        grayscale: document.body.classList.contains('fullaccessibility-a11y-grayscale'),
                        focus: document.body.classList.contains('fullaccessibility-a11y-focus'),
                        underlineLinks: document.body.classList.contains('fullaccessibility-a11y-underline-links'),
                        readableFont: document.body.classList.contains('fullaccessibility-a11y-readable-font'),
                        reduceMotion: document.body.classList.contains('fullaccessibility-a11y-reduce-motion')
                    }
                };
            }

            function applyPayload(payload) {
                if (!payload || typeof payload !== 'object') {
                    return;
                }

                if (typeof payload.fontStep === 'number') {
                    state.fontStep = clamp(payload.fontStep, -2, 4);
                }
                if (typeof payload.letterStep === 'number') {
                    state.letterStep = clamp(payload.letterStep, -2, 4);
                }
                if (typeof payload.lineStep === 'number') {
                    state.lineStep = clamp(payload.lineStep, -2, 4);
                }
                if (typeof payload.saturation === 'number') {
                    state.saturation = clamp(payload.saturation, 50, 150);
                }
                if (typeof payload.brightness === 'number') {
                    state.brightness = clamp(payload.brightness, 70, 130);
                }

                const cls = payload.classes || {};

                document.body.classList.toggle('fullaccessibility-a11y-contrast', !!cls.contrast);
                document.body.classList.toggle('fullaccessibility-a11y-invert', !!cls.invert);
                document.body.classList.toggle('fullaccessibility-a11y-grayscale', !!cls.grayscale);
                document.body.classList.toggle('fullaccessibility-a11y-focus', !!cls.focus);
                document.body.classList.toggle('fullaccessibility-a11y-underline-links', !!cls.underlineLinks);
                document.body.classList.toggle('fullaccessibility-a11y-readable-font', !!cls.readableFont);
                document.body.classList.toggle('fullaccessibility-a11y-reduce-motion', !!cls.reduceMotion);

                applyRootSizing();
                applyReading();
                applyFilter();

                updateActiveButtons();
            }

            function saveLocal(payload) {
                try {
                    window.localStorage.setItem(LS_KEY, JSON.stringify(payload));
                } catch (ex) {
                    /* */
                }
            }

            function loadLocal() {
                try {
                    const raw = window.localStorage.getItem(LS_KEY);
                    if (!raw) {
                        return null;
                    }
                    return JSON.parse(raw);
                } catch (ex) {
                    return null;
                }
            }

            function saveRemote(payload) {
                if (!canUseRemote) {
                    return null;
                }
                try {
                    return Ajax.call([{
                        methodname: 'local_fullaccessibility_a11y_state_save',
                        args: {
                            statejson: JSON.stringify(payload)
                        }
                    }])[0];
                } catch (ex) {
                    return null;
                }
            }

            function loadRemote() {
                if (!canUseRemote) {
                    return null;
                }
                try {
                    return Ajax.call([{
                        methodname: 'local_fullaccessibility_a11y_state_get',
                        args: {}
                    }])[0];
                } catch (ex) {
                    return null;
                }
            }

            let saveTimer = null;
            let pendingPayload = null;

            function flushRemoteSave() {
                if (!pendingPayload) {
                    return;
                }

                const payload = pendingPayload;
                pendingPayload = null;

                const req = saveRemote(payload);
                if (req && typeof req.then === 'function') {
                    req.catch(function(ex) {
                        try {
                            Notification.exception(ex);
                        } catch (e) {
                            /* */
                        }
                    });
                }
            }

            function saveState() {
                const payload = getPayload();
                saveLocal(payload);

                if (!canUseRemote) {
                    return;
                }

                pendingPayload = payload;
                if (saveTimer) {
                    window.clearTimeout(saveTimer);
                }

                saveTimer = window.setTimeout(function() {
                    saveTimer = null;
                    flushRemoteSave();
                }, 350);
            }

            function bootstrapSavedState() {
                if (canUseRemote) {
                    const remote = loadRemote();
                    if (remote && typeof remote.then === 'function') {
                        remote.then(function(res) {
                            try {
                                if (res && typeof res.statejson === 'string' && res.statejson) {
                                    const parsed = JSON.parse(res.statejson);
                                    applyPayload(parsed);
                                    saveLocal(getPayload());
                                    updateActiveButtons();
                                    return;
                                }
                            } catch (ex) {
                                /* */
                            }

                            const localFallback = loadLocal();
                            if (localFallback) {
                                applyPayload(localFallback);
                            } else {
                                applyPayload(getPayload());
                            }
                            updateActiveButtons();
                        }).catch(function() {
                            const localFallback = loadLocal();
                            if (localFallback) {
                                applyPayload(localFallback);
                            } else {
                                applyPayload(getPayload());
                            }
                            updateActiveButtons();
                        });

                        return;
                    }
                }

                const local = loadLocal();
                if (local) {
                    applyPayload(local);
                } else {
                    applyPayload(getPayload());
                }
                updateActiveButtons();
            }

            function getSelectedText() {
                try {
                    const sel = window.getSelection && window.getSelection();
                    if (!sel) {
                        return '';
                    }
                    return (sel.toString() || '').trim();
                } catch (ex) {
                    return '';
                }
            }

            function getPageText() {
                const main = document.querySelector('main') || document.body;
                let txt = '';
                try {
                    txt = (main && main.innerText) ? main.innerText : '';
                } catch (ex) {
                    txt = '';
                }
                txt = (txt || '').replace(/\s+/g, ' ').trim();
                if (txt.length > 5000) {
                    txt = txt.substring(0, 5000);
                }
                return txt;
            }

            function speakText(txt) {
                if (!enabled.tts) {
                    return;
                }

                const text = (txt || '').trim();
                if (!text) {
                    return;
                }

                try {
                    window.speechSynthesis.cancel();
                } catch (ex) {
                    /* */
                }

                try {
                    const utter = new SpeechSynthesisUtterance(text);
                    utter.rate = 1;
                    utter.pitch = 1;
                    utter.volume = 1;
                    window.speechSynthesis.speak(utter);
                } catch (ex) {
                    Notification.exception(ex);
                }
            }

            let recognizer = null;
            let transcribing = false;

            function canTranscribe() {
                return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
            }

            function stopTranscription() {
                transcribing = false;
                if (recognizer) {
                    try {
                        recognizer.onresult = null;
                        recognizer.onerror = null;
                        recognizer.onend = null;
                        recognizer.stop();
                    } catch (ex) {
                        /* */
                    }
                }
                recognizer = null;

                const btn = a11yRegion.querySelector('button[data-action="a11y-transcribe-toggle"]');
                if (btn) {
                    btn.classList.remove('active');
                }
            }

            function startTranscription(strings) {
                if (!enabled.stt || !canTranscribe()) {
                    return;
                }

                const R = window.SpeechRecognition || window.webkitSpeechRecognition;
                recognizer = new R();

                try {
                    recognizer.continuous = true;
                    recognizer.interimResults = true;
                    recognizer.lang = document.documentElement.getAttribute('lang') || 'pt-BR';
                } catch (ex) {
                    /* */
                }

                const ta = a11yRegion.querySelector('[data-region="fullaccessibility-transcript"]');

                recognizer.onresult = function(event) {
                    if (!ta) {
                        return;
                    }

                    let finalText = '';
                    let interim = '';

                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const res = event.results[i];
                        if (res.isFinal) {
                            finalText += res[0].transcript;
                        } else {
                            interim += res[0].transcript;
                        }
                    }

                    const current = (ta.value || '');
                    ta.value = (current + ' ' + finalText + ' ' + interim).replace(/\s+/g, ' ').trim();
                    ta.scrollTop = ta.scrollHeight;
                };

                recognizer.onerror = function() {
                    stopTranscription();
                };

                recognizer.onend = function() {
                    if (transcribing) {
                        try {
                            recognizer.start();
                        } catch (ex) {
                            stopTranscription();
                        }
                    }
                };

                try {
                    recognizer.start();
                    transcribing = true;
                    const btn = a11yRegion.querySelector('button[data-action="a11y-transcribe-toggle"]');
                    if (btn) {
                        btn.classList.add('active');
                        btn.textContent = strings.btn_transcribe_stop;
                    }
                } catch (ex) {
                    stopTranscription();
                }
            }

            function toggleTranscription(strings) {
                if (!enabled.stt) {
                    return;
                }

                if (!canTranscribe()) {
                    return;
                }

                if (transcribing) {
                    stopTranscription();
                    const btn = a11yRegion.querySelector('button[data-action="a11y-transcribe-toggle"]');
                    if (btn) {
                        btn.textContent = strings.btn_transcribe_start;
                    }
                    return;
                }

                startTranscription(strings);
            }

            Str.get_strings([
                {key: 'a11y_label', component: 'local_fullaccessibility'},
                {key: 'close', component: 'local_fullaccessibility'},
                {key: 'section_text', component: 'local_fullaccessibility'},
                {key: 'section_contrast', component: 'local_fullaccessibility'},
                {key: 'section_image', component: 'local_fullaccessibility'},
                {key: 'section_reading', component: 'local_fullaccessibility'},
                {key: 'section_navigation', component: 'local_fullaccessibility'},
                {key: 'section_audio', component: 'local_fullaccessibility'},
                {key: 'btn_font_plus', component: 'local_fullaccessibility'},
                {key: 'btn_font_minus', component: 'local_fullaccessibility'},
                {key: 'btn_font_readable', component: 'local_fullaccessibility'},
                {key: 'btn_contrast', component: 'local_fullaccessibility'},
                {key: 'btn_invert', component: 'local_fullaccessibility'},
                {key: 'btn_grayscale', component: 'local_fullaccessibility'},
                {key: 'btn_sat_plus', component: 'local_fullaccessibility'},
                {key: 'btn_sat_minus', component: 'local_fullaccessibility'},
                {key: 'btn_bright_plus', component: 'local_fullaccessibility'},
                {key: 'btn_bright_minus', component: 'local_fullaccessibility'},
                {key: 'btn_letter_plus', component: 'local_fullaccessibility'},
                {key: 'btn_letter_minus', component: 'local_fullaccessibility'},
                {key: 'btn_line_plus', component: 'local_fullaccessibility'},
                {key: 'btn_line_minus', component: 'local_fullaccessibility'},
                {key: 'btn_underline_links', component: 'local_fullaccessibility'},
                {key: 'btn_focus', component: 'local_fullaccessibility'},
                {key: 'btn_reduce_motion', component: 'local_fullaccessibility'},
                {key: 'btn_read_selection', component: 'local_fullaccessibility'},
                {key: 'btn_read_page', component: 'local_fullaccessibility'},
                {key: 'btn_stop_audio', component: 'local_fullaccessibility'},
                {key: 'btn_transcribe_start', component: 'local_fullaccessibility'},
                {key: 'btn_transcribe_stop', component: 'local_fullaccessibility'},
                {key: 'transcription_placeholder', component: 'local_fullaccessibility'},
                {key: 'btn_reset', component: 'local_fullaccessibility'}
            ]).done(function(list) {
                const strings = {
                    a11y_label: list[0],
                    close: list[1],
                    section_text: list[2],
                    section_contrast: list[3],
                    section_image: list[4],
                    section_reading: list[5],
                    section_navigation: list[6],
                    section_audio: list[7],
                    btn_font_plus: list[8],
                    btn_font_minus: list[9],
                    btn_font_readable: list[10],
                    btn_contrast: list[11],
                    btn_invert: list[12],
                    btn_grayscale: list[13],
                    btn_sat_plus: list[14],
                    btn_sat_minus: list[15],
                    btn_bright_plus: list[16],
                    btn_bright_minus: list[17],
                    btn_letter_plus: list[18],
                    btn_letter_minus: list[19],
                    btn_line_plus: list[20],
                    btn_line_minus: list[21],
                    btn_underline_links: list[22],
                    btn_focus: list[23],
                    btn_reduce_motion: list[24],
                    btn_read_selection: list[25],
                    btn_read_page: list[26],
                    btn_stop_audio: list[27],
                    btn_transcribe_start: list[28],
                    btn_transcribe_stop: list[29],
                    transcription_placeholder: list[30],
                    btn_reset: list[31]
                };

                a11yRegion.innerHTML =
                    '<div class="popover-region-toggle nav-link icon-no-margin" ' +
                    'data-region="popover-region-toggle" ' +
                    'aria-controls="' + popId + '" ' +
                    'aria-haspopup="true" ' +
                    'aria-expanded="false" ' +
                    'aria-label="' + strings.a11y_label + '" ' +
                    'title="' + strings.a11y_label + '" ' +
                    'tabindex="0" ' +
                    'role="button">' +
                        '<img class="icon fullaccessibility-icon" src="' + Url.imageUrl('icon', 'local_fullaccessibility') + '" alt="" aria-hidden="true" />' +
                    '</div>' +

                    '<div id="' + popId + '" ' +
                         'class="popover-region-container" ' +
                         'data-region="popover-region-container" ' +
                         'aria-hidden="true" ' +
                         'aria-label="' + strings.a11y_label + '" ' +
                         'role="region" ' +
                         'style="display:none;">' +

                        '<div class="popover-region-header-container">' +
                            '<h3 class="popover-region-header-text">' + strings.a11y_label + '</h3>' +
                            '<div class="popover-region-header-actions">' +
                                '<a href="#" class="mark-all-read-button" title="' + strings.close + '" role="button" ' +
                                   'aria-label="' + strings.close + '" data-action="fullaccessibility-a11y-close">' +
                                    '<span class="normal-icon"><i class="icon fa fa-times fa-fw" aria-hidden="true"></i></span>' +
                                '</a>' +
                            '</div>' +
                        '</div>' +

                        '<div class="popover-region-content-container">' +
                            '<div class="popover-region-content">' +
                                '<div class="fullaccessibility-content">' +
                                    buildContent(strings) +
                                '</div>' +
                            '</div>' +
                        '</div>' +

                    '</div>';

                waitForAnchorAndInsert();

                toggle = a11yRegion.querySelector('[data-region="popover-region-toggle"]');
                container = a11yRegion.querySelector('[data-region="popover-region-container"]');

                toggle.addEventListener('click', function(e) {
                    e.preventDefault();
                    togglePopover();
                });

                toggle.addEventListener('keydown', function(e) {
                    const key = e.key || e.code;
                    if (key === 'Enter' || key === ' ' || key === 'Spacebar') {
                        e.preventDefault();
                        togglePopover();
                    }
                    if (key === 'Escape' || key === 'Esc') {
                        e.preventDefault();
                        closePopover();
                    }
                });

                a11yRegion.addEventListener('click', function(e) {
                    const t = e.target;

                    const closeBtn = t && t.closest && t.closest('[data-action="fullaccessibility-a11y-close"]');
                    if (closeBtn) {
                        e.preventDefault();
                        closePopover();
                        return;
                    }

                    const btnEl = t && t.closest && t.closest('button[data-action]');
                    if (!btnEl) {
                        return;
                    }

                    const action = btnEl.getAttribute('data-action');

                    if (action === 'a11y-font-plus') {
                        state.fontStep = clamp(state.fontStep + 1, -2, 4);
                        applyRootSizing();
                        updateActiveButtons();
                        saveState();
                        return;
                    }

                    if (action === 'a11y-font-minus') {
                        state.fontStep = clamp(state.fontStep - 1, -2, 4);
                        applyRootSizing();
                        updateActiveButtons();
                        saveState();
                        return;
                    }

                    if (action === 'a11y-font-readable') {
                        document.body.classList.toggle('fullaccessibility-a11y-readable-font');
                        btnEl.classList.toggle('active');
                        saveState();
                        return;
                    }

                    if (action === 'a11y-contrast') {
                        document.body.classList.toggle('fullaccessibility-a11y-contrast');
                        btnEl.classList.toggle('active');
                        applyFilter();
                        saveState();
                        return;
                    }

                    if (action === 'a11y-invert') {
                        document.body.classList.toggle('fullaccessibility-a11y-invert');
                        btnEl.classList.toggle('active');
                        applyFilter();
                        saveState();
                        return;
                    }

                    if (action === 'a11y-grayscale') {
                        document.body.classList.toggle('fullaccessibility-a11y-grayscale');
                        btnEl.classList.toggle('active');
                        applyFilter();
                        saveState();
                        return;
                    }

                    if (action === 'a11y-sat-plus') {
                        state.saturation = clamp(state.saturation + 10, 50, 150);
                        applyFilter();
                        updateActiveButtons();
                        saveState();
                        return;
                    }

                    if (action === 'a11y-sat-minus') {
                        state.saturation = clamp(state.saturation - 10, 50, 150);
                        applyFilter();
                        updateActiveButtons();
                        saveState();
                        return;
                    }

                    if (action === 'a11y-bright-plus') {
                        state.brightness = clamp(state.brightness + 10, 70, 130);
                        applyFilter();
                        updateActiveButtons();
                        saveState();
                        return;
                    }

                    if (action === 'a11y-bright-minus') {
                        state.brightness = clamp(state.brightness - 10, 70, 130);
                        applyFilter();
                        updateActiveButtons();
                        saveState();
                        return;
                    }

                    if (action === 'a11y-letter-plus') {
                        state.letterStep = clamp(state.letterStep + 1, -2, 4);
                        applyReading();
                        updateActiveButtons();
                        saveState();
                        return;
                    }

                    if (action === 'a11y-letter-minus') {
                        state.letterStep = clamp(state.letterStep - 1, -2, 4);
                        applyReading();
                        updateActiveButtons();
                        saveState();
                        return;
                    }

                    if (action === 'a11y-line-plus') {
                        state.lineStep = clamp(state.lineStep + 1, -2, 4);
                        applyReading();
                        updateActiveButtons();
                        saveState();
                        return;
                    }

                    if (action === 'a11y-line-minus') {
                        state.lineStep = clamp(state.lineStep - 1, -2, 4);
                        applyReading();
                        updateActiveButtons();
                        saveState();
                        return;
                    }

                    if (action === 'a11y-underline-links') {
                        document.body.classList.toggle('fullaccessibility-a11y-underline-links');
                        btnEl.classList.toggle('active');
                        saveState();
                        return;
                    }

                    if (action === 'a11y-focus') {
                        document.body.classList.toggle('fullaccessibility-a11y-focus');
                        btnEl.classList.toggle('active');
                        saveState();
                        return;
                    }

                    if (action === 'a11y-reduce-motion') {
                        document.body.classList.toggle('fullaccessibility-a11y-reduce-motion');
                        btnEl.classList.toggle('active');
                        saveState();
                        return;
                    }

                    if (action === 'a11y-read-selection') {
                        speakText(getSelectedText());
                        return;
                    }

                    if (action === 'a11y-read-page') {
                        speakText(getPageText());
                        return;
                    }

                    if (action === 'a11y-stop-audio') {
                        if (enabled.tts) {
                            try {
                                window.speechSynthesis.cancel();
                            } catch (ex) {
                                /* */
                            }
                        }
                        return;
                    }

                    if (action === 'a11y-transcribe-toggle') {
                        toggleTranscription(strings);
                        return;
                    }

                    if (action === 'a11y-reset') {
                        resetAll();
                        try {
                            window.localStorage.removeItem(LS_KEY);
                        } catch (ex) {
                            /* */
                        }
                        saveRemote(getPayload());
                        return;
                    }
                });

                bootstrapSavedState();

                if (enabled.stt && !canTranscribe()) {
                    const btn = a11yRegion.querySelector('button[data-action="a11y-transcribe-toggle"]');
                    if (btn) {
                        btn.disabled = true;
                        btn.classList.remove('active');
                    }
                }
            }).fail(Notification.exception);

            let toggle = null;
            let container = null;
        });
    }

    return {
        init: init
    };
});