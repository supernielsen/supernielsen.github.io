(function() {
    const els = {
        themeBtn: document.getElementById('theme-toggle'),
        navCards: document.querySelectorAll('.nav-card'),
        sections: document.querySelectorAll('.content-section'),
        sliders: document.querySelectorAll('.comp-slider'),
        termOpen: document.getElementById('term-open-btn'),
        termClose: document.getElementById('term-close-btn'),
        termModal: document.getElementById('terminal-modal'),
        termForm: document.getElementById('term-form'),
        termInput: document.getElementById('term-input'),
        termOutput: document.getElementById('term-output'),
        termBody: document.getElementById('term-body')
    };

    const termState = { history: [], historyIdx: -1, loadingInterval: null };

    function init() {
        setupTheme();
        setupNavigation();
        setupSliders();
        setupTerminalEvents();
    }

    function setupTheme() {
        const isDark = localStorage.getItem('theme') === 'dark';
        if (isDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
            updateThemeButton(true);
        }

        els.themeBtn.addEventListener('click', () => {
            const currentlyDark = document.documentElement.getAttribute('data-theme') === 'dark';
            if (currentlyDark) {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
                updateThemeButton(false);
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                updateThemeButton(true);
            }
        });
    }

    function updateThemeButton(isDark) {
        els.themeBtn.setAttribute('aria-pressed', isDark ? "true" : "false");
        els.themeBtn.setAttribute('aria-label', isDark ? "Skift til lyst tema" : "Skift til mørkt tema");
    }

    function setupNavigation() {
        els.navCards.forEach(card => {
            card.addEventListener('click', () => {
                const targetId = card.getAttribute('data-target');
                els.sections.forEach(s => s.classList.toggle('active', s.id === targetId));
                els.navCards.forEach(c => {
                    const isActive = c === card;
                    c.classList.toggle('active', isActive);
                    c.setAttribute('aria-selected', isActive);
                });
            });
        });
    }

    function setupSliders() {
        els.sliders.forEach(slider => {
            const container = slider.closest('.comp-container');
            slider.addEventListener('input', (e) => {
                container.style.setProperty('--pos', `${e.target.value}%`);
            });
        });
    }
    
    const commands = {
        'help': () => printHTML(`
            <div style="color: #bbb; margin-bottom: 10px;">Tilgængelige kommandoer:</div>
            <table style="width: 100%; color: #fff;">
                <tr><td style="color:var(--term-info)">skills</td><td>Viser teknisk stak & kompetencer</td></tr>
                <tr><td style="color:var(--term-info)">ai-team</td><td>Viser min agent-arkitektur</td></tr>
                <tr><td style="color:var(--term-info)">philosophy</td><td>Min tilgang til ledelse</td></tr>
                <tr><td style="color:var(--term-info)">coffee-status</td><td>System check af kaffemaskinen</td></tr>
                <tr><td style="color:var(--term-info)">contact</td><td>Viser kontaktinfo</td></tr>
                <tr><td style="color:var(--term-info)">clear</td><td>Rydder terminalen</td></tr>
                <tr><td style="color:var(--term-info)">exit</td><td>Lukker terminalen</td></tr>
            </table>`),
        'skills': () => printHTML(`
            [LOADING MODULES]...
            --------------------
            > Project Management ... <span style="color: var(--term-success)">[EXPERT]</span>
            > AI Orchestration ..... <span style="color: var(--term-success)">[EXPERT]</span>
            > Root Cause Analysis .. <span style="color: var(--term-success)">[EXPERT]</span>
            > Python Scripting ..... <span style="color: #ffbd2e">[INTERMEDIATE]</span>
            > 3D CAD & Print ....... <span style="color: var(--term-success)">[MAKER LEVEL]</span>
            --------------------`),
        'ai-team': () => printHTML(`
            <span style="color: var(--term-info)">[INITIATING AI AGENT STRUCTURE]</span><br>
            > Expert 1: Contract Analysis (Data: Anonymized Contracts)<br>
            > Expert 2: Delivery Manager (Data: Deliverable Logs)<br>
            > Expert 3: Technical Critic (Data: System Specs)<br>
            --------------------------------------------------<br>
            <span style="color: var(--term-success)">RESULT: 100% facts-based output. Hallucinations: 0%.</span>`),
        'philosophy': () => printText(`"Leadership is about playing your team good. A leader with poor employees is simply a poor leader."`, "info"),
        'coffee-status': () => printHTML(`Machine: <span style="color: var(--term-success)">OK</span>. | Beans: Dark Roast. | Logic: Enabled.`),
        'contact': () => printHTML(`Email: <a href='mailto:supernielsen@mensa.dk' style='color:var(--term-info)'>supernielsen@mensa.dk</a><br>LinkedIn: <a href='https://www.linkedin.com/in/patrickmosskovnielsen/' target='_blank' rel='noopener noreferrer' style='color:var(--term-info)'>Patrick Mosskov Nielsen</a>`),
        'cv': () => simulateLoading(),
        'clear': () => els.termOutput.innerHTML = "",
        'exit': () => toggleTerminal(false),
        'sudo': () => printText(`Permission denied. Please execute 'contact' to request admin privileges.`, "error")
    };
    
    commands['sudo hire patrick'] = commands['sudo'];

    function setupTerminalEvents() {
        els.termOpen.addEventListener('click', () => toggleTerminal(true));
        els.termClose.addEventListener('click', () => toggleTerminal(false));
        els.termModal.addEventListener('click', (e) => { if (e.target === els.termModal) toggleTerminal(false); });

        els.termForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const cmd = els.termInput.value.trim().toLowerCase();
            if (!cmd) return;
            
            termState.history.unshift(cmd);
            termState.historyIdx = -1;
            
            printText(`guest@portfolio:~$ ${cmd}`, "normal");

            if (commands[cmd]) commands[cmd]();
            else printText(`Fejl: '${cmd}' ikke fundet. Skriv 'help'.`, "error");
            
            els.termInput.value = "";
            els.termBody.scrollTo({ top: els.termBody.scrollHeight, behavior: 'smooth' });
        });

        els.termInput.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp') { e.preventDefault(); browseHistory(1); }
            if (e.key === 'ArrowDown') { e.preventDefault(); browseHistory(-1); }
        });

        document.addEventListener('keydown', (e) => { 
            if (e.key === 'Escape' && els.termModal.style.display === 'flex') toggleTerminal(false); 
        });
    }

    function toggleTerminal(show) {
        els.termModal.style.display = show ? 'flex' : 'none';
        if (show) setTimeout(() => els.termInput.focus(), 50);
        else if(termState.loadingInterval) clearInterval(termState.loadingInterval);
    }

    function browseHistory(dir) {
        if (termState.history.length === 0) return;
        termState.historyIdx += dir;
        if (termState.historyIdx < 0) { termState.historyIdx = -1; els.termInput.value = ""; return; }
        if (termState.historyIdx >= termState.history.length) termState.historyIdx = termState.history.length - 1;
        els.termInput.value = termState.history[termState.historyIdx];
    }

    function printText(text, type = "normal") {
        const div = document.createElement('div');
        div.textContent = text; 
        if (type === "error") div.style.color = "var(--term-error)";
        else if (type === "success") div.style.color = "var(--term-success)";
        else if (type === "info") div.style.color = "var(--term-info)";
        div.style.marginBottom = "8px";
        els.termOutput.appendChild(div);
    }

    function printHTML(htmlStr) {
        const div = document.createElement('div');
        div.innerHTML = htmlStr; 
        div.style.marginBottom = "8px";
        els.termOutput.appendChild(div);
    }

    function simulateLoading() {
        printText("Initierer sikker download...", "info");
        const lastLine = els.termOutput.lastChild;
        let dots = 0;
        
        if(termState.loadingInterval) clearInterval(termState.loadingInterval);
        termState.loadingInterval = setInterval(() => {
            dots = (dots + 1) % 4;
            lastLine.textContent = `Initierer sikker download${'.'.repeat(dots)}`;
        }, 300);
        
        setTimeout(() => {
            clearInterval(termState.loadingInterval);
            if(els.termModal.style.display === 'flex') {
                printText("Download klar! Åbner PDF...", "success");
                window.open('Patrick_Nielsen_CV.pdf', '_blank');
            }
        }, 1500);
    }

    document.addEventListener('DOMContentLoaded', init);
})();
