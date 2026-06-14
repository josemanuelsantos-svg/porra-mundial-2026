import json
import os

filepath = "/Users/jose/.gemini/antigravity/scratch/porra-mundial/data.js"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

start_idx = content.find("const PREDICTIONS = ")
json_str = content[start_idx + len("const PREDICTIONS = "):].strip()
if json_str.endswith(";"):
    json_str = json_str[:-1]

preds = json.loads(json_str)
l_pred = preds.get("Luismi", {})
matches = l_pred.get("groupMatches", {})

print("groupMatches type:", type(matches))
print("groupMatches keys count:", len(matches))
print("Sample keys:", list(matches.keys())[:5])
print("Sample match value (key '1'):", matches.get("1"))
