import urllib.request
import json

project_id = "business-pro-d657d"
api_key = "AIzaSyDH1sF1FEasvvisSp-B8m2ETk2N5L4rZq8"

def query_collection(collection):
    url = f"https://firestore.googleapis.com/v1/projects/{project_id}/databases/(default)/documents/{collection}?key={api_key}"
    try:
        with urllib.request.urlopen(url) as response:
            return json.loads(response.read().decode())
    except Exception as e:
        return {"error": str(e)}

print(json.dumps(query_collection("stockRequests"), indent=2))
