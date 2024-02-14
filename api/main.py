from fastapi import FastAPI
from authenticator import authenticator
from fastapi.middleware.cors import CORSMiddleware
from routers import users, property, brands, vendors, manager, food_items, budgets, requests, orders

import os

app = FastAPI()

app.include_router(authenticator.router)
app.include_router(brands.router)
app.include_router(users.router)
app.include_router(requests.router)
app.include_router(property.router)
app.include_router(orders.router)
app.include_router(manager.router)
app.include_router(food_items.router)
app.include_router(budgets.router)
app.include_router(vendors.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.environ.get("CORS_HOST"), "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "You hit the root path!"}
