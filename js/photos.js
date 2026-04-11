// ===== SISTEMA DE FOTOS (CORRIGIDO - UMA ÚNICA FOTO POR UPLOAD) =====

let photosUnsubscribe = null;
let uploadLock = false; // Lock para prevenir múltiplos uploads

// Inicializar sistema de fotos
async function initializePhotoSystem() {
    cleanDuplicatePhotos();
    loadLocalPhotos();
    loadGallery();
    
    setTimeout(() => {
        if (typeof window.firebaseApp !== 'undefined' && window.firebaseApp.loadPhotos) {
            loadFirebasePhotos();
        }
    }, 1000);
}

// Limpar fotos duplicadas
function cleanDuplicatePhotos() {
    const seen = new Set();
    const uniquePhotos = [];
    
    CONFIG.photos.forEach(photo => {
        const key = photo.id || photo.firebaseId || photo.src;
        if (!seen.has(key)) {
            seen.add(key);
            uniquePhotos.push(photo);
        }
    });
    
    CONFIG.photos = uniquePhotos;
    console.log(`🧹 ${uniquePhotos.length} fotos únicas`);
}

// Carregar fotos locais
function loadLocalPhotos() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const localPhotos = JSON.parse(saved);
            const unsyncedPhotos = localPhotos.filter(p => p.syncStatus !== 'synced');
            
            unsyncedPhotos.forEach(photo => {
                const exists = CONFIG.photos.some(p => 
                    (p.id && p.id === photo.id) || 
                    (p.firebaseId && p.firebaseId === photo.firebaseId) ||
                    p.src === photo.src
                );
                if (!exists) {
                    CONFIG.photos.push({ ...photo, isLocal: true });
                }
            });
        }
    } catch (e) {
        console.error('Erro ao carregar fotos locais:', e);
    }
}

// Carregar fotos do Firestore
function loadFirebasePhotos() {
    if (!window.firebaseApp || !window.firebaseApp.loadPhotos) return;
    
    try {
        if (photosUnsubscribe && typeof photosUnsubscribe === 'function') {
            photosUnsubscribe();
        }
        
        photosUnsubscribe = window.firebaseApp.loadPhotos((firebasePhotos) => {
            AppState.firebasePhotosReady = true;
            
            const defaultPhotos = CONFIG.photos.filter(p => 
                !p.src.startsWith('data:') && !p.id && !p.firebaseId && !p.isLocal
            );
            
            const syncedPhotos = firebasePhotos.map(p => ({
                ...p,
                synced: true,
                isFromFirebase: true
            }));
            
            let localPhotos = [];
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) {
                    localPhotos = JSON.parse(saved)
                        .filter(p => p.syncStatus !== 'synced')
                        .map(p => ({ ...p, isLocal: true }));
                }
            } catch (e) {}
            
            const allPhotos = [...defaultPhotos];
            const seen = new Set();
            
            defaultPhotos.forEach(p => seen.add(p.id || p.firebaseId || p.src));
            
            syncedPhotos.forEach(photo => {
                const key = photo.id || photo.firebaseId || photo.src;
                if (!seen.has(key)) {
                    seen.add(key);
                    allPhotos.push(photo);
                }
            });
            
            localPhotos.forEach(photo => {
                const key = photo.id || photo.firebaseId || photo.src;
                if (!seen.has(key)) {
                    seen.add(key);
                    allPhotos.push(photo);
                }
            });
            
            CONFIG.photos = allPhotos;
            loadGallery();
            syncPendingPhotos();
        });
    } catch (error) {
        console.error('Erro ao carregar fotos do Firebase:', error);
    }
}

// Sincronizar fotos pendentes
async function syncPendingPhotos() {
    if (!AppState.firebasePhotosReady || !window.firebaseApp || !window.firebaseApp.savePhoto) return;
    
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return;
        
        const localPhotos = JSON.parse(saved);
        const pendingPhotos = localPhotos.filter(p => p.syncStatus === 'pending');
        
        for (const photo of pendingPhotos) {
            try {
                let compressedSrc = photo.src;
                if (photo.src.startsWith('data:') && photo.src.length > 500000) {
                    compressedSrc = await compressImage(photo.src, 800);
                }
                
                const result = await window.firebaseApp.savePhoto({
                    src: compressedSrc,
                    alt: photo.alt,
                    description: photo.description,
                    fallback: photo.fallback || '💖'
                });
                
                if (result.success) {
                    photo.syncStatus = 'synced';
                    photo.firebaseId = result.photoId;
                }
            } catch (error) {
                console.error('Erro ao sincronizar:', error);
            }
        }
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(localPhotos));
    } catch (error) {
        console.error('Erro na sincronização:', error);
    }
}

