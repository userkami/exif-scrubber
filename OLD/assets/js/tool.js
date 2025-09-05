// Tool processing functions
class ImageProcessor {
    constructor() {
        this.processedImages = [];
    }

    // Remove EXIF data from image
    removeEXIF(imageData) {
        try {
            // Remove EXIF data using piexifjs
            const zeroth = {};
            const exif = {};
            const gps = {};
            const first = {};
            
            const exifObj = {
                "0th": zeroth,
                "Exif": exif,
                "GPS": gps,
                "1st": first,
                "thumbnail": null
            };
            
            const exifBytes = piexif.dump(exifObj);
            return piexif.insert(exifBytes, imageData);
        } catch (error) {
            console.error("Error removing EXIF:", error);
            return imageData; // Return original if error
        }
    }

    // Resize image to specified dimensions
    async resizeImage(imageData, width, height) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Set canvas dimensions
                canvas.width = width;
                canvas.height = height;
                
                // Calculate aspect ratio and position
                const imgRatio = img.width / img.height;
                const canvasRatio = width / height;
                
                let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
                
                if (imgRatio > canvasRatio) {
                    // Image is wider than canvas - fit to height
                    drawHeight = height;
                    drawWidth = img.width * (height / img.height);
                    offsetX = (width - drawWidth) / 2;
                } else {
                    // Image is taller than canvas - fit to width
                    drawWidth = width;
                    drawHeight = img.height * (width / img.width);
                    offsetY = (height - drawHeight) / 2;
                }
                
                // Draw resized image
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
                
                resolve(canvas.toDataURL('image/jpeg', 0.85));
            };
            img.src = imageData;
        });
    }

    // Process a single image
    async processImage(file, options) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                try {
                    let imageData = e.target.result;
                    
                    // Remove EXIF if requested
                    if (options.removeMetadata) {
                        imageData = this.removeEXIF(imageData);
                    }
                    
                    // Resize if requested
                    if (options.resize && options.resize.width && options.resize.height) {
                        imageData = await this.resizeImage(imageData, options.resize.width, options.resize.height);
                    }
                    
                    resolve({
                        name: file.name,
                        data: imageData,
                        originalSize: file.size,
                        processedSize: Math.round(imageData.length * 0.75) // Approximation
                    });
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }

    // Process multiple images
    async processImages(files, options) {
        this.processedImages = [];
        
        const promises = Array.from(files).map(file => 
            this.processImage(file, options)
        );
        
        this.processedImages = await Promise.all(promises);
        return this.processedImages;
    }

    // Create download link for single image
    downloadImage(imageData, filename) {
        const link = document.createElement('a');
        link.href = imageData;
        link.download = filename.replace(/\.[^/.]+$/, "") + "_scrubbed.jpg";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Create ZIP of all processed images
    async downloadAsZip() {
        if (typeof JSZip === 'undefined') {
            alert('ZIP library not loaded. Please try downloading images individually.');
            return;
        }

        const zip = new JSZip();
        
        this.processedImages.forEach((image, index) => {
            // Convert data URL to binary
            const byteString = atob(image.data.split(',')[1]);
            const mimeString = image.data.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            
            zip.file(
                image.name.replace(/\.[^/.]+$/, "") + "_scrubbed.jpg",
                ab,
                { binary: true }
            );
        });
        
        const content = await zip.generateAsync({ type: "blob" });
        
        // Use FileSaver.js if available
        if (typeof saveAs !== 'undefined') {
            saveAs(content, "scrubbed_images.zip");
        } else {
            // Fallback download
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = "scrubbed_images.zip";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

// Initialize processor
const imageProcessor = new ImageProcessor();