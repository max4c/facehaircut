import os
import json
import base64
from openai import OpenAI

def analyze_face(image_path):
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        raise ValueError("OPENAI_API_KEY environment variable is not set")
        
    client = OpenAI(api_key=api_key)
    
    FACE_SHAPES = {
        "oval": "Longer than wide with prominent cheekbones",
        "round": "Equal width and length with soft angles", 
        "square": "Equal width and length with strong angles",
        "oblong": "Long face with straight cheek lines",
        "triangle": "Wider jaw than forehead",
        "diamond": "Wide cheekbones with narrow forehead and chin",
        "heart": "Wide forehead/cheekbones with narrow chin"
    }
    
    system_prompt = """You are a face shape analyzer. Examine this face and classify it into exactly one of these categories:
    oval, round, square, oblong, triangle, diamond, or heart.
    
    Key characteristics:
    - Oval: Length about 1.5x width, smooth curves, no sharp angles
    - Round: Equal length and width, full cheeks, rounded jawline
    - Square: Equal length and width, strong jaw angles, broad forehead
    - Oblong: Face length > 1.5x width, long straight cheeks
    - Triangle: Wide jawline tapering to narrower forehead
    - Diamond: Pointed chin, wide cheekbones, narrow forehead
    - Heart: Wide forehead tapering to narrow chin
    
    Respond with ONLY the face shape word in lowercase. Example: 'oval' or 'square'"""

    # Read and encode image
    with open(image_path, 'rb') as img:
        base64_image = base64.b64encode(img.read()).decode('utf-8')
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a face shape classifier. Respond with only one word."
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": system_prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=10
        )
        
        print("Raw response:", response)
        
        if not response.choices or not response.choices[0].message.content:
            return {"error": "No response from model"}
            
        content = response.choices[0].message.content.lower().strip()
        print("Model output:", content)
        
        # Clean up the response to get just the face shape word
        content = ''.join(c for c in content if c.isalpha()).strip()
        
        # Validate that the response is one of our expected face shapes
        valid_shapes = set(FACE_SHAPES.keys())
        if content in valid_shapes:
            return {"face_shape": content}
            
        # If we got an invalid response, try to find the closest match
        for shape in valid_shapes:
            if shape in content:
                return {"face_shape": shape}
        
        # If still no match, return error
        return {"error": "Could not determine face shape"}
            
    except Exception as e:
        print("Error details:", str(e))
        return {"error": f"Failed to analyze image: {str(e)}"}