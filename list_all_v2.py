import urllib.request
import json

project_id = "business-pro-d657d"
api_key = "AIzaSyDH1sF1FEasvvisSp-B8m2ETk2N5L4rZq8"

def list_docs(collection):
    url = f"https://firestore.googleapis.com/v1/projects/{project_id}/databases/(default)/documents/{collection}?key={api_key}"
    try:
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode())
            if "documents" in data:
                print(f"--- {collection} ---")
                for doc in data["documents"]:
                    print(json.dumps(doc, indent=2))
    except:
        pass

collections = ["users", "products", "sales", "stockRequests", "messages", "admin", "secrets", "flags", "configs"]
for c in collections:
    list_docs(c)
