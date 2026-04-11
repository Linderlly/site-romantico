// ===== JARDIM DAS ROSAS =====

function initializeGarden() {
    loadGardenData();
    createRoses();
    document.getElementById('waterGarden')?.addEventListener('click', waterGarden);
    updateGardenStats();
    updateRoseGrowth();
}

function loadGardenData() {
    try {
        const saved = JSON.parse(localStorage.getItem('loveGarden'));
        if (saved) {
            CONFIG.garden.roseGrowth = saved.roseGrowth || 50;
            CONFIG.garden.lastWatered = saved.lastWatered;
        }
    } catch (e) {
        console.error('Erro ao carregar jardim:', e);
    }
}

function saveGardenData() {
    localStorage.setItem('loveGarden', JSON.stringify({ 
        roseGrowth: CONFIG.garden.roseGrowth, 
        lastWatered: CONFIG.garden.lastWatered 
    }));
}

function createRoses() {
    const container = document.getElementById('gardenContainer');
    if (!container) return;
    container.innerHTML = '';
    
    for (let i = 0; i < CONFIG.garden.totalRoses; i++) {
        const isSpecial = i === CONFIG.garden.specialRoseIndex;
        const rose = document.createElement('div');
        rose.className = 'rose-item';
        rose.dataset.index = i;
        rose.innerHTML = `
            <div class="rose ${isSpecial ? 'rose-special' : 'rose-normal'}">${isSpecial ? '🏵️' : '🌹'}</div>
            <div class="rose-stem"></div>
            <div class="rose-tooltip">${CONFIG.garden.roseMessages[i]}</div>
        `;
        rose.addEventListener('click', () => onRoseClick(i, isSpecial));
        container.appendChild(rose);
    }
}

function onRoseClick(i, isSpecial) {
    const msg = CONFIG.garden.roseMessages[i];
    showNotification(isSpecial ? `💖 ${msg} - Nossa rosa especial!` : `🌹 ${msg}`);
    
    if (isSpecial) {
        const specialMsg = document.getElementById('specialRoseMessage');
        if (specialMsg) {
            const messages = [
                "Esta rosa dourada representa o amor mais puro que temos!",
                "Nosso amor brilha como ouro em meio às outras rosas!",
                "Cada pétala desta rosa é um momento inesquecível nosso!"
            ];
            specialMsg.textContent = messages[Math.floor(Math.random() * messages.length)];
        }
    }
}

function waterGarden() {
    const last = CONFIG.garden.lastWatered ? new Date(CONFIG.garden.lastWatered) : null;
    const today = new Date();
    
    if (last && last.toDateString() === today.toDateString()) { 
        showNotification('💧 Você já regou o jardim hoje!'); 
        return; 
    }
    
    CONFIG.garden.roseGrowth = Math.min(100, CONFIG.garden.roseGrowth + 10);
    CONFIG.garden.lastWatered = today.toISOString();
    saveGardenData();
    updateRoseGrowth();
    updateGardenStats();
    
    let msg = '';
    if (CONFIG.garden.roseGrowth >= 100) msg = '🎉 Rosa dourada completamente crescida!';
    else if (CONFIG.garden.roseGrowth >= 75) msg = '🌺 Quase totalmente crescida!';
    else if (CONFIG.garden.roseGrowth >= 50) msg = '🌸 Metade do caminho!';
    else msg = '🌱 Continue regando!';
    
    showNotification(`💧 Jardim regado! ${msg}`);
}

function updateRoseGrowth() {
    const el = document.getElementById('roseGrowth');
    const fill = document.getElementById('roseProgressFill');
    if (el) el.textContent = `${CONFIG.garden.roseGrowth}%`;
    if (fill) fill.style.width = `${CONFIG.garden.roseGrowth}%`;
}

function updateGardenStats() {
    const totalEl = document.getElementById('totalRoses');
    if (totalEl) totalEl.textContent = CONFIG.garden.totalRoses;
    
    const specialEl = document.getElementById('specialRoses');
    if (specialEl) specialEl.textContent = '1';
    
    const daysEl = document.getElementById('daysGrowing');
    if (daysEl && CONFIG.startDate) {
        const start = new Date(CONFIG.startDate);
        const days = Math.floor((new Date() - start) / (1000 * 60 * 60 * 24));
        daysEl.textContent = Math.max(0, days);
    }
}

window.initializeGarden = initializeGarden;

console.log('✅ Garden carregado');