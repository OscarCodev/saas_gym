"""
Test Comprehensivo de la Aplicación GymCore
Verifica todos los endpoints y flujos principales
"""
import requests
import sys
import random
import string
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000/api/v1"

def get_random_string(length=8):
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

def print_section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print('='*60)

def print_test(test_name, passed, message=""):
    status = "✓ PASS" if passed else "✗ FAIL"
    print(f"{status} - {test_name}")
    if message:
        print(f"       {message}")

# Datos de prueba globales
test_data = {
    'gym_name': f"TestGym_{get_random_string()}",
    'email_suffix': get_random_string(),
    'password': "TestPassword123!",
    'token': None,
    'gym_id': None,
    'user_id': None,
    'member_id': None,
    'notification_id': None
}

def test_auth_flow():
    """Prueba el flujo completo de autenticación"""
    print_section("FLUJO DE AUTENTICACIÓN")
    
    # 1. Registro
    gym_email = f"gym_{test_data['email_suffix']}@test.com"
    admin_email = f"admin_{test_data['email_suffix']}@test.com"
    
    register_data = {
        "name": test_data['gym_name'],
        "email": gym_email,
        "phone": "555-0100",
        "address": "123 Test Street",
        "admin_email": admin_email,
        "admin_password": test_data['password'],
        "admin_full_name": "Test Admin",
        "plan_type": "pro"
    }
    
    try:
        resp = requests.post(f"{BASE_URL}/auth/register", json=register_data)
        print_test("POST /auth/register", resp.status_code == 201, 
                   f"Status: {resp.status_code}")
    except Exception as e:
        print_test("POST /auth/register", False, str(e))
        return False
    
    # 2. Login
    try:
        login_data = {
            "email": admin_email,
            "password": test_data['password']
        }
        resp = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        print_test("POST /auth/login", resp.status_code == 200,
                   f"Status: {resp.status_code}")
        
        if resp.status_code == 200:
            data = resp.json()
            test_data['token'] = data.get('access_token')
            test_data['gym_id'] = data.get('gym', {}).get('id')
            test_data['user_id'] = data.get('user', {}).get('id')
    except Exception as e:
        print_test("POST /auth/login", False, str(e))
        return False
    
    # 3. Procesar pago para activar gimnasio
    headers = {"Authorization": f"Bearer {test_data['token']}"}
    try:
        payment_data = {
            "plan_type": "pro",
            "payment_method_mock": "visa_test"
        }
        resp = requests.post(f"{BASE_URL}/billing/mock-payment", 
                            json=payment_data, headers=headers)
        print_test("POST /billing/mock-payment", resp.status_code == 200,
                   f"Status: {resp.status_code}")
    except Exception as e:
        print_test("POST /billing/mock-payment", False, str(e))
        return False
    
    # 4. Cambiar contraseña
    try:
        change_pass_data = {
            "current_password": test_data['password'],
            "new_password": "NewTestPass123!"
        }
        resp = requests.post(f"{BASE_URL}/auth/change-password",
                            json=change_pass_data, headers=headers)
        print_test("POST /auth/change-password", resp.status_code == 200,
                   f"Status: {resp.status_code}")
        
        # Restaurar contraseña para tests posteriores
        if resp.status_code == 200:
            test_data['password'] = "NewTestPass123!"
            change_back_data = {
                "current_password": "NewTestPass123!",
                "new_password": "TestPassword123!"
            }
            requests.post(f"{BASE_URL}/auth/change-password",
                         json=change_back_data, headers=headers)
            test_data['password'] = "TestPassword123!"
    except Exception as e:
        print_test("POST /auth/change-password", False, str(e))
    
    # 5. Forgot password
    try:
        forgot_data = {"email": admin_email}
        resp = requests.post(f"{BASE_URL}/auth/forgot-password", json=forgot_data)
        print_test("POST /auth/forgot-password", resp.status_code == 200,
                   f"Status: {resp.status_code}")
    except Exception as e:
        print_test("POST /auth/forgot-password", False, str(e))
    
    return True

def test_user_endpoints():
    """Prueba endpoints de usuario"""
    print_section("ENDPOINTS DE USUARIO")
    
    headers = {"Authorization": f"Bearer {test_data['token']}"}
    
    # 1. Obtener perfil
    try:
        resp = requests.get(f"{BASE_URL}/users/me", headers=headers)
        print_test("GET /users/me", resp.status_code == 200,
                   f"Status: {resp.status_code}")
    except Exception as e:
        print_test("GET /users/me", False, str(e))
    
    # 2. Actualizar perfil
    try:
        update_data = {
            "full_name": "Test Admin Updated",
            "email": f"admin_{test_data['email_suffix']}@test.com"
        }
        resp = requests.put(f"{BASE_URL}/users/me", json=update_data, headers=headers)
        print_test("PUT /users/me", resp.status_code == 200,
                   f"Status: {resp.status_code}")
    except Exception as e:
        print_test("PUT /users/me", False, str(e))

