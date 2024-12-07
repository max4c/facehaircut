from anthropic import Anthropic
import json
import os
import base64

def analyze_face(image_path):
    api_key = os.getenv('ANTHROPIC_API_KEY')
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY environment variable is not set")
        
    client = Anthropic(api_key=api_key)
    
    FACE_SHAPES = {
        "oval": "Longer than wide with prominent cheekbones",
        "round": "Equal width and length with soft angles", 
        "square": "Equal width and length with strong angles",
        "oblong": "Long face with straight cheek lines",
        "triangle": "Wider jaw than forehead",
        "diamond": "Wide cheekbones with narrow forehead and chin",
        "heart": "Wide forehead/cheekbones with narrow chin"
    }
    
    system_prompt = """You are a face shape analyzer. Only respond with one of these face shapes: 
    oval, round, square, oblong, triangle, diamond, or heart. 
    Return the result as a simple JSON object with a single "face_shape" key."""
    
    with open(image_path, 'rb') as img:
        response = client.messages.create(
            model="claude-3-haiku",
            max_tokens=1000,
            messages=[{
                "role": "user", 
                "content": [
                    {
                        "type": "text",
                        "text": system_prompt
                    },
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/jpeg",
                            "data": base64.b64encode(img.read()).decode()
                        }
                    }
                ]
            }]
        )
    
    try:
        result = json.loads(response.content[0].text)
        if result.get("face_shape") not in FACE_SHAPES:
            return {"error": "Invalid face shape detected"}
        return result
    except:
        return {"error": "Failed to analyze image"}