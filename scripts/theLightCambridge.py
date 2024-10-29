import json
import requests

rawdata = requests.get(
    "https://cambridge.thelight.co.uk/resource/services/miniguide/data.ashx"
)

result = rawdata.text


data = result[result.find("{") : result.rfind("}") + 1]
obj = json.loads(data)
result = json.dumps(obj)
print(result, flush=True)
