import json
import requests

from datetime import date

import datetime


def convertDate(d):
    new_date = datetime.datetime.strptime(d, "%Y-%m-%dT%H:%M:%S")
    return new_date.date().strftime("%d %b")


# print(convertDate("2019-12-23T00:00:00"))

# raw_data = requests.get("https://www.myvue.com/api/microservice/showings/films")
# # print(raw_data.content)

# response = json.loads(raw_data.content.decode("utf-8"))

# # with open("vue.json", "w") as wf:
# #     json.dump(response, wf)


# cambridgeID = "10016"

# # print(response["result"][0]["showingInCinemas"])


# for data in response["result"]:
#     # print("data is ", data["showingInCinemas"])
#     # print(data["showingInCinemas"])
#     if cambridgeID in data["showingInCinemas"]:
#         print("Movie : ", data["filmTitle"])

vue_url = "www.vue.com"

session = requests.Session()

d = session.get("https://www.myvue.com")


# print(
#     requests.get("https://www.myvue.com/cinema/cambridge/whats-on").content.decode(
#         "utf-8"
#     )
# )

timing = str(date.today())
endpoint = "https://www.myvue.com/api/microservice/showings/cinemas/10016/films?minEmbargoLevel=3&includesSession=true&includeSessionAttributes=true"

# print(endpoint)

# https://www.myvue.com/api/microservice/showings/cinemas/10016/films?showingDate=2024-08-02T00:00:00&minEmbargoLevel=3&includesSession=true&includeSessionAttributes=true


# print("I got ", d)

response = session.get(endpoint)
# print("response is ", response.status_code)

if response.ok:
    result = json.loads(response.content.decode("utf-8"))

    # with open("vue_alldata.json", "w") as wf:
    #     json.dump(result, wf)

    vue_movieList = {"data": []}

    for content in result["result"]:

        movie_details = {}
        movie_details["filmTitle"] = content["filmTitle"]
        movie_details["synopsisShort"] = content["synopsisShort"]
        movie_details["director"] = content["director"]
        movie_details["filmUrl"] = content["filmUrl"]
        movie_details["posterImageSrc"] = content["posterImageSrc"]
        movie_details["sessions"] = {}

        for datas in content["showingGroups"]:

            # movie_by_date[convertDate(datas["date"])]
            # convertDate(datas["date"])
            movie_sessions = []
            for data in datas["sessions"]:

                movie_session_details = {}
                movie_details["duration"] = data["duration"]
                movie_session_details["startTime"] = data["startTime"]
                movie_session_details["endTime"] = data["endTime"]
                movie_session_details["Tickets available"] = data["isSoldOut"]
                movie_session_details["bookingUrl"] = vue_url + data["bookingUrl"]
                movie_session_details["screenName"] = data["screenName"]
                movie_session_details["dateofShow"] = data["showTimeWithTimeZone"]
                movie_session_details["price"] = data["formattedPrice"]
                movie_sessions.append(movie_session_details)
                movie_session_details = {}

            movie_details["sessions"][convertDate(datas["date"])] = movie_sessions

        vue_movieList["data"].append(movie_details)

        movie_details = {}

    # print(len(vue_movieList))
    vue_movie_json = json.dumps(vue_movieList)

    print(vue_movie_json, flush=True)
    # with open("test.json", "w") as wf:
    #     json.dump(vue_movieList, wf)

else:
    print({}, flush=True)
