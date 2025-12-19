"""
Script para crear planes de membresía de ejemplo
Ejecutar después de registrar un gimnasio
"""

import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def create_sample_plans(access_token):
    """Crea planes de membresía de ejemplo"""
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    plans = [
        {
            "name": "Plan Básico",
            "description": "Acceso básico al gimnasio",
            "price": 99.00,
            "duration_days": 30,
            "benefits": "Acceso sala de pesas\nHorario limitado 9am-5pm\n1 clase grupal por semana"
        },
        {
            "name": "Plan Premium",
            "description": "Acceso completo con beneficios extra",
            "price": 169.00,
            "duration_days": 30,
            "benefits": "Acceso ilimitado\nTodas las clases grupales\nToalla incluida\nDescuento en tienda"
        },
        {
            "name": "Plan Elite",
            "description": "Membresía premium con entrenamiento personalizado",
            "price": 339.00,
            "duration_days": 30,
            "benefits": "Todo lo de Premium\n2 sesiones PT al mes\nPlan nutricional\nAcceso área VIP"
        },
        {
            "name": "Plan Estudiante",
            "description": "Descuento especial para estudiantes",
            "price": 79.00,
            "duration_days": 30,
            "benefits": "Acceso sala de pesas\nHorario 7am-10pm\n50% descuento clases"
        },
        {
            "name": "Plan Trimestral",
            "description": "Ahorra con plan de 3 meses",
            "price": 269.00,
            "duration_days": 90,
            "benefits": "Acceso completo 3 meses\nClases ilimitadas\nEvaluación física gratis"
        }
    ]
    
    print("\n🏋️  Creando planes de membresía de ejemplo...\n")
    
    created_plans = []
    for plan_data in plans:
        try:
            response = requests.post(
                f"{BASE_URL}/membership-plans",
                headers=headers,
                json=plan_data
            )
            
            if response.status_code == 201:
                plan = response.json()
                created_plans.append(plan)
                print(f"✅ Plan creado: {plan['name']} - S/{plan['price']}")
            else:
                print(f"❌ Error creando {plan_data['name']}: {response.text}")
        except Exception as e:
            print(f"❌ Error: {str(e)}")
    
    print(f"\n✨ {len(created_plans)} planes creados exitosamente!")
    return created_plans

if __name__ == "__main__":
    print("=" * 60)
    print("SCRIPT DE CREACIÓN DE PLANES DE MEMBRESÍA")
    print("=" * 60)
    
    # Solicitar token de acceso
    print("\nPara usar este script:")
    print("1. Regístrate o inicia sesión en la aplicación")
    print("2. Copia tu access_token de las DevTools (localStorage)")
    print("3. Pégalo aquí\n")
    
    access_token = input("Ingresa tu access_token: ").strip()
    
    if not access_token:
        print("❌ Token vacío. Saliendo...")
        exit(1)
    
    try:
        create_sample_plans(access_token)
    except Exception as e:
        print(f"\n❌ Error general: {str(e)}")
