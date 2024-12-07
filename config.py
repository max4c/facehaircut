import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-key-change-in-prod'
    ANTHROPIC_API_KEY = os.environ.get('ANTHROPIC_API_KEY')
    UPLOAD_FOLDER = 'app/static/uploads' 