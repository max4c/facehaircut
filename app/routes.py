from flask import Blueprint, render_template, request, jsonify, current_app
from app.utils.vision import analyze_face
from app.utils.image_handler import ImageHandler
import os

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

@main.route('/analyze', methods=['POST'])
def analyze():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    image_file = request.files['image']
    if image_file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        # Save image locally with full path
        image_path = os.path.join(current_app.root_path, 'static', 'uploads', image_file.filename)
        os.makedirs(os.path.dirname(image_path), exist_ok=True)
        image_file.save(image_path)

        # Process image with vision model
        result = analyze_face(image_path)
        print("Analysis result:", result)  # Debug print
        
        # Clean up the uploaded file
        if os.path.exists(image_path):
            os.remove(image_path)
        
        if 'error' in result:
            return jsonify(result), 400
            
        # Get the face shape and return it
        face_shape = result.get('face_shape', '').lower()
        if not face_shape:
            return jsonify({'error': 'No face shape detected'}), 400
            
        return jsonify({
            'face_shape': face_shape,
            'success': True
        })

    except Exception as e:
        print("Error in analyze route:", str(e))  # Debug print
        return jsonify({'error': str(e)}), 500