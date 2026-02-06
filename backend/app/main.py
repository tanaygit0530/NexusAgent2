from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import webhooks, tickets, analytics
import uvicorn

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="NexusAgent API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(webhooks.router)
app.include_router(tickets.router)
app.include_router(analytics.router)

@app.get("/")
def read_root():
    return {"message": "NexusAgent API is running"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
