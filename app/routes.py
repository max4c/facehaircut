from flask import Blueprint, render_template, request, jsonify, current_app
from app.utils.vision import analyze_face
from app.utils.image_handler import save_upload
import os

main = Blueprint('main', __name__)

@main.route('/')
def index():
    return render_template('index.html')

@main.route('/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    
    image = request.files['image']
    if not image.filename:
        return jsonify({'error': 'No selected file'}), 400
    
    try:
        image_path = save_upload(image)
        analysis = analyze_face(image_path)
        
        # Clean up the temporary file after analysis
        os.remove(image_path)
        
        return jsonify(analysis)
    except Exception as e:
        return jsonify({'error': str(e)}), 500 