def test_gym_endpoints():
    """Prueba endpoints de gimnasio"""
    print_section("ENDPOINTS DE GIMNASIO")
    
    headers = {"Authorization": f"Bearer {test_data['token']}"}
    
    # 1. Obtener gimnasio
    try:
        resp = requests.get(f"{BASE_URL}/gyms/me", headers=headers)
        print_test("GET /gyms/me", resp.status_code == 200,
                   f"Status: {resp.status_code}")
    except Exception as e:
        print_test("GET /gyms/me", False, str(e))
    
    # 2. Actualizar gimnasio
    try:
        update_data = {
            "name": test_data['gym_name'] + " Updated",
            "phone": "555-0200",
            "address": "456 Updated Street"
        }
        resp = requests.put(f"{BASE_URL}/gyms/me", json=update_data, headers=headers)
        print_test("PUT /gyms/me", resp.status_code == 200,
                   f"Status: {resp.status_code}")
    except Exception as e:
        print_test("PUT /gyms/me", False, str(e))

def test_member_endpoints():
    """Prueba endpoints de miembros"""
    print_section("ENDPOINTS DE MIEMBROS")
    
    headers = {"Authorization": f"Bearer {test_data['token']}"}
    
    # 1. Crear miembro
    try:
        member_data = {
            "full_name": "Test Member",
            "email": f"member_{get_random_string()}@test.com",
            "phone": "555-1234",
            "membership_type": "basic",
            "start_date": datetime.now().isoformat()
        }
        resp = requests.post(f"{BASE_URL}/members/", json=member_data, headers=headers)
        print_test("POST /members/", resp.status_code == 201,
                   f"Status: {resp.status_code}")
        
        if resp.status_code == 201:
            test_data['member_id'] = resp.json().get('id')
    except Exception as e:
        print_test("POST /members/", False, str(e))
        return
    
    # 2. Listar miembros
    try:
        resp = requests.get(f"{BASE_URL}/members/", headers=headers)
        print_test("GET /members/", resp.status_code == 200,
                   f"Status: {resp.status_code} - Count: {len(resp.json()) if resp.status_code == 200 else 0}")
    except Exception as e:
        print_test("GET /members/", False, str(e))
    
    if not test_data['member_id']:
        return
    
    # 3. Obtener miembro
    try:
        resp = requests.get(f"{BASE_URL}/members/{test_data['member_id']}", headers=headers)
        print_test(f"GET /members/{test_data['member_id']}", resp.status_code == 200,
                   f"Status: {resp.status_code}")
    except Exception as e:
        print_test(f"GET /members/{test_data['member_id']}", False, str(e))
    
    # 4. Actualizar miembro
    try:
        update_data = {
            "full_name": "Test Member Updated",
            "phone": "555-5678"
        }
        resp = requests.put(f"{BASE_URL}/members/{test_data['member_id']}", 
                           json=update_data, headers=headers)
        print_test(f"PUT /members/{test_data['member_id']}", resp.status_code == 200,
                   f"Status: {resp.status_code}")
    except Exception as e:
        print_test(f"PUT /members/{test_data['member_id']}", False, str(e))
    
    # 5. Suspender miembro
    try:
        resp = requests.post(f"{BASE_URL}/members/{test_data['member_id']}/suspend", 
                            headers=headers)
        print_test(f"POST /members/{test_data['member_id']}/suspend", resp.status_code == 200,
                   f"Status: {resp.status_code}")
    except Exception as e:
        print_test(f"POST /members/{test_data['member_id']}/suspend", False, str(e))
    
    # 6. Activar miembro
    try:
        resp = requests.post(f"{BASE_URL}/members/{test_data['member_id']}/activate", 
                            headers=headers)
        print_test(f"POST /members/{test_data['member_id']}/activate", resp.status_code == 200,
                   f"Status: {resp.status_code}")
    except Exception as e:
        print_test(f"POST /members/{test_data['member_id']}/activate", False, str(e))
    
    # 7. Eliminar miembro
    try:
        resp = requests.delete(f"{BASE_URL}/members/{test_data['member_id']}", 
                              headers=headers)
        print_test(f"DELETE /members/{test_data['member_id']}", resp.status_code == 204,
                   f"Status: {resp.status_code}")
    except Exception as e:
        print_test(f"DELETE /members/{test_data['member_id']}", False, str(e))

