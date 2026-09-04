import requests

TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc4ODA3ODEzMiwianRpIjoiNjJlZmNmYzMtYmUwNS00NmQ2LTk3OWEtOTVhMjhjZjM1NDdkIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IjEiLCJuYmYiOjE3ODgwNzgxMzIsImNzcmYiOiI2MzczNzk0My1iZjRiLTQ3YTAtOWM0My0wZDA4NjY0M2M3NzciLCJleHAiOjE3ODgwNzkwMzJ9.8ktyD_XJ4MTiuQS1vS8bX4c4ltqX2brUE6kNO952gcE"

url = "http://127.0.0.1:5000/upload"
headers = {"Authorization": f"Bearer {TOKEN}"}

data = {
    "title": "Test Assignment",
    "category": "Notes",
    "subject": "Math",
    "semester": "3"
}

# Change this path to any small file that actually exists on your PC
files = {
    "file": open("test.txt", "rb")
}

response = requests.post(url, headers=headers, data=data, files=files)
print(response.status_code)
print(response.json())