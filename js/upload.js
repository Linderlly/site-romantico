// ===== SISTEMA DE UPLOAD =====

function openUploadModal() {
    if (App.isUploading) { showNotification('⚠️ Aguarde...'); return; }
    document.getElementById('uploadModal')?.classList.add('active');
    setupImagePreview();
}

function closeUploadModal() {
    if (App.isUploading) return;
    document.getElementById('uploadModal')?.classList.remove('active');
    document.getElementById('uploadForm')?.reset();
    const preview = document.getElementById('imagePreview');
    if (preview) preview.innerHTML = '';
    document.getElementById('progressContainer').style.display = 'none';
}

function setupImagePreview() {
    const input = document.getElementById('imageInput');
    const preview = document.getElementById('imagePreview');
    const area = document.getElementById('uploadArea');
    if (!input || !preview || !area) return;
    
    const newInput = input.cloneNode(true);
    input.parentNode.replaceChild(newInput, input);
    const newArea = area.cloneNode(true);
    area.parentNode.replaceChild(newArea, area);
    
    const finalInput = document.getElementById('imageInput');
    const finalPreview = document.getElementById('imagePreview');
    const finalArea = document.getElementById('uploadArea');
    
    finalInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            if (file.size > MAX_IMAGE_SIZE) { showNotification('❌ Máximo 5MB'); finalInput.value = ''; return; }
            if (!file.type.startsWith('image/')) { showNotification('❌ Apenas imagens'); finalInput.value = ''; return; }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                finalPreview.innerHTML = `<img src="${e.target.result}" style="max-width:100%;max-height:200px;border-radius:10px;"><p style="margin-top:10px;">${file.name} (${(file.size/1024).toFixed(1)} KB)</p>`;
            };
            reader.readAsDataURL(file);
        }
    });
    
    finalArea.addEventListener('dragover', (e) => { e.preventDefault(); finalArea.style.borderColor = 'var(--hover-color)'; });
    finalArea.addEventListener('dragleave', (e) => { e.preventDefault(); finalArea.style.borderColor = 'var(--primary-color)'; });
    finalArea.addEventListener('drop', (e) => {
        e.preventDefault();
        finalArea.style.borderColor = 'var(--primary-color)';
        const file = e.dataTransfer.files[0];
        if (file) {
            if (file.size > MAX_IMAGE_SIZE) { showNotification('❌ Máximo 5MB'); return; }
            const dt = new DataTransfer(); dt.items.add(file);
            finalInput.files = dt.files;
            finalInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
}

async function processImageUpload() {
    const fileInput = document.getElementById('imageInput');
    const altInput = document.getElementById('imageAlt');
    const descInput = document.getElementById('imageDescription');
    const pc = document.getElementById('progressContainer');
    const pf = document.getElementById('uploadProgress');
    const pt = document.getElementById('progressText');
    
    const file = fileInput.files[0];
    if (!file) { showNotification('❌ Selecione uma imagem'); return null; }
    
    pc.style.display = 'block'; pf.style.width = '0%';
    
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadstart = () => { pf.style.width = '10%'; pt.textContent = 'Lendo...'; };
        reader.onprogress = (e) => { if (e.lengthComputable) { const p = Math.round((e.loaded/e.total)*90); pf.style.width = p+'%'; pt.textContent = `Processando... ${p}%`; } };
        reader.onload = (e) => {
            pf.style.width = '100%'; pt.textContent = 'Pronto!';
            resolve({ src: e.target.result, alt: altInput.value || 'Momento especial', description: descInput.value || 'Um momento inesquecível', fallback: '💖', timestamp: Date.now() });
        };
        reader.readAsDataURL(file);
    });
}

async function saveSinglePhoto(photoData) {
    const uniqueId = `photo_${Date.now()}_${Math.random().toString(36).substr(2,9)}`;
    if (CONFIG.photos.some(p => p.src === photoData.src)) { showNotification('⚠️ Foto já existe'); return false; }
    
    const localPhoto = { ...photoData, id: uniqueId, syncStatus: 'pending', timestamp: Date.now(), isLocal: true };
    
    const saved = localStorage.getItem(STORAGE_KEY);
    const photos = saved ? JSON.parse(saved) : [];
    if (!photos.some(p => p.src === photoData.src)) {
        photos.push(localPhoto);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
    }
    
    if (!CONFIG.photos.some(p => p.src === photoData.src)) CONFIG.photos.push(localPhoto);
    loadGallery();
    
    if (App.firebasePhotosReady && window.firebaseApp?.savePhoto && !App.uploadLock) {
        App.uploadLock = true;
        try {
            let compressed = photoData.src;
            if (photoData.src.length > 500000) compressed = await compressImage(photoData.src, 800);
            const result = await window.firebaseApp.savePhoto({ src: compressed, alt: photoData.alt, description: photoData.description, fallback: photoData.fallback });
            if (result.success) {
                const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
                const p = current.find(x => x.id === uniqueId);
                if (p) { p.syncStatus = 'synced'; p.firebaseId = result.photoId; localStorage.setItem(STORAGE_KEY, JSON.stringify(current)); }
            }
        } catch (e) { console.error('Erro Firebase:', e); }
        finally { App.uploadLock = false; }
    }
    return true;
}

function setupUploadForm() {
    const form = document.getElementById('uploadForm');
    if (!form) return;
    
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    let submitting = false;
    newForm.addEventListener('submit', async (e) => {
        e.preventDefault(); e.stopPropagation();
        if (submitting || App.isUploading) return false;
        if (!document.getElementById('imageInput').files[0]) { showNotification('❌ Selecione uma imagem'); return false; }
        
        submitting = true; App.isUploading = true;
        const btn = document.getElementById('uploadBtn');
        btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        
        try {
            const photoData = await processImageUpload();
            if (photoData && await saveSinglePhoto(photoData)) {
                closeUploadModal(); newForm.reset();
                document.getElementById('imagePreview').innerHTML = '';
                createHeartExplosion(); showNotification('✅ Foto adicionada!');
            }
        } catch (e) { showNotification('❌ Erro'); }
        finally {
            submitting = false; App.isUploading = false;
            btn.disabled = false; btn.innerHTML = '<i class="fas fa-upload"></i> Enviar Foto';
            document.getElementById('progressContainer').style.display = 'none';
        }
        return false;
    });
}

console.log('✅ Upload carregado');