import requests
import sys
import time
import random
import string

BASE_URL = "http://localhost:8000/api/v1"

def get_random_string(length=8):
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

def test_flow():
    print("Starting Auth & Billing Flow Test...")
    
    # 1. Register
    gym_name = f"Gym_{get_random_string()}"
    email_suffix = get_random_string()
    gym_email = f"contact_{email_suffix}@example.com"
    admin_email = f"admin_{email_suffix}@example.com"
    password = "password123"
    
    print(f"\n1. Registering Gym: {gym_name} ({gym_email})...")
    register_payload = {
        "name": gym_name,
        "email": gym_email,
        "phone": "555-0123",
        "address": "123 Test St",
        "admin_email": admin_email,
        "admin_password": password,
        "admin_full_name": "Admin User",
        "plan_type": "pro"
    }
    
    resp = requests.post(f"{BASE_URL}/auth/register", json=register_payload)
    if resp.status_code != 201:
        print(f"Registration failed: {resp.status_code} - {resp.text}")
        sys.exit(1)
    print("Registration successful.")
    
    # 2. Login
    print("\n2. Logging in...")
    login_payload = {
        "email": admin_email,
        "password": password
    }
    resp = requests.post(f"{BASE_URL}/auth/login", json=login_payload)
    if resp.status_code != 200:
        print(f"Login failed: {resp.status_code} - {resp.text}")
        sys.exit(1)
    
    data = resp.json()
    token = data["access_token"]
    print("Login successful. Token received.")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # 3. Access Protected Resource (Should Fail)
    print("\n3. Testing access to protected resource (Members) - Should FAIL (403)...")
    resp = requests.get(f"{BASE_URL}/members/", headers=headers)
    if resp.status_code == 403:
        print("Success: Access denied as expected (Gym inactive).")
    else:
        print(f"Failure: Expected 403, got {resp.status_code} - {resp.text}")
        sys.exit(1)
        
    # 4. Process Payment
    print("\n4. Processing Mock Payment...")
    payment_payload = {
        "plan_type": "pro",
        "payment_method_mock": "visa_test"
    }
    resp = requests.post(f"{BASE_URL}/billing/mock-payment", json=payment_payload, headers=headers)
    if resp.status_code != 200:
        print(f"Payment failed: {resp.status_code} - {resp.text}")
        sys.exit(1)
    print("Payment successful.")
    
    # 5. Access Protected Resource (Should Succeed)
    # Note: In some implementations, the token might need to be refreshed if claims are baked in.
    # However, our dependency checks the DB for gym status, so the same token should work if it just identifies the user.
    # Let's check dependencies.py: verify_active_gym fetches current_user from DB. So it should work immediately.
    
    print("\n5. Testing access to protected resource (Members) - Should SUCCEED...")
    resp = requests.get(f"{BASE_URL}/members/", headers=headers)
    if resp.status_code == 200:
        print("Success: Access granted.")
    else:
        print(f"Failure: Expected 200, got {resp.status_code} - {resp.text}")
        sys.exit(1)

    # 6. Check Subscription
    print("\n6. Checking Subscription...")
    resp = requests.get(f"{BASE_URL}/billing/subscription", headers=headers)
    if resp.status_code == 200:
        sub = resp.json()
        print(f"Success: Subscription found. Status: {sub['status']}")
    else:
        print(f"Failure: Expected 200, got {resp.status_code} - {resp.text}")
        sys.exit(1)

    print("\nALL TESTS PASSED!")

if __name__ == "__main__":
    # Wait a bit for server to be ready if just started
    time.sleep(2)
    try:
        test_flow()
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to server. Is it running on port 8000?")
        sys.exit(1)