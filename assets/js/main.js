document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const browseBtn = document.getElementById('browse-btn');
    const processingOptions = document.getElementById('processing-options');
    const resizePreset = document.getElementById('resize-preset');
    const customSize = document.getElementById('custom-size');
    const customWidth = document.getElementById('custom-width');
    const customHeight = document.getElementById('custom-height');
    const qualitySlider = document.getElementById('quality');
    const qualityValue = document.getElementById('quality-value');
    const processBtn = document.getElementById('process-btn');
    const imagePreview = document.getElementById('image-preview');
    const previewList = document.getElementById('preview-list');
    const downloadAllBtn = document.getElementById('download-all');
    const resetBtn = document.getElementById('reset-btn');
    const removeMetadata = document.getElementById('remove-metadata');

    // Event Listeners
    browseBtn.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', handleFiles);
    
    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.classList.add('dragover');
    });
    
    dropArea.addEventListener('dragleave', () => {
        dropArea.classList.remove('dragover');
    });
    
    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        handleFiles({ target: { files } });
    });
    
    resizePreset.addEventListener('change', toggleCustomSize);
    
    qualitySlider.addEventListener('input', () => {
        qualityValue.textContent = `${qualitySlider.value}%`;
    });
    
    processBtn.addEventListener('click', processImages);
    
    downloadAllBtn.addEventListener('click', () => {
        imageProcessor.downloadAsZip();
    });
    
    resetBtn.addEventListener('click', resetTool);

    // Functions
    function handleFiles(e) {
        const files = e.target.files;
        if (files.length > 0) {
            processingOptions.classList.remove('hidden');
            dropArea.classList.add('hidden');
        }
    }
    
    function toggleCustomSize() {
        if (resizePreset.value === 'custom') {
            customSize.classList.remove('hidden');
        } else {
            customSize.classList.add('hidden');
        }
    }
    
    function getResizeDimensions() {
        const preset = resizePreset.value;
        const presets = {
            'instagram-post': { width: 1080, height: 1080 },
            'instagram-story': { width: 1080, height: 1920 },
            'facebook': { width: 1200, height: 630 },
            'twitter': { width: 1200, height: 675 },
            'tiktok': { width: 1080, height: 1920 },
            'linkedin': { width: 1200, height: 627 }
        };
        
        if (preset === 'custom') {
            return {
                width: parseInt(customWidth.value) || 1080,
                height: parseInt(customHeight.value) || 1080
            };
        }
        
        return presets[preset] || null;
    }
    
    async function processImages() {
        const files = fileInput.files;
        if (files.length === 0) {
            alert('Please select images to process');
            return;
        }
        
        // Show processing state
        processBtn.textContent = 'Processing...';
        processBtn.disabled = true;
        
        try {
            const options = {
                removeMetadata: removeMetadata.checked,
                resize: getResizeDimensions(),
                quality: qualitySlider.value / 100
            };
            
            const processedImages = await imageProcessor.processImages(files, options);
            displayProcessedImages(processedImages);
            
            // Show results
            processingOptions.classList.add('hidden');
            imagePreview.classList.remove('hidden');
        } catch (error) {
            console.error('Processing error:', error);
            alert('An error occurred while processing images. Please try again.');
        } finally {
            processBtn.textContent = 'Process Images';
            processBtn.disabled = false;
        }
    }
    
    function displayProcessedImages(images) {
        previewList.innerHTML = '';
        
        images.forEach((image, index) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            
            const img = document.createElement('img');
            img.src = image.data;
            img.alt = image.name;
            img.className = 'preview-thumb';
            
            const infoDiv = document.createElement('div');
            infoDiv.className = 'preview-info';
            
            const title = document.createElement('h3');
            title.textContent = image.name.replace(/\.[^/.]+$/, "") + "_scrubbed.jpg";
            
            const details = document.createElement('p');
            details.textContent = `Original: ${(image.originalSize / 1024).toFixed(1)} KB → Processed: ${(image.processedSize / 1024).toFixed(1)} KB`;
            
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'preview-actions';
            
            const downloadBtn = document.createElement('button');
            downloadBtn.className = 'btn-secondary';
            downloadBtn.textContent = 'Download';
            downloadBtn.addEventListener('click', () => {
                imageProcessor.downloadImage(image.data, image.name);
            });
            
            actionsDiv.appendChild(downloadBtn);
            
            infoDiv.appendChild(title);
            infoDiv.appendChild(details);
            infoDiv.appendChild(actionsDiv);
            
            previewItem.appendChild(img);
            previewItem.appendChild(infoDiv);
            
            previewList.appendChild(previewItem);
        });
    }
    
    function resetTool() {
        // Reset file input
        fileInput.value = '';
        
        // Reset UI
        processingOptions.classList.add('hidden');
        imagePreview.classList.add('hidden');
        dropArea.classList.remove('hidden');
        
        // Reset options
        removeMetadata.checked = true;
        resizePreset.value = 'none';
        customSize.classList.add('hidden');
        qualitySlider.value = 85;
        qualityValue.textContent = '85%';
    }
});