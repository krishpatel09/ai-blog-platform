import json
import psycopg2
from google import genai
from pgvector.psycopg2 import register_vector

# 1. Setup New SDK (Corrected: No .configure, use Client)
client = genai.Client(api_key="AIzaSyDiWpemL2YWlUrvTGx8LJiKDrOW0gMILIs")
NEON_DB_URL ='postgresql://neondb_owner:npg_62pYTLZVXaPI@ep-empty-art-a4ofqasj-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require'

# 2. Connect to Neon
conn = psycopg2.connect(NEON_DB_URL)
cur = conn.cursor()
register_vector(conn)

print("Starting data load...")

# 3. Process JSON and Load
with open("tech_data.json", "r", encoding='utf-8') as f:
    for i, line in enumerate(f):
        if not line.strip(): continue
        data = json.loads(line)
        
        # Get Embedding from Gemini (New SDK Syntax)
        response = client.models.embed_content(
            model="text-embedding-004",
            contents=data['content'][:5000]
        )
        # The new SDK returns an object where values are in .embeddings[0].values
        vector = response.embeddings[0].values

        # Save to Neon
        cur.execute("""
            INSERT INTO "TechPost" (title, image, content, language, repository, embedding)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (data['title'], data['image'], data['content'], data['language'], data['repository'], vector))
        
        # Progress indicator every 10 rows
        if i % 10 == 0:
            print(f"Uploaded {i} rows...")
            conn.commit() # Commit periodically

conn.commit()
cur.close()
conn.close()
print("Success! Neon DB is loaded.")