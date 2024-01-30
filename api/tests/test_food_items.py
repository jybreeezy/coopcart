# from fastapi import FastAPI
from fastapi.testclient import TestClient
from main import app
from queries.food_items import FoodItemQueries


client = TestClient(app)

class EmptyFoodItemQueries:
    def get_food_items(self):
        return []

class CreateFoodItemQueries:
    def create(self, food_item):
        result = {"food_item_id": 1}
        result.update(food_item)
        return result

def test_create_food_item():
    app.dependency_overrides[FoodItemQueries] = CreateFoodItemQueries
    response = client.post(
        "/food_item",
        json={
            "item_name": "test item",
            "brand": 1,
            "vendor": 1,
            "unit_type": "test unit",
            "unit_quantity": 1,
            "price": 1.00
        }
    )

    assert response.status_code == 200
    assert response.json() == {
        "item_name": "test item",
        "brand": 1,
        "vendor": 1,
        "unit_type": "test unit",
        "unit_quantity": 1,
        "price": 1.00,
        "food_item_id": 1
    }

class GetFoodItemQueries:
    def get(self, food_item_id):
        return {
            "food_item_id": 1,
            "item_name": "test item",
            "brand": 1,
            "vendor": 1,
            "unit_type": "test unit",
            "unit_quantity": 1,
            "price": 1.00
        }

def test_get_food_item():
    app.dependency_overrides[FoodItemQueries] = GetFoodItemQueries

    response = client.get("/food_item/1")
    app.dependency_overrides = {}

    assert response.status_code == 200
    assert response.json() == {
            "food_item_id": 1,
            "item_name": "test item",
            "brand": 1,
            "vendor": 1,
            "unit_type": "test unit",
            "unit_quantity": 1,
            "price": 1.00
        }

class UpdateFoodItemQueries:
    def update(self, food_item_id, food_item):
        result = {"food_item_id": 1}

        result.update(food_item)
        return result

def test_update_food_item():
    app.dependency_overrides[FoodItemQueries] = UpdateFoodItemQueries

    response = client.put(
        "/food_item/1",
        json={
            "item_name": "test item",
            "brand": 1,
            "vendor": 1,
            "unit_type": "test unit",
            "unit_quantity": 1,
            "price": 1.00
        }
    )
    app.dependency_overrides = {}

    assert response.status_code == 200
    assert response.json() == {
        "item_name": "test item",
        "brand": 1,
        "vendor": 1,
        "unit_type": "test unit",
        "unit_quantity": 1,
        "price": 1.00,
        "food_item_id": 1
    }

class DeleteFoodItemQueries:
    def delete(self, food_item_id):
        return {"message": "Food item deleted"}

def test_delete_food_item():
    app.dependency_overrides[FoodItemQueries] = DeleteFoodItemQueries

    response = client.delete("/food_item/1")
    app.dependency_overrides = {}

    assert response.status_code == 200
    assert response.json() == {"message": "Food item deleted"}

class GetFoodItemsQueries:
    def get_food_items(self):
        return [
            {
                "food_item_id": 1,
                "item_name": "test item",
                "brand": 1,
                "vendor": 1,
                "unit_type": "test unit",
                "unit_quantity": 1,
                "price": 1.00
            }
        ]

def test_get_all_food_items():
    app.dependency_overrides[FoodItemQueries] = GetFoodItemsQueries

    response = client.get("/food_items")
    app.dependency_overrides = {}

    assert response.status_code == 200
    assert response.json() == {"food_items": []}










def test_init():
    assert 1 == 1



# def test_init_food_items():
#     food_items = FoodItems()
#     assert food_items.food_items == []
