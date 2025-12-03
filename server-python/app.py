from flask import Flask, request, jsonify
from rembg import remove
from PIL import Image, ImageEnhance, ImageFilter
import io
import base64
from flask_cors import CORS
import numpy as np
from scipy import ndimage
from scipy.ndimage import gaussian_filter

app = Flask(__name__)
CORS(app) # Enable CORS for frontend communication

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "Python background removal API is running."}), 200

@app.route('/api/bg/remove', methods=['POST'])
def remove_background_api():
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({"success": False, "error": "No image data provided"}), 400

    image_data_b64 = data['image'].split(',')[1] # Remove data:image/png;base64, prefix
    image_bytes = base64.b64decode(image_data_b64)

    try:
        input_image = Image.open(io.BytesIO(image_bytes))
        output_image = remove(input_image) # AI background removal
        
        buffered = io.BytesIO()
        output_image.save(buffered, format="PNG")
        output_b64 = base64.b64encode(buffered.getvalue()).decode('utf-8')

        return jsonify({"success": True, "result": f"data:image/png;base64,{output_b64}"}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/bg/preview', methods=['POST'])
def preview_background_removal_api():
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({"success": False, "error": "No image data provided"}), 400

    image_data_b64 = data['image'].split(',')[1]
    image_bytes = base64.b64decode(image_data_b64)

    try:
        input_image = Image.open(io.BytesIO(image_bytes))
        
        # Resize for faster preview
        max_size = 800
        if input_image.width > max_size or input_image.height > max_size:
            input_image.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)

        output_image = remove(input_image)
        
        buffered = io.BytesIO()
        output_image.save(buffered, format="PNG")
        output_b64 = base64.b64encode(buffered.getvalue()).decode('utf-8')

        return jsonify({"success": True, "result": f"data:image/png;base64,{output_b64}"}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/sharpen/enhance', methods=['POST'])
def sharpen_enhance_api():
    """Basit ve etkili netleştirme ve 4K upscaling"""
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({"success": False, "error": "No image data provided"}), 400

    image_data_b64 = data['image'].split(',')[1] if ',' in data['image'] else data['image']
    image_bytes = base64.b64decode(image_data_b64)

    try:
        # Görseli aç
        input_image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        orig_width, orig_height = input_image.size
        
        # 4K hedef boyutları
        TARGET_WIDTH = 3840
        TARGET_HEIGHT = 2160
        
        # Aspect ratio'yu koru
        ratio = min(TARGET_WIDTH / orig_width, TARGET_HEIGHT / orig_height)
        new_width = int(orig_width * ratio)
        new_height = int(orig_height * ratio)
        
        # Upscale (LANCZOS - yüksek kalite)
        upscaled_image = input_image.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # 4K canvas oluştur ve siyah arka planla ortalama
        final_image = Image.new('RGB', (TARGET_WIDTH, TARGET_HEIGHT), 'black')
        paste_x = (TARGET_WIDTH - new_width) // 2
        paste_y = (TARGET_HEIGHT - new_height) // 2
        final_image.paste(upscaled_image, (paste_x, paste_y))
        
        # Unsharp mask kernel ile netleştirme
        from PIL import ImageFilter
        
        # Unsharp mask filter (PIL built-in)
        sharpened_image = final_image.filter(ImageFilter.UnsharpMask(radius=1, percent=150, threshold=3))
        
        # JPEG olarak kaydet (yüksek kalite)
        buffered = io.BytesIO()
        sharpened_image.save(buffered, format="JPEG", quality=95)
        output_b64 = base64.b64encode(buffered.getvalue()).decode('utf-8')

        return jsonify({"success": True, "result": f"data:image/jpeg;base64,{output_b64}"}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/sharpen/preview', methods=['POST'])
def sharpen_preview_api():
    """Preview için hızlı netleştirme - DÜZELTİLMİŞ"""
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({"success": False, "error": "No image data provided"}), 400

    image_data_b64 = data['image'].split(',')[1] if ',' in data['image'] else data['image']
    image_bytes = base64.b64decode(image_data_b64)

    try:
        # RGB'ye çevir (alpha channel sorununu önle)
        input_image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        
        # Preview için küçült
        max_size = 800
        if input_image.width > max_size or input_image.height > max_size:
            input_image.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
        
        # Hızlı sharpening
        img_array = np.array(input_image)
        blurred = gaussian_filter(img_array, sigma=1.0, mode='reflect')
        sharpened = img_array + (img_array - blurred) * 1.5
        sharpened = np.clip(sharpened, 0, 255).astype(np.uint8)
        
        sharpened_image = Image.fromarray(sharpened)
        enhancer = ImageEnhance.Sharpness(sharpened_image)
        sharpened_image = enhancer.enhance(1.2)
        
        # JPEG olarak kaydet (transparent sorununu önler)
        buffered = io.BytesIO()
        sharpened_image.save(buffered, format="JPEG", quality=92)
        output_b64 = base64.b64encode(buffered.getvalue()).decode('utf-8')

        return jsonify({"success": True, "result": f"data:image/jpeg;base64,{output_b64}"}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=3002, debug=True)
