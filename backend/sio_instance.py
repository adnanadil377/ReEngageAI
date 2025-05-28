import socketio
sio = socketio.AsyncServer(cors_allowed_origins='*', async_mode='asgi')



@sio.event
async def connect(sid, environ):
    print("Client connected", sid)
    await sio.send(sid, "welcome") # Corrected typo: "welcome"

@sio.event
async def disconnect(sid):
    print("Client disconnected", sid)