// tool.js – EXIF Scrubber core
// Requires: piexifjs (already included in tool.html via CDN)

(function () {
  const fileInput = document.getElementById("file-input");
  const output = document.getElementById("output");
  const clearBtn = document.getElementById("clear-btn");
  const downloadAllBtn = document.getElementById("download-all-btn");

  let cleanedFiles = [];

  // Utility: create a download link for cleaned files
  function createDownloadLink(name, blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.textContent = `Download ${name}`;
    a.className =
      "block px-4 py-2 my-2 bg-green-600 text-white rounded hover:bg-green-700";
    return a;
  }

  // Remove EXIF using piexifjs
  function removeExifFromImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = function (e) {
        try {
          let dataUrl = e.target.result;

          // Only process JPEGs with EXIF
          if (file.type === "image/jpeg") {
            let stripped = piexif.remove(dataUrl);
            let byteString = atob(stripped.split(",")[1]);
            let buffer = new Uint8Array(byteString.length);

            for (let i = 0; i < byteString.length; i++) {
              buffer[i] = byteString.charCodeAt(i);
            }

            let blob = new Blob([buffer], { type: "image/jpeg" });
            resolve(blob);
          } else {
            // Non-JPEG (PNG, WEBP, etc) → just return as-is
            resolve(new Blob([e.target.result], { type: file.type }));
          }
        } catch (err) {
          reject(err);
        }
      };

      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  // Handle file selection
  fileInput.addEventListener("change", async function () {
    output.innerHTML = "";
    cleanedFiles = [];

    const files = Array.from(fileInput.files);
    if (files.length === 0) return;

    for (let file of files) {
      try {
        const cleanedBlob = await removeExifFromImage(file);
        cleanedFiles.push({ name: file.name, blob: cleanedBlob });

        const link = createDownloadLink(file.name, cleanedBlob);
        output.appendChild(link);
      } catch (err) {
        const errorMsg = document.createElement("p");
        errorMsg.textContent = `Failed to clean ${file.name}: ${err.message}`;
        errorMsg.className = "text-red-600";
        output.appendChild(errorMsg);
      }
    }

    if (cleanedFiles.length > 1) {
      downloadAllBtn.classList.remove("hidden");
    }
  });

  // Clear output
  clearBtn.addEventListener("click", function () {
    output.innerHTML = "";
    cleanedFiles = [];
    fileInput.value = "";
    downloadAllBtn.classList.add("hidden");
  });

  // Download all as ZIP
  downloadAllBtn.addEventListener("click", async function () {
    if (cleanedFiles.length === 0) return;

    const zip = new JSZip();

    cleanedFiles.forEach((f) => {
      zip.file(f.name, f.blob);
    });

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);

    const a = document.createElement("a");
    a.href = url;
    a.download = "cleaned_images.zip";
    a.click();
  });
})();
