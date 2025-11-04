from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException, Query, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import shutil
import jwt
from passlib.context import CryptContext

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create uploads directory
UPLOADS_DIR = ROOT_DIR / 'uploads'
UPLOADS_DIR.mkdir(exist_ok=True)

# Create the main app without a prefix
app = FastAPI()

# Mount uploads directory for serving files
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class Comment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    text: str
    author: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Reclamo(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    numero_reclamo: str
    linea: str
    categoria: str
    sector_estacion: str
    descripcion: str
    archivos: List[str] = []
    estado: str = "Pendiente"
    responsable: Optional[str] = None
    comentarios: List[dict] = []
    fecha_creacion: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    fecha_cierre: Optional[datetime] = None
    solucion: Optional[str] = None
    responsable_cierre: Optional[str] = None

class ReclamoCreate(BaseModel):
    linea: str
    categoria: str
    sector_estacion: str
    descripcion: str

class ReclamoUpdate(BaseModel):
    estado: Optional[str] = None
    responsable: Optional[str] = None
    solucion: Optional[str] = None
    responsable_cierre: Optional[str] = None

class CommentCreate(BaseModel):
    text: str
    author: str

class EstadisticasResponse(BaseModel):
    total_reclamos: int
    reclamos_por_linea: dict
    reclamos_por_categoria: dict
    reclamos_por_estado: dict
    tiempo_promedio_resolucion: Optional[float]
    reclamos_por_mes: dict

# Generate reclamo number
def generar_numero_reclamo(linea: str, categoria: str, contador: int) -> str:
    categoria_map = {
        "Condiciones de trabajo": "CON",
        "Faltante de materiales o elementos de seguridad": "MAT",
        "Higiene y salubridad": "HIG",
        "Seguridad y prevención": "SEG",
        "Personal y recursos humanos": "PER",
        "Conflictos o situaciones laborales": "LAB",
        "Otros reclamos gremiales": "OTR"
    }
    codigo_cat = categoria_map.get(categoria, "OTR")
    return f"Línea{linea}-{codigo_cat}-{contador:04d}"

# Routes
@api_router.get("/")
async def root():
    return {"message": "Sistema de Reclamos Gremiales UTA"}

@api_router.post("/reclamos", response_model=Reclamo)
async def crear_reclamo(input: ReclamoCreate):
    # Get count for numero generation
    count = await db.reclamos.count_documents({"linea": input.linea, "categoria": input.categoria})
    numero = generar_numero_reclamo(input.linea, input.categoria, count + 1)
    
    reclamo_dict = input.model_dump()
    reclamo_dict['numero_reclamo'] = numero
    reclamo_obj = Reclamo(**reclamo_dict)
    
    doc = reclamo_obj.model_dump()
    doc['fecha_creacion'] = doc['fecha_creacion'].isoformat()
    if doc['fecha_cierre']:
        doc['fecha_cierre'] = doc['fecha_cierre'].isoformat()
    
    await db.reclamos.insert_one(doc)
    return reclamo_obj

@api_router.get("/reclamos", response_model=List[Reclamo])
async def obtener_reclamos(
    linea: Optional[str] = None,
    categoria: Optional[str] = None,
    estado: Optional[str] = None,
    responsable: Optional[str] = None,
    search: Optional[str] = None
):
    query = {}
    if linea:
        query['linea'] = linea
    if categoria:
        query['categoria'] = categoria
    if estado:
        query['estado'] = estado
    if responsable:
        query['responsable'] = responsable
    if search:
        query['$or'] = [
            {'numero_reclamo': {'$regex': search, '$options': 'i'}},
            {'descripcion': {'$regex': search, '$options': 'i'}},
            {'sector_estacion': {'$regex': search, '$options': 'i'}}
        ]
    
    reclamos = await db.reclamos.find(query, {"_id": 0}).sort('fecha_creacion', -1).to_list(1000)
    
    for reclamo in reclamos:
        if isinstance(reclamo['fecha_creacion'], str):
            reclamo['fecha_creacion'] = datetime.fromisoformat(reclamo['fecha_creacion'])
        if reclamo.get('fecha_cierre') and isinstance(reclamo['fecha_cierre'], str):
            reclamo['fecha_cierre'] = datetime.fromisoformat(reclamo['fecha_cierre'])
        for comentario in reclamo.get('comentarios', []):
            if isinstance(comentario['timestamp'], str):
                comentario['timestamp'] = datetime.fromisoformat(comentario['timestamp'])
    
    return reclamos

@api_router.get("/reclamos/{reclamo_id}", response_model=Reclamo)
async def obtener_reclamo(reclamo_id: str):
    reclamo = await db.reclamos.find_one({"id": reclamo_id}, {"_id": 0})
    if not reclamo:
        raise HTTPException(status_code=404, detail="Reclamo no encontrado")
    
    if isinstance(reclamo['fecha_creacion'], str):
        reclamo['fecha_creacion'] = datetime.fromisoformat(reclamo['fecha_creacion'])
    if reclamo.get('fecha_cierre') and isinstance(reclamo['fecha_cierre'], str):
        reclamo['fecha_cierre'] = datetime.fromisoformat(reclamo['fecha_cierre'])
    for comentario in reclamo.get('comentarios', []):
        if isinstance(comentario['timestamp'], str):
            comentario['timestamp'] = datetime.fromisoformat(comentario['timestamp'])
    
    return reclamo

@api_router.patch("/reclamos/{reclamo_id}", response_model=Reclamo)
async def actualizar_reclamo(reclamo_id: str, update: ReclamoUpdate):
    reclamo = await db.reclamos.find_one({"id": reclamo_id}, {"_id": 0})
    if not reclamo:
        raise HTTPException(status_code=404, detail="Reclamo no encontrado")
    
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    
    if update.estado == "Resuelto" and not reclamo.get('fecha_cierre'):
        update_data['fecha_cierre'] = datetime.now(timezone.utc).isoformat()
    
    if update_data:
        await db.reclamos.update_one({"id": reclamo_id}, {"$set": update_data})
    
    updated_reclamo = await db.reclamos.find_one({"id": reclamo_id}, {"_id": 0})
    
    if isinstance(updated_reclamo['fecha_creacion'], str):
        updated_reclamo['fecha_creacion'] = datetime.fromisoformat(updated_reclamo['fecha_creacion'])
    if updated_reclamo.get('fecha_cierre') and isinstance(updated_reclamo['fecha_cierre'], str):
        updated_reclamo['fecha_cierre'] = datetime.fromisoformat(updated_reclamo['fecha_cierre'])
    for comentario in updated_reclamo.get('comentarios', []):
        if isinstance(comentario['timestamp'], str):
            comentario['timestamp'] = datetime.fromisoformat(comentario['timestamp'])
    
    return updated_reclamo

@api_router.post("/reclamos/{reclamo_id}/comentarios")
async def agregar_comentario(reclamo_id: str, comment: CommentCreate):
    reclamo = await db.reclamos.find_one({"id": reclamo_id})
    if not reclamo:
        raise HTTPException(status_code=404, detail="Reclamo no encontrado")
    
    nuevo_comentario = Comment(text=comment.text, author=comment.author)
    comment_dict = nuevo_comentario.model_dump()
    comment_dict['timestamp'] = comment_dict['timestamp'].isoformat()
    
    await db.reclamos.update_one(
        {"id": reclamo_id},
        {"$push": {"comentarios": comment_dict}}
    )
    
    return {"message": "Comentario agregado", "comentario": comment_dict}

@api_router.post("/reclamos/{reclamo_id}/archivos")
async def subir_archivo(reclamo_id: str, file: UploadFile = File(...)):
    reclamo = await db.reclamos.find_one({"id": reclamo_id})
    if not reclamo:
        raise HTTPException(status_code=404, detail="Reclamo no encontrado")
    
    # Save file
    file_id = str(uuid.uuid4())
    file_extension = Path(file.filename).suffix
    filename = f"{file_id}{file_extension}"
    file_path = UPLOADS_DIR / filename
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    file_url = f"/uploads/{filename}"
    
    await db.reclamos.update_one(
        {"id": reclamo_id},
        {"$push": {"archivos": file_url}}
    )
    
    return {"message": "Archivo subido", "url": file_url}

@api_router.delete("/reclamos/{reclamo_id}")
async def eliminar_reclamo(reclamo_id: str):
    result = await db.reclamos.delete_one({"id": reclamo_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Reclamo no encontrado")
    return {"message": "Reclamo eliminado"}

@api_router.get("/estadisticas", response_model=EstadisticasResponse)
async def obtener_estadisticas():
    reclamos = await db.reclamos.find({}, {"_id": 0}).to_list(10000)
    
    total = len(reclamos)
    
    # Reclamos por línea
    por_linea = {}
    for r in reclamos:
        linea = r['linea']
        por_linea[linea] = por_linea.get(linea, 0) + 1
    
    # Reclamos por categoría
    por_categoria = {}
    for r in reclamos:
        cat = r['categoria']
        por_categoria[cat] = por_categoria.get(cat, 0) + 1
    
    # Reclamos por estado
    por_estado = {}
    for r in reclamos:
        estado = r['estado']
        por_estado[estado] = por_estado.get(estado, 0) + 1
    
    # Tiempo promedio de resolución
    tiempos = []
    for r in reclamos:
        if r.get('fecha_cierre') and r['estado'] == 'Resuelto':
            fecha_creacion = r['fecha_creacion']
            fecha_cierre = r['fecha_cierre']
            if isinstance(fecha_creacion, str):
                fecha_creacion = datetime.fromisoformat(fecha_creacion)
            if isinstance(fecha_cierre, str):
                fecha_cierre = datetime.fromisoformat(fecha_cierre)
            dias = (fecha_cierre - fecha_creacion).days
            tiempos.append(dias)
    
    tiempo_promedio = sum(tiempos) / len(tiempos) if tiempos else None
    
    # Reclamos por mes
    por_mes = {}
    for r in reclamos:
        fecha = r['fecha_creacion']
        if isinstance(fecha, str):
            fecha = datetime.fromisoformat(fecha)
        mes_key = fecha.strftime('%Y-%m')
        por_mes[mes_key] = por_mes.get(mes_key, 0) + 1
    
    return EstadisticasResponse(
        total_reclamos=total,
        reclamos_por_linea=por_linea,
        reclamos_por_categoria=por_categoria,
        reclamos_por_estado=por_estado,
        tiempo_promedio_resolucion=tiempo_promedio,
        reclamos_por_mes=por_mes
    )

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()