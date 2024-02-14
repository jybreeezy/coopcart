from fastapi import APIRouter, Depends, HTTPException
from queries.orders import OrderIn, OrderOut, OrderRepository, Error
from typing import List, Union
from authenticator import authenticator

router = APIRouter()


@router.post("/order/create")
def create_order(order: OrderIn, repo: OrderRepository = Depends(), account_data: dict = Depends(authenticator.get_current_account_data)):
    result = repo.create(order)
    if isinstance(result, dict) and 'message' in result:
        raise HTTPException(status_code=400, detail=result['message'])
    return repo.create(order)


@router.get("/orders", response_model=Union[List[OrderOut], Error])
def get_all(repo: OrderRepository = Depends(),
            account_data: dict = Depends(authenticator.get_current_account_data)):
    return repo.get_all()


@router.put("/orders/{order_id}", response_model=OrderOut)
def update_order(order_id: int, order: OrderIn, repo: OrderRepository = Depends(), account_data: dict = Depends(authenticator.get_current_account_data)) -> Union[Error, OrderOut]:
    updated = repo.update(order_id, order)
    return updated


@router.get("/orders/{order_id}", response_model=Union[OrderOut, Error])
def get_one(order_id: int, repo: OrderRepository = Depends(),
            account_data: dict = Depends(authenticator.get_current_account_data)):
    return repo.get_one(order_id)
