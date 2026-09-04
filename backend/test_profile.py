import requests

BASE = "http://localhost:5000"

# 1. Log in with an account you already registered
r = requests.post(f"{BASE}/login", json={"email": "chik2@test.com", "password": "test.123"})
token = r.json()["token"]
print("Login:", r.status_code, r.json())

# 2. Hit /profile with that token
r = requests.get(f"{BASE}/profile", headers={"Authorization": f"Bearer {token}"})
print("Profile:", r.status_code, r.json())