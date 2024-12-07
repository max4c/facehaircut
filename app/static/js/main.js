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

    // Update button state and show loading
    const analyzeBtn = document.getElementById('analyzeBtn');
    analyzeBtn.classList.add('loading');
    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = '<span class="icon">💈</span>Analyzing...';

    // Hide the form
    document.querySelector('.analyzer-form').style.display = 'none';

    // Show loading animation
    const resultSection = document.getElementById('result-section');
    resultSection.innerHTML = '<div class="analyzing">Analyzing your photo...</div>';

    // Create a URL for the uploaded image
    const imageUrl = URL.createObjectURL(imageFile);

    // Wait 2 seconds then show paywall
    setTimeout(() => {
        showPaywall(imageUrl);
        // Reset button state
        analyzeBtn.classList.remove('loading');
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = '<span class="icon">💈</span>Show Me the Best Haircuts for Me!';
    }, 2000);
}

function displayResults(analysis) {
    const resultsSection = document.getElementById('resultsSection');
    
    // Populate results
    document.getElementById('faceShape').textContent = `Face Shape: ${analysis.face_shape}`;
    document.getElementById('hairType').textContent = `Hair Type: ${analysis.hair_type}`;
    
    const recommendationsList = document.getElementById('recommendationsList');
    recommendationsList.innerHTML = analysis.recommendations
        .map(rec => `
            <div class="recommendation-card">
                <img src="/static/images/hairstyles/${analysis.hair_type}/${rec.image}" 
                     alt="${rec.style_name}" 
                     class="recommendation-image">
                <div class="recommendation-content">
                    <h3>${rec.style_name}</h3>
                    <p>${rec.reason}</p>
                </div>
            </div>
        `).join('');
    
    // Show results with blur and overlay
    resultsSection.innerHTML = `
        <div class="results-card">
            <div class="blurred-section">
                <h2>Your Analysis Results</h2>
                <div id="faceShape" class="result-item"></div>
                <div id="hairType" class="result-item"></div>
                <div class="recommendations-grid">
                    ${recommendationsList.innerHTML}
                </div>
            </div>
            <div class="unlock-overlay">
                <h3>Your Results Are Ready!</h3>
                <p>Unlock your personalized haircut recommendations</p>
                <button class="unlock-button">Unlock Results</button>
            </div>
        </div>
    `;
    
    resultsSection.hidden = false;
    setTimeout(() => resultsSection.classList.add('visible'), 100);
}

function showPaywall(imageUrl) {
    const resultSection = document.getElementById('result-section');
    resultSection.innerHTML = `
        <div class="uploaded-image">
            <img src="${imageUrl}" alt="Uploaded photo" />
        </div>
        <div class="result-card">
            <div class="result-content blurred">
                <div class="face-shape-section">
                    <h3>Your Face Shape Analysis</h3>
                    <div class="analysis-details">
                        <p>Face Shape: Oval</p>
                        <p>Key Features: Balanced proportions</p>
                    </div>
                </div>
                
                <div class="recommendations-section">
                    <h3>Recommended Haircuts</h3>
                    <div class="recommendations-grid">
                        <div class="recommendation-item">
                            <div class="style-image"></div>
                            <h4>Classic Taper</h4>
                        </div>
                        <div class="recommendation-item">
                            <div class="style-image"></div>
                            <h4>Textured Crop</h4>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="paywall-overlay">
                <h3>Your Analysis is Ready!</h3>
                <div class="feature-questions">
                    <p>✨ What's your ideal haircut?</p>
                    <p>💇‍♂️ Which styles will enhance you from a mid 6 to a solid 8?</p>
                    <p>📏 What length works best for your face shape?</p>
                </div>
                <button class="unlock-button" onclick="handlePurchase()">
                    Unlock Your Personalized Results
                </button>
            </div>
        </div>
    `;
}

// Update the existing handleUpload function
async function handleUpload(event) {
    event.preventDefault();
    const fileInput = document.getElementById('image-upload');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Please select an image first');
        return;
    }

    // Show loading animation
    const resultSection = document.getElementById('result-section');
    resultSection.innerHTML = '<div class="analyzing">Analyzing your photo...</div>';

    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();

        if (data.success) {
            // Wait 2 seconds before showing paywall
            setTimeout(() => {
                showPaywall(data.image_path);
            }, 2000);
        } else {
            resultSection.innerHTML = `<div class="error">${data.error}</div>`;
        }
    } catch (error) {
        resultSection.innerHTML = '<div class="error">An error occurred. Please try again.</div>';
    }
}

function handlePurchase() {
    // Implement payment processing logic here
    console.log('Purchase button clicked');
} 