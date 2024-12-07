from anthropic import Anthropic
import json
import os
import base64

def analyze_face(image_path):
    api_key = os.getenv('ANTHROPIC_API_KEY')
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY environment variable is not set")
        
    client = Anthropic(api_key=api_key)
    
    with open(image_path, 'rb') as img:
        response = client.messages.create(
            model="claude-3-haiku",
            max_tokens=1000,
            messages=[{
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/jpeg",
                            "data": base64.b64encode(img.read()).decode()
                        }
                    },
                    {
                        "type": "text",
                        "text": "Analyze the face in this image and return a JSON object with face shape, hair type, current length, and recommendations."
                    }
                ]
            }]
        )
    
    try:
        return json.loads(response.content[0].text)
    except:
        return {"error": "Failed to analyze image"} 