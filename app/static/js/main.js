let imageFile = null;

// DOM Elements
const fileUpload = document.querySelector('.file-upload');
const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const analyzeBtn = document.getElementById('analyzeBtn');
const loadingSection = document.getElementById('loadingSection');
const resultsSection = document.getElementById('resultsSection');
const hairTextureSelect = document.getElementById('hairTextureSelect');

// Add this hairstyle mapping object
const HAIRSTYLE_RECOMMENDATIONS = {
    "oval": {
        "straight": ["Side Part with Taper Fade", "Mid Fade Clean", "Pompadour"],
        "wavy": ["Medium Length Styled", "Quiff", "Swept Back Medium"],
        "loose-curly": ["Volume Cut Curly", "Medium Length Layered", "Mid Fade Clean"],
        "tight-curly": ["Medium Afro", "High Fade Clean", "Natural Coils"]
    },
    "square": {
        "straight": ["Pompadour", "Mid Fade Clean", "Side Part with Taper Fade"],
        "wavy": ["Messy Natural", "Medium Length Layered", "Quiff"],
        "loose-curly": ["Volume Cut Curly", "Medium Length Layered", "Mid Fade Clean"],
        "tight-curly": ["Short Afro Fade", "Natural Coils", "High Fade Clean"]
    },
    "round": {
        "straight": ["High Fade Clean", "Angular Fringe", "Side Part with Taper Fade"],
        "wavy": ["Quiff", "Spiky Textured", "Mid Fade Clean"],
        "loose-curly": ["Volume Cut Curly", "High Fade Clean", "Medium Length Styled"],
        "tight-curly": ["High Fade Clean", "Medium Afro", "Short Afro Fade"]
    },
    "diamond": {
        "straight": ["Textured Fringe", "Medium Length Styled", "Mid Fade Clean"],
        "wavy": ["Messy Natural", "Medium Length Layered", "Swept Back Medium"],
        "loose-curly": ["Volume Cut Curly", "Medium Length Layered", "Mid Fade Clean"],
        "tight-curly": ["Medium Afro", "Natural Coils", "Short Afro Fade"]
    },
    "heart": {
        "straight": ["Medium Length Styled", "Side Swept Undercut", "French Crop"],
        "wavy": ["Messy Natural", "Medium Length Layered", "Mid Fade Clean"],
        "loose-curly": ["Medium Length Layered", "Volume Cut Curly", "Messy Natural"],
        "tight-curly": ["Medium Afro", "Natural Coils", "Mid Fade Clean"]
    },
    "oblong": {
        "straight": ["French Crop", "Low Fade", "Side Part with Taper Fade"],
        "wavy": ["French Crop", "Medium Length Styled", "Mid Fade Clean"],
        "loose-curly": ["Volume Cut Curly", "Medium Length Layered", "Low Fade"],
        "tight-curly": ["Short Afro Fade", "Natural Coils", "Low Fade"]
    }
};

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

    const hairType = document.getElementById('hairTextureSelect').value;
    if (!hairType) {
        alert('Please select your hair type');
        return;
    }

    // Update button state and show loading
    const analyzeBtn = document.getElementById('analyzeBtn');
    analyzeBtn.classList.add('loading');
    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = '<span class="icon">💈</span>Analyzing...';

    // Show loading animation
    const resultSection = document.getElementById('result-section');
    resultSection.innerHTML = '<div class="analyzing">Analyzing your photo...</div>';

    const formData = new FormData();
    formData.append('image', imageFile);

    try {
        const response = await fetch('/analyze', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        console.log("Response data:", data);  // Debug log
        
        if (data.error) {
            resultSection.innerHTML = `<div class="error">${data.error}</div>`;
            return;
        }

        const faceShape = data.face_shape;
        const hairType = document.getElementById('hairTextureSelect').value;
        
        console.log("Face shape:", faceShape);  // Debug log
        console.log("Hair type:", hairType);    // Debug log
        
        if (!HAIRSTYLE_RECOMMENDATIONS[faceShape] || !HAIRSTYLE_RECOMMENDATIONS[faceShape][hairType]) {
            resultSection.innerHTML = `<div class="error">No recommendations found for this combination</div>`;
            return;
        }

        const recommendations = HAIRSTYLE_RECOMMENDATIONS[faceShape][hairType];
        console.log("Recommendations:", recommendations);  // Debug log
        
        // Display results
        resultSection.innerHTML = `
            <div class="result-card">
                <div class="face-shape-section">
                    <h3>Your Face Shape: ${faceShape}</h3>
                </div>
                <div class="recommendations-section">
                    <h3>Recommended Haircuts for ${hairType} Hair</h3>
                    <div class="recommendations-grid">
                        ${recommendations.map(style => {
                            let filename = style.toLowerCase();
                            const filenameMap = {
                                'side part with taper fade': 'mid fade clean',
                                'medium length styled': 'medium length layered',
                                'swept back medium': 'slick back undercut',
                                'volume cut curly': 'natural coils',
                                'high fade clean': 'mid fade clean',
                                'short afro fade': 'medium afro fade',
                                'messy natural': 'medium length layered',
                                'angular fringe': 'quiff',
                                'spiky textured': 'quiff',
                                'textured fringe': 'quiff',
                                'side swept undercut': 'slick back undercut',
                                'french crop': 'quiff',
                                'pompadour': 'pompadour',
                                'mid fade clean': 'mid fade clean',
                                'medium afro': 'medium afro fade',
                                'natural coils': 'natural coils'
                            };

                            filename = filenameMap[filename] || filename.replace(/ /g, '-');

                            return `
                                <div class="recommendation-item">
                                    <div class="image-container">
                                        <img src="/static/js/images/hairstyles/${filename}.jpg" 
                                             alt="${style}" 
                                             class="style-image"
                                             onerror="this.src='/static/js/images/hairstyles/default.jpg'">
                                    </div>
                                    <h4>${style}</h4>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;

    } catch (error) {
        console.error('Error:', error);
        resultSection.innerHTML = '<div class="error">An error occurred. Please try again.</div>';
    } finally {
        analyzeBtn.classList.remove('loading');
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = '<span class="icon">💈</span>Show Me the Best Haircuts for Me!';
    }
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
                    <p> What length works best for your face shape?</p>
                    <p>💇‍♂️ Is a fade what you need to go from a mid 6 to a solid 8?</p>
                    <p>💫 Are you finally gonna have the hair to catch a Baddie?</p>
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
    // Redirect to Stripe payment page
    window.location.href = 'https://buy.stripe.com/28o2aSeQw5rL4M0144';
} 