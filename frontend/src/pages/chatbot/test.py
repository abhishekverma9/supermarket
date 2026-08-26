import requests

try:
    res = requests.post("http://localhost:8000/recommend/1", json={"auth_token": ""})
    print(res.status_code)
    print(res.text)
except Exception as e:
    print(e)
