1. Workflow A: Direct "Live" Generation
   Goal: Convert a single image into a blog post instantly without long-term memory.

# The Process

a.User Action: Uploads an image (e.g., via Cloudinary or ImageKit).
b.Vision Processing: The AiService sends the image URL/Base64 to Gemini 2.0 Flash.
c.Internal Tokenization: The AI model automatically patches the image and converts it into temporary visual tokens.
d.Content Generation: The AI uses these tokens to write the blog post based on your prompt.
e.Storage: The resulting HTML/Markdown is saved in a standard PostgreSQL table.
