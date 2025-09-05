// Minimal client-side logic: read files, remove EXIF metadata by re-encoding images via canvas where possible.
// Note: This is a lightweight approach. For HEIC, WEBP, or special cases we fallback to a binary-stripping approach where possible.


(function(){
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const stripBtn = document.getElementById('stripBtn');
const resizeBtn = document.getElementById('resizeBtn');
const downloadAllBtn = document.getElementById('downloadAllBtn');


let files = [];
let cleanedBlobs = [];


fileInput.addEventListener('change', e => {
files = Array.from(e.target.files || []);
renderFileList();
});


function renderFileList(){
fileList.innerHTML = '';
cleanedBlobs = [];
files.forEach((f, idx) => {
const el = document.createElement('div');
el.className = 'file-item';
el.innerHTML = `<div><strong>${escapeHtml(f.name)}</strong><br><small>${Math.round(f.size/1024)} KB — ${f.type || 'unknown'}</small></div><div><button data-idx="${idx}" class="single-strip">Strip</button></div>`;
fileList.appendChild(el);
});
}


fileList.addEventListener('click', async (e) => {
if(e.target.matches('.single-strip')){
const idx = Number(e.target.dataset.idx);
const f = files[idx];
e.target.disabled = true;
const blob = await stripExif(f);
cleanedBlobs[idx] = {name: f.name, blob};
e.target.textContent = 'Done';
}
});


stripBtn.addEventListener('click', async ()=>{
if(!files.length) return alert('Select files first');
stripBtn.disabled = true; stripBtn.textContent = 'Processing...';
for(let i=0;i<files.length;i++){
const f = files[i];
const blob = await stripExif(f);
cleanedBlobs[i] = {name: f.name, blob};
}
stripBtn.textContent = 'Strip EXIF'; stripBtn.disabled = false;
alert('All files processed — you can download them individually or use ZIP download.');
});


downloadAllBtn.addEventListener('click', async ()=>{
// create zip in memory using JSZip if available, else download individually
if(cleanedBlobs.length === 0){
alert('No processed files available. Use "Strip EXIF" first.');
return;
}


function loadImageF