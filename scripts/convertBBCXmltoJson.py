import requests, json, xmltodict, sys

response = requests.get(sys.argv[1])


dict = xmltodict.parse(response.text)

# print(type(dict))


dictionary = {"data": []}

# print("length is  ", len(dict))

for item in dict["rss"]["channel"]["item"]:
    item["mediaThumbnail"] = item["media:thumbnail"]
    item["mediaThumbnail"]["url"] = item["mediaThumbnail"]["@url"]
    item.pop("media:thumbnail")
    del item["mediaThumbnail"]["@url"]
    dictionary["data"].append(item)

result_json = json.dumps(dictionary)


# print(type(cambridge_json))
print(result_json, flush=True)
