from pydantic import BaseModel
from typing import List, Optional, Union
from datetime import datetime
from queries.pool import pool
from psycopg.rows import dict_row


class Error(BaseModel):
    message: str


class OrderIn(BaseModel):
    item: str
    brand: str
    unit_quantity: int
    unit_type: str
    vendor: str
    requestor: int
    quantity: int
    purchased_price: float
    purchased_quantity: int
    notes: Optional[str]


class OrderOut(BaseModel):
    order_id: int
    item: str
    brand: str
    unit_quantity: int
    unit_type: str
    vendor: str
    requestor: int
    created_date: datetime
    quantity: int
    purchased_price: float
    purchased_quantity: int
    notes: Optional[str]
    last_edited_by: Optional[int]
    last_edited: Optional[datetime]


class OrderRepository:
    def create(self, order: OrderIn) -> Union[OrderOut, Error]:
        try:
            with pool.connection() as conn:
                with conn.cursor() as db:
                    result = db.execute(
                        """
                        INSERT INTO orders
                            (item, brand, unit_quantity, unit_type, vendor, requestor, quantity, purchased_price, purchased_quantity, notes)
                        VALUES
                            (%s, %s, %s, %s, %s, %s, %s, %s::numeric::money, %s, %s)
                        RETURNING *;
                        """,
                        [
                            order.item,
                            order.brand,
                            order.unit_quantity,
                            order.unit_type,
                            order.vendor,
                            order.requestor,
                            order.quantity,
                            order.purchased_price,
                            order.purchased_quantity,
                            order.notes
                        ]
                    )

                    order_id = result.fetchone()[-1]
                    created_date = datetime.now()
                    return OrderOut(order_id=order_id, created_date=created_date, **order.dict())
        except Exception as e:
            print(e)
            return {"message": "Could not create order"}

    def get_all(self) -> Union[Error, List[OrderOut]]:
        try:
            with pool.connection() as conn:
                with conn.cursor() as db:
                    result = db.execute(
                        """
                        SELECT
                            order_id,
                            item,
                            brand,
                            unit_quantity,
                            unit_type,
                            vendor,
                            requestor,
                            created_date,
                            quantity,
                            purchased_price::money::numeric::float8,
                            purchased_quantity,
                            notes,
                            last_edited_by,
                            last_edited
                        FROM orders
                        ORDER BY created_date;
                        """
                    )
                    return [
                        self.record_to_order_out(record)
                        for record in result
                    ]
        except Exception as e:
            print(e)
            return {"message": "Could not get all orders"}

    def update(self, order_id: int, order: OrderIn) -> OrderOut:
        try:
            with pool.connection() as conn:
                with conn.cursor(row_factory=dict_row) as db:
                    record = db.execute(
                        """
                        UPDATE orders
                        SET item = %s,
                            brand = %s,
                            unit_quantity = %s,
                            unit_type = %s,
                            vendor = %s,
                            requestor = %s,
                            quantity = %s,
                            purchased_price = %s::numeric::money,
                            purchased_quantity = %s,
                            notes = %s
                        WHERE order_id = %s
                        RETURNING *;
                        """,
                        [
                            order.item,
                            order.brand,
                            order.unit_quantity,
                            order.unit_type,
                            order.vendor,
                            order.requestor,
                            order.quantity,
                            order.purchased_price,
                            order.purchased_quantity,
                            order.notes,
                            order_id
                        ]
                    )
                    result = record.fetchone()
                    result["purchased_price"] = float(result["purchased_price"][1:])
                    return self.order_in_to_out(result)
        except Exception as e:
            print(e)
            return {"message": "Could not update the order"}

    def get_one(self, order_id: int) -> Union[OrderOut, Error]:
        try:
            with pool.connection() as conn:
                with conn.cursor(row_factory=dict_row) as db:
                    db.execute(
                        """
                        SELECT
                            order_id,
                            item,
                            brand,
                            unit_quantity,
                            unit_type,
                            vendor,
                            requestor,
                            created_date,
                            quantity,
                            purchased_price::money::numeric::float8,
                            purchased_quantity,
                            notes,
                            last_edited_by,
                            last_edited
                        FROM orders
                        WHERE order_id = %s;
                        """,
                        [order_id]
                    )
                    result = db.fetchone()
                    return OrderOut(**result)

        except Exception as e:
            print(e)
            return {"message": "Could not find order with that order ID"}

    def record_to_order_out(self, record):
        return OrderOut(
            order_id=record[0],
            item=record[1],
            brand=record[2],
            unit_quantity=record[3],
            unit_type=record[4],
            vendor=record[5],
            requestor=record[6],
            created_date=record[7],
            quantity=record[8],
            purchased_price=record[9],
            purchased_quantity=record[10],
            notes=record[11],
            last_edited_by=record[12],
            last_edited=record[13],
        )

    def order_in_to_out(self, order: OrderIn):
        try:
            old_data = order
            return OrderOut(**old_data)
        except Exception as e:
            print(e)
