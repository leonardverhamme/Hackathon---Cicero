import weaviate
from dotenv import load_dotenv
import os
from pypdf2 import PdfReader  # Assuming pypdf2 is installed, or use fitz/pymupdf

load_dotenv()

# Connect to Weaviate
client = weaviate.Client(
    url=os.getenv("WEAVIATE_URL"),
    auth_client_secret=weaviate.AuthApiKey(os.getenv("WEAVIATE_API_KEY"))
)

# Define schema if not exists
schema = {
    "class": "AI_Act_Article",
    "vectorizer": "text2vec-openai",
    "properties": [
        {"name": "content", "dataType": ["text"]},
        {"name": "title", "dataType": ["string"]},
        {"name": "article_number", "dataType": ["string"]}
    ]
}

# Create class
client.schema.create_class(schema)

# Load PDF
pdf_path = "../docs/AI_Act.pdf"
reader = PdfReader(pdf_path)

# Ingest articles
for page in reader.pages:
    text = page.extract_text()
    # Assuming text is structured, split into articles
    # This is simplified; in reality, parse properly
    articles = text.split("Article ")
    for article in articles[1:]:  # Skip first empty
        article_num = article.split()[0]
        content = article
        client.data_object.create({
            "content": content,
            "title": f"Article {article_num}",
            "article_number": article_num
        }, "AI_Act_Article")

print("Ingestion complete.")
