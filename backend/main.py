from fastapi import FastAPI
from routers import template_routes
from db.base import Base
from routers import api
from routers import auth_routes
from db.session import engine
from fastapi.middleware.cors import CORSMiddleware
from sio_instance import sio
import socketio

Base.metadata.create_all(bind=engine)

app = FastAPI()
# app.include_router(api.router, auth_routes.router)
app.include_router(api.router)
app.include_router(template_routes.router)
app.include_router(auth_routes.router)

origins = [
    "http://localhost:5173",  # Your frontend port
    "http://localhost:8000",  # Your backend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount('/ws', socketio.ASGIApp(sio))


socket_app = socketio.ASGIApp(sio, other_asgi_app=app)