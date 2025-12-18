# Manual Testing Guide for GymCore API

## Prerequisites
- Backend running on `http://localhost:8000`
- Tools: `curl` or `httpie` (examples use curl)

## 1. Register Gym (Success)
Creates a new gym and admin user. Gym is inactive by default.

```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
     -H "Content-Type: application/json" \
     -d '{
           "name": "Iron Gym",
           "email": "contact@irongym.com",
           "phone": "555-0123",
           "address": "123 Muscle St",
           "admin_email": "admin@irongym.com",
           "admin_password": "password123",
           "admin_full_name": "John Doe",
           "plan_type": "pro"
         }'
```

## 2. Login (Success)
Login with the created admin credentials.

```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
     -H "Content-Type: application/json" \
     -d '{
           "email": "admin@irongym.com",
           "password": "password123"
         }'
```
**Response:** Save the `access_token` from the response.

## 3. Access Protected Resource (Fail - Inactive Gym)
Try to access members list without paying. Should fail with 403.

```bash
# Replace <TOKEN> with the access_token from step 2
curl -X GET "http://localhost:8000/api/v1/members/" \
     -H "Authorization: Bearer <TOKEN>"
```
**Expected Response:** `{"detail": "Suscripción inactiva. Por favor, completa el pago."}`

## 4. Process Payment (Success)
Activate the gym subscription.

```bash
curl -X POST "http://localhost:8000/api/v1/billing/mock-payment" \
     -H "Authorization: Bearer <TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{
           "plan_type": "pro",
           "payment_method_mock": "visa_4242"
         }'
```

## 5. Verify Activation
Login again to see updated status or access protected resource.

```bash
curl -X GET "http://localhost:8000/api/v1/members/" \
     -H "Authorization: Bearer <TOKEN>"
```
**Expected Response:** `[]` (Empty list of members, status 200 OK)

## 6. Check Subscription
Verify subscription details.

```bash
curl -X GET "http://localhost:8000/api/v1/billing/subscription" \
     -H "Authorization: Bearer <TOKEN>"
```
