import requests
import time
import sys

def wait_for_server(url, timeout=10):
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            response = requests.get(url)
            if response.status_code == 200:
                return True
        except requests.exceptions.ConnectionError:
            pass
        time.sleep(1)
    return False

def test_health():
    url = "http://localhost:8000/health"
    if wait_for_server(url):
        print("Health check passed!")
        response = requests.get(url)
        print(response.json())
    else:
        print("Health check failed: Server not reachable")
        sys.exit(1)

if __name__ == "__main__":
    test_health()