// Salvar UMA única foto (CORRIGIDO - FIREBASE APENAS UMA VEZ)
async function saveSinglePhoto(photoData) {
    try {
        const uniqueId = `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Verificar duplicata
        const exists = CONFIG.photos.some(p => p.src === photoData.src);
        if (exists) {
            showNotification('⚠️ Esta foto já foi adicionada');
            return false;
        }
        
        // Criar foto local
        const localPhoto = {
            ...photoData,
            id: uniqueId,
            syncStatus: 'pending',
            timestamp: Date.now(),
            isLocal: true
        };
        
        // Salvar no localStorage
        const saved = localStorage.getItem(STORAGE_KEY);
        let photos = saved ? JSON.parse(saved) : [];
        
        if (!photos.some(p => p.src === photoData.src)) {
            photos.push(localPhoto);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
        }
        
        // Adicionar à interface
        if (!CONFIG.photos.some(p => p.src === photoData.src)) {
            CONFIG.photos.push(localPhoto);
        }
        
        loadGallery();
        
        // SALVAR NO FIREBASE (APENAS UMA VEZ, COM CONTROLE DE LOCK)
        if (AppState.firebasePhotosReady && window.firebaseApp && window.firebaseApp.savePhoto) {
            // Usar lock para prevenir múltiplos envios
            if (!uploadLock) {
                uploadLock = true;
                
                try {
                    let compressedSrc = photoData.src;
                    if (photoData.src.startsWith('data:') && photoData.src.length > 500000) {
                        compressedSrc = await compressImage(photoData.src, 800);
                    }
                    
                    const result = await window.firebaseApp.savePhoto({
                        src: compressedSrc,
                        alt: photoData.alt,
                        description: photoData.description,
                        fallback: photoData.fallback
                    });
                    
                    if (result.success) {
                        const currentSaved = localStorage.getItem(STORAGE_KEY);
                        if (currentSaved) {
                            const currentPhotos = JSON.parse(currentSaved);
                            const photo = currentPhotos.find(p => p.id === uniqueId);
                            if (photo) {
                                photo.syncStatus = 'synced';
                                photo.firebaseId = result.photoId;
                                localStorage.setItem(STORAGE_KEY, JSON.stringify(currentPhotos));
                            }
                        }
                        console.log('✅ Foto sincronizada com Firebase');
                    }
                } catch (error) {
                    console.error('Erro ao salvar no Firebase:', error);
                } finally {
                    uploadLock = false;
                }
            }
        }
        
        return true;
        
    } catch (error) {
        console.error('Erro ao salvar foto:', error);
        showNotification('❌ Erro ao salvar foto');
        return false;
    }
}

// Deletar foto
async function deletePhoto(photoId, photoSrc, isFromFirebase) {
    if (!confirm('Tem certeza que deseja excluir esta foto?')) return;
    
    try {
        if (isFromFirebase && photoId && window.firebaseApp && window.firebaseApp.deletePhoto) {
            await window.firebaseApp.deletePhoto(photoId);
        }
        
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const photos = JSON.parse(saved);
            const filtered = photos.filter(p => p.src !== photoSrc && p.id !== photoId);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        }
        
        CONFIG.photos = CONFIG.photos.filter(p => 
            p.src !== photoSrc && p.id !== photoId && p.firebaseId !== photoId
        );
        
        loadGallery();
        showNotification('🗑️ Foto removida');
    } catch (error) {
        showNotification('❌ Erro ao deletar foto');
    }
}

// Carregar galeria
function loadGallery() {
    const grid = document.getElementById('photoGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    CONFIG.photos.forEach((photo) => {
        const item = document.createElement('div');
        item.className = 'photo-item';
        const src = photo.src;
        const isLocal = photo.isLocal || src?.startsWith('data:');
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

// Atualizar contador
function updatePhotoCount() {
    const el = document.getElementById('photoCount');
    if (el) {
        const t = CONFIG.photos.length;
        el.innerHTML = `${t} foto${t !== 1 ? 's' : ''}`;
    }
}

// Modal de foto
function openPhotoModal(src, alt, desc) {
    const existing = document.querySelector('.photo-modal');
    if (existing) existing.remove();
    
    const modal = document.createElement('div');
    modal.className = 'photo-modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <img src="${src}" alt="${alt}">
            <div class="modal-info">
                <h3>${alt}</h3>
                <p>${desc}</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.querySelector('.close-modal').onclick = () => modal.remove();
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
}

// Exportar fotos
function exportPhotos() {
    const toExport = CONFIG.photos.filter(p => p.isLocal || p.isFromFirebase);
    if (toExport.length === 0) {
        showNotification('📷 Nenhuma foto para exportar');
        return;
    }
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(toExport, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `galeria_${Date.now()}.json`;
    a.click();
    showNotification(`💾 ${toExport.length} foto(s) exportada(s)!`);
}

// Importar fotos
function importPhotos(file) {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            if (!Array.isArray(imported)) {
                showNotification('❌ Arquivo inválido');
                return;
            }
            
            let added = 0;
            imported.forEach(p => {
                if (!CONFIG.photos.some(x => x.src === p.src)) {
                    p.isLocal = true;
                    p.syncStatus = 'pending';
                    CONFIG.photos.push(p);
                    added++;
                }
            });
            
            if (added > 0) {
                loadGallery();
                showNotification(`✅ ${added} foto(s) importada(s)!`);
            } else {
                showNotification('📷 Nenhuma foto nova');
            }
        } catch (error) {
            showNotification('❌ Erro ao importar');
        }
    };
    reader.readAsDataURL(file);
}

// Limpar todas as fotos
function clearAllPhotos() {
    if (!confirm('Limpar TODAS as fotos? Esta ação não pode ser desfeita!')) return;
    
    localStorage.removeItem(STORAGE_KEY);
    CONFIG.photos = CONFIG.photos.filter(p => !p.isLocal && !p.isFromFirebase);
    loadGallery();
    showNotification('🗑️ Fotos locais removidas');
}

// Exportar para window
window.initializePhotoSystem = initializePhotoSystem;
window.loadGallery = loadGallery;
window.deletePhoto = deletePhoto;
window.exportPhotos = exportPhotos;
window.importPhotos = importPhotos;
window.clearAllPhotos = clearAllPhotos;
window.saveSinglePhoto = saveSinglePhoto;