def test_billing_endpoints():
    """Prueba endpoints de facturación"""
    print_section("ENDPOINTS DE FACTURACIÓN")
    
    headers = {"Authorization": f"Bearer {test_data['token']}"}
    
    # 1. Obtener suscripción actual
    try:
        resp = requests.get(f"{BASE_URL}/billing/subscription", headers=headers)
        print_test("GET /billing/subscription", resp.status_code == 200,
                   f"Status: {resp.status_code}")
    except Exception as e:
        print_test("GET /billing/subscription", False, str(e))
    
    # 2. Cambiar plan
    try:
        change_plan_data = {"new_plan_type": "elite"}
        resp = requests.post(f"{BASE_URL}/billing/change-plan",
                            json=change_plan_data, headers=headers)
        print_test("POST /billing/change-plan", resp.status_code == 200,
                   f"Status: {resp.status_code}")
    except Exception as e:
        print_test("POST /billing/change-plan", False, str(e))
    
    # 3. Actualizar método de pago
    try:
        payment_method_data = {
            "last_four": "1234",
            "card_type": "visa",
            "expiry_month": 12,
            "expiry_year": 2025
        }
        resp = requests.put(f"{BASE_URL}/billing/payment-method",
                           json=payment_method_data, headers=headers)
        print_test("PUT /billing/payment-method", resp.status_code == 200,
                   f"Status: {resp.status_code}")
    except Exception as e:
        print_test("PUT /billing/payment-method", False, str(e))
    
    # 4. Obtener facturas
    try:
        resp = requests.get(f"{BASE_URL}/billing/invoices", headers=headers)
        print_test("GET /billing/invoices", resp.status_code == 200,
                   f"Status: {resp.status_code}")
    except Exception as e:
        print_test("GET /billing/invoices", False, str(e))
    
    # 5. Cancelar suscripción (último para no afectar otros tests)
    try:
        resp = requests.post(f"{BASE_URL}/billing/cancel-subscription", headers=headers)
        print_test("POST /billing/cancel-subscription", resp.status_code == 200,
                   f"Status: {resp.status_code}")
    except Exception as e:
        print_test("POST /billing/cancel-subscription", False, str(e))

def test_dashboard_endpoints():
    """Prueba endpoints del dashboard"""
    print_section("ENDPOINTS DE DASHBOARD")
    
    headers = {"Authorization": f"Bearer {test_data['token']}"}
    
    try:
        resp = requests.get(f"{BASE_URL}/dashboard/stats", headers=headers)
        print_test("GET /dashboard/stats", resp.status_code == 200,
                   f"Status: {resp.status_code}")
    except Exception as e:
        print_test("GET /dashboard/stats", False, str(e))

def test_notification_endpoints():
    """Prueba endpoints de notificaciones"""
    print_section("ENDPOINTS DE NOTIFICACIONES")
    
    headers = {"Authorization": f"Bearer {test_data['token']}"}
    
    # 1. Obtener notificaciones
    try:
        resp = requests.get(f"{BASE_URL}/notifications/", headers=headers)
        print_test("GET /notifications/", resp.status_code == 200,
                   f"Status: {resp.status_code}")
        
        if resp.status_code == 200 and resp.json():
            test_data['notification_id'] = resp.json()[0].get('id')
    except Exception as e:
        print_test("GET /notifications/", False, str(e))
    
    # 2. Marcar como leída
    if test_data['notification_id']:
        try:
            resp = requests.post(f"{BASE_URL}/notifications/{test_data['notification_id']}/mark-read",
                                headers=headers)
            print_test(f"POST /notifications/{test_data['notification_id']}/mark-read", 
                      resp.status_code == 200, f"Status: {resp.status_code}")
        except Exception as e:
            print_test(f"POST /notifications/{test_data['notification_id']}/mark-read", False, str(e))

def main():
    print("\n" + "="*60)
    print("  TEST COMPREHENSIVO - GYMCORE SAAS")
    print("  Servidor: " + BASE_URL)
    print("="*60)
    
    try:
        # Verificar que el servidor está corriendo
        resp = requests.get(f"{BASE_URL.replace('/api/v1', '')}/docs", timeout=2)
        if resp.status_code != 200:
            print("\n✗ ERROR: El servidor no está respondiendo")
            print("  Por favor inicia el servidor con: uvicorn main:app --reload")
            sys.exit(1)
    except requests.exceptions.RequestException:
        print("\n✗ ERROR: No se puede conectar al servidor")
        print("  Por favor inicia el servidor con: uvicorn main:app --reload")
        sys.exit(1)
    
    # Ejecutar todos los tests
    if not test_auth_flow():
        print("\n✗ ERROR CRÍTICO: El flujo de autenticación falló")
        print("  No se pueden ejecutar los demás tests")
        sys.exit(1)
    
    test_user_endpoints()
    test_gym_endpoints()
    test_member_endpoints()
    test_billing_endpoints()
    test_dashboard_endpoints()
    test_notification_endpoints()
    
    print("\n" + "="*60)
    print("  TESTS COMPLETADOS")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
