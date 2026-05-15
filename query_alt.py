import urllib.request
import json

project_id = "business-pro-d657d"
api_key = "AIzaSyCTGerTTgr2cstlGCVuzSvU6utQsdvDZVg"

def query_collection(collection):
    url = f"https://firestore.googleapis.com/v1/projects/{project_id}/databases/(default)/documents/{collection}?key={api_key}"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode())
    except Exception as e:
        return {"error": str(e)}

collections = ["flags", "secrets", "admin", "users"]
for col in collections:
    print(f"--- {col} ---")
    print(json.dumps(query_collection(col), indent=2))
