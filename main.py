from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import task, workers
from core.limiter import limiter
import uvicorn
from slowapi.middleware import SlowAPIMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from config.constants import HOST, MODULE, PORT

app = FastAPI()

# Allow the local Vite dev server to reach the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_methods=["GET", "POST", "PUT"],
    allow_headers=["Content-Type"],
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.include_router(task.router, prefix="/tasks", tags=["tasks"])
app.include_router(workers.router, prefix="/workers", tags=["workers"])

if __name__ == "__main__":
    uvicorn.run(
        MODULE,
        host=HOST,
        port=PORT,
        reload=True,
    )
