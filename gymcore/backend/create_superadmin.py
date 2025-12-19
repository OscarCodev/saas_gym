"""
Script para crear un superadministrador en la base de datos
"""
from app.infrastructure.database import SessionLocal, UserModel, GymModel
from app.core.security import get_password_hash

def create_superadmin():
    db = SessionLocal()
    
    try:
        # Verificar si ya existe un superadmin
        existing_admin = db.query(UserModel).filter(UserModel.role == 'superadmin').first()
        if existing_admin:
            print("❌ Ya existe un superadministrador en la base de datos")
            print(f"   Email: {existing_admin.email}")
            return
        
        # Crear un gym ficticio para el admin (requerido por FK)
        admin_gym = GymModel(
            name="Admin System",
            email="admin@gymcore.com",
            phone="000000000",
            address="Sistema",
            plan_type="system",
            is_active=True
        )
        db.add(admin_gym)
        db.commit()
        db.refresh(admin_gym)
        
        # Crear superadmin
        admin_user = UserModel(
            gym_id=admin_gym.id,
            email="admin@gymcore.com",
            hashed_password=get_password_hash("admin123"),  # Cambiar esta contraseña
            full_name="Administrador Sistema",
            role="superadmin",
            is_active=True
        )
        
        db.add(admin_user)
        db.commit()
        
        print("✅ Superadministrador creado exitosamente!")
        print(f"   Email: admin@gymcore.com")
        print(f"   Password: admin123")
        print("   ⚠️  IMPORTANTE: Cambia la contraseña después del primer login")
        
    except Exception as e:
        print(f"❌ Error al crear superadmin: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_superadmin()
