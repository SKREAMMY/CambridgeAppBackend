import json
import xmltodict
import requests

response = requests.get("https://www.cambridge-news.co.uk/?service=rss")
dict = xmltodict.parse(response.content)

# print(dict)
cambridge_dict = {"data": []}

# print("length is  ", len(dict))

for item in dict["rss"]["channel"]["item"]:
    item["mediaThumbnail"] = item["media:thumbnail"]
    item["mediaKeywords"] = item["media:keywords"]
    item["mediaThumbnail"]["url"] = item["mediaThumbnail"]["@url"]
    item.pop("media:keywords")
    item.pop("media:thumbnail")
    del item["mediaThumbnail"]["@url"]
    # print(item)
    # cambridge_json.append(item)
    cambridge_dict["data"].append(item)

cambridge_json = json.dumps(cambridge_dict)


# print(type(cambridge_json))
print(cambridge_json, flush=True)


# with open("./newsJSON/cambridge-news.json", "w") as writefile:
#     # print("dumping cbn")
#     json.dump(cambridge_dict, writefile)
