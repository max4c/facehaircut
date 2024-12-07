from flask import Blueprint, render_template, request, jsonify, current_app
from app.utils.vision import analyze_face
from app.utils.image_handler import ImageHandler

main = Blueprint('main', __name__)

# Initialize ImageHandler
image_handler = ImageHandler()

@main.route('/')
def index():
    return render_template('index.html')

@main.route('/upload', methods=['POST'])
def upload():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    image_file = request.files['image']
    if image_file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        # Save image locally
        image_path = image_handler.save_image(image_file)
        if not image_path:
            return jsonify({'error': 'Failed to save image'}), 500

        # Process image with vision model
        result = analyze_face(image_path)
        
        return jsonify({
            'success': True,
            'image_path': image_path,
            'result': result
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500 