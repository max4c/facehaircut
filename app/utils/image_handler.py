import os
from werkzeug.utils import secure_filename
from datetime import datetime

class ImageHandler:
    def __init__(self, upload_folder='app/static/uploads'):
        self.upload_folder = upload_folder
        # Create uploads directory if it doesn't exist
        os.makedirs(upload_folder, exist_ok=True)

    def save_image(self, image_file):
        """Save uploaded image to local storage"""
        if image_file:
            # Create unique filename using timestamp
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"{timestamp}_{secure_filename(image_file.filename)}"
            
            # Save file to uploads folder
            file_path = os.path.join(self.upload_folder, filename)
            image_file.save(file_path)
            
            # Return relative path for serving the image
            return f'/static/uploads/{filename}'
        return None

    def delete_image(self, image_path):
        """Delete image from local storage"""
        if image_path:
            # Convert URL path to filesystem path
            file_path = os.path.join('app', image_path.lstrip('/'))
            if os.path.exists(file_path):
                os.remove(file_path) 