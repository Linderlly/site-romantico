// ===== SISTEMA DE GALERIA DE FOTOS =====

function loadGallery() {
    const grid = document.getElementById('photoGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    CONFIG.photos.forEach((photo) => {
        const item = document.createElement('div');
        item.className = 'photo-item';
        const src = photo.src;
        const isLocal = photo.isLocal || (src && src.startsWith('data:'));
        const isFB = photo.isFromFirebase;
        const pid = photo.id || photo.firebaseId;
        
        item.innerHTML = `
            <div class="image-container">
                <img src="${src}" alt="${photo.alt}" class="gallery-image" loading="lazy" onerror="handleImageError(this,'${photo.fallback||'💖'}')">
                <div class="image-fallback" style="display:none;">${photo.fallback||'💕'} ${photo.alt}</div>
            </div>
            ${(isLocal || isFB) ? `<button class="photo-delete-btn" onclick="deletePhoto('${pid||''}','${src?.replace(/'/g,"\\'")||''}',${isFB||false})"><i class="fas fa-trash"></i></button>` : ''}
            <div class="photo-overlay">
                <p class="photo-description">${photo.description}</p>
                ${isLocal && photo.syncStatus !== 'synced' ? '<span style="font-size:0.7rem;">📱 Local</span>' : ''}
                ${isFB ? '<span style="font-size:0.7rem;">☁️ Nuvem</span>' : ''}
            </div>
        `;
        
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.photo-delete-btn')) {
                openPhotoModal(src, photo.alt, photo.description);
            }
        });
        
        grid.appendChild(item);
    });
    
    updatePhotoCount();
}

function updatePhotoCount() {
    const el = document.getElementById('photoCount');
    if (el) el.innerHTML = `${CONFIG.photos.length} foto${CONFIG.photos.length !== 1 ? 's' : ''}`;
}

function openPhotoModal(src, alt, desc) {
    document.querySelector('.photo-modal')?.remove();
    
    const modal = document.createElement('div');
    modal.className = 'photo-modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <img src="${src}" alt="${alt}">
            <div class="modal-info"><h3>${alt}</h3><p>${desc}</p></div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('.close-modal').onclick = () => modal.remove();
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
}

async function deletePhoto(photoId, photoSrc, isFromFirebase) {
    if (!confirm('Excluir esta foto?')) return;
    
    try {
        if (isFromFirebase && photoId && window.firebaseApp?.deletePhoto) {
            await window.firebaseApp.deletePhoto(photoId);
        }
        
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const photos = JSON.parse(saved);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(photos.filter(p => p.src !== photoSrc && p.id !== photoId)));
        }
        
        CONFIG.photos = CONFIG.photos.filter(p => p.src !== photoSrc && p.id !== photoId && p.firebaseId !== photoId);
        loadGallery();
        showNotification('🗑️ Foto removida');
    } catch (e) {
        showNotification('❌ Erro ao deletar');
    }
}

function exportPhotos() {
    const toExport = CONFIG.photos.filter(p => p.isLocal || p.isFromFirebase);
    if (!toExport.length) { showNotification('📷 Nenhuma foto'); return; }
    
    const data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(toExport));
    const a = document.createElement('a');
    a.href = data; a.download = `galeria_${Date.now()}.json`; a.click();
    showNotification(`💾 ${toExport.length} foto(s) exportada(s)!`);
}

function importPhotos(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            if (!Array.isArray(imported)) return showNotification('❌ Arquivo inválido');
            
            let added = 0;
            imported.forEach(p => {
                if (!CONFIG.photos.some(x => x.src === p.src)) {
                    p.isLocal = true; p.syncStatus = 'pending';
                    CONFIG.photos.push(p); added++;
                }
            });
            
            if (added) { loadGallery(); showNotification(`✅ ${added} foto(s) importada(s)!`); }
            else showNotification('📷 Nenhuma foto nova');
        } catch (e) { showNotification('❌ Erro ao importar'); }
    };
    reader.readAsDataURL(file);
}

window.loadGallery = loadGallery;
window.deletePhoto = deletePhoto;
window.exportPhotos = exportPhotos;
window.importPhotos = importPhotos;

console.log('✅ Gallery carregado');