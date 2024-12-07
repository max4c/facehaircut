let imageFile = null;

// DOM Elements
const fileUpload = document.querySelector('.file-upload');
const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const analyzeBtn = document.getElementById('analyzeBtn');
const loadingSection = document.getElementById('loadingSection');
const resultsSection = document.getElementById('resultsSection');
const hairTextureSelect = document.getElementById('hairTextureSelect');

document.addEventListener('DOMContentLoaded', function() {
    if (fileUpload) {
        // Prevent the click event from being handled twice
        imageInput.addEventListener('click', function(e) {
            e.stopPropagation();
        });

        // Add click event to the entire upload area
        fileUpload.addEventListener('click', function(e) {
            e.preventDefault();
            // Trigger the hidden file input click
            imageInput.click();
        });

        // Handle file selection
        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                handleImageFile(file);
            }
        });

        // Handle drag and drop
        fileUpload.addEventListener('dragover', function(e) {
            e.preventDefault();
            fileUpload.classList.add('dragover');
        });

        fileUpload.addEventListener('dragleave', function(e) {
            e.preventDefault();
            fileUpload.classList.remove('dragover');
        });

        fileUpload.addEventListener('drop', function(e) {
            e.preventDefault();
            fileUpload.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                handleImageFile(file);
            }
        });
    }
});

function handleImageFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
    }
    
    imageFile = file;
    const reader = new FileReader();
    
    reader.onload = (e) => {
        // Create preview container if it doesn't exist
        let previewContainer = document.querySelector('.preview-container');
        if (!previewContainer) {
            previewContainer = document.createElement('div');
            previewContainer.className = 'preview-container';
            fileUpload.appendChild(previewContainer);
        }

        // Update preview image
        imagePreview.src = e.target.result;
        imagePreview.hidden = false;
        
        // Update the "Choose File" text to show the file name
        const uploadText = fileUpload.querySelector('.upload-text');
        uploadText.textContent = file.name;
        
        // Add overlay
        let overlay = document.querySelector('.preview-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'preview-overlay';
            previewContainer.appendChild(overlay);
        }

        // Move image into container
        previewContainer.insertBefore(imagePreview, overlay);
        
        fileUpload.classList.add('has-image');
        analyzeBtn.disabled = false;
    };
    
    reader.readAsDataURL(file);
}

async function handleAnalysis() {
    if (!imageFile) {
        alert('Please select an image first');
        return;
    }

    try {
        loadingSection.hidden = false;
        analyzeBtn.disabled = true;
        resultsSection.hidden = true;

        const formData = new FormData();
        formData.append('image', imageFile);

        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const analysis = await response.json();
        if (analysis.error) throw new Error(analysis.error);

        displayResults(analysis);
    } catch (error) {
        alert(`Error: ${error.message}`);
    } finally {
        loadingSection.hidden = true;
        analyzeBtn.disabled = false;
    }
}

function displayResults(analysis) {
    document.getElementById('faceShape').textContent = `Face Shape: ${analysis.face_shape}`;
    document.getElementById('hairType').textContent = `Hair Type: ${analysis.hair_type}`;
    
    const recommendationsList = document.getElementById('recommendationsList');
    recommendationsList.innerHTML = analysis.recommendations
        .map(rec => `
            <div class="recommendation-card">
                <h3>${rec.style_name}</h3>
                <p>${rec.reason}</p>
            </div>
        `).join('');
    
    resultsSection.hidden = false;
} 