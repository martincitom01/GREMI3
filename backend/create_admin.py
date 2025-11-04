#!/usr/bin/env python3
"""
Script para crear usuario administrador inicial
Ejecutar: python create_admin.py
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
import os
from dotenv import load_dotenv
from pathlib import Path
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_admin():
    # Conectar a MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    # Verificar si ya existe un admin
    existing_admin = await db.users.find_one({"username": "admin"})
    if existing_admin:
        print("❌ Usuario 'admin' ya existe")
        return
    
    # Crear usuario admin
    admin_user = {
        "id": str(uuid.uuid4()),
        "username": "admin",
        "email": "admin@uta.com",
        "password_hash": pwd_context.hash("admin123"),
        "role": "ADMIN",
        "linea_asignada": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "is_active": True
    }
    
    await db.users.insert_one(admin_user)
    print("✅ Usuario administrador creado exitosamente")
    print("   Usuario: admin")
    print("   Contraseña: admin123")
    print("   ⚠️  Cambia la contraseña después del primer login")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(create_admin())
