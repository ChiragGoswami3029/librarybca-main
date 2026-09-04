import os
import requests

TOKEN = os.environ["TEST_JWT_TOKEN"]

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