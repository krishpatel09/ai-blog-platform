from datasets import load_dataset
from huggingface_hub import login
import json

# 1. Login
login("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")

# 2. Load Dataset (Streaming is efficient for large datasets)
ds = load_dataset(
    "bigcode/the-stack", 
    data_dir="data/python", 
    split="train", 
    streaming=True
)

# 3. Save with specific fields including Title and Image
with open("tech_data.json", "w", encoding='utf-8') as f:
    for i, example in enumerate(ds.take(1000)):
        
        # Use a dynamic tech image from Unsplash based on the index
        # This gives each post a different professional tech look
        image_url = f"https://picsum.photos/seed/{i}/800/600" 
        
        clean_data = {
            "id": i,
            "title": f"Deep Dive into Python Code: Sample #{i+1}", 
            "image": image_url,
            "content": example["content"],
            "language": "python",
            "repository": example.get("max_stars_repo_name", "unknown")
        }
        
        json.dump(clean_data, f)
        f.write('\n')
        
        if (i + 1) % 100 == 0:
            print(f"Progress: {i + 1}/1000 files saved.")

print("Download complete! File saved with images at: D:/github/ai-blog-platform/tech_data.json")