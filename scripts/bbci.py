import requests
import json
import xmltodict

raw_data = requests.get("https://feeds.bbci.co.uk/news/england/cambridgeshire/rss.xml")
response = xmltodict.parse(raw_data.content)

bcci_json = []

for item in response["rss"]["channel"]["item"]:

    bcci_json.append(item)

print(bcci_json, flush=True)


with open("./newsJSON/bcci.json", "w") as outfile:
    json.dump(bcci_json, outfile)
    # print("dumping")
