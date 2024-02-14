from pydantic import BaseModel
from typing import Optional, Union
from datetime import datetime
from queries.pool import pool
from psycopg.rows import dict_row


class Error(BaseModel):
    message: str


class PropertyIn(BaseModel):
    property_name: Optional[str] = None
    street: str
    city: str
    zip: str
    state: str
    total_members: Optional[int] = None
    food_fee: str
    property_picture_url: Optional[str] = None


class PropertyOut(BaseModel):
    property_name: Optional[str] = None
    property_id: int
    street: str
    city: str
    zip: str
    state: str
    total_members: Optional[int]
    food_fee: float
    created_at: datetime
    property_picture_url: Optional[str]


class PropertyOutSignup(BaseModel):
    property_name: Optional[str] = None
    property_id: int
    street: str
    city: str
    zip: str
    state: str


class PropertyQueries:
    def create(self, property: PropertyIn) -> Union[PropertyOut, Error]:
        try:
            with pool.connection() as conn:
                with conn.cursor(row_factory=dict_row) as db:
                    curr = db.execute(
                        """
                        INSERT INTO properties (property_name, street, city, zip, state, total_members, food_fee, property_picture_url)
                        VALUES (%s,%s, %s, %s, %s, %s, %s, %s)
                        RETURNING *;
                        """,
                        (
                            property.property_name,
                            property.street,
                            property.city,
                            property.zip,
                            property.state,
                            property.total_members,
                            property.food_fee,
                            property.property_picture_url
                        )
                    )
                    properties = curr.fetchone()
                    properties["food_fee"] = float((properties["food_fee"][1:]))
                    return PropertyOut(**properties)
        except Exception as e:
            print(e)
            return {"message:" "Create did not work"}

    def get(self, property_id: int) -> Union[PropertyOut, Error]:
        try:
            with pool.connection() as conn:
                with conn.cursor(row_factory=dict_row) as db:
                    db.execute("SELECT * FROM properties WHERE property_id = %s;", (property_id,))
                    property_record = db.fetchone()
                    property_record["food_fee"] = float((property_record["food_fee"][1:]))
                    if property_record:
                        return PropertyOut(**property_record)
                    else:
                        return Error(message="Property not found")
        except Exception:
            return {"message:" "An Error Occurred"}

    def update(self, property_id: int, property: PropertyIn) -> Union[PropertyOut, Error]:
        try:
            with pool.connection() as conn:
                with conn.cursor(row_factory=dict_row) as db:
                    db.execute(
                        """
                        UPDATE properties
                        SET property_name= %s, street = %s, city = %s, zip = %s, state = %s, total_members = %s, food_fee = %s, property_picture_url = %s
                        WHERE property_id = %s
                        RETURNING *;
                        """,
                        (
                            property.property_name,
                            property.street,
                            property.city,
                            property.zip,
                            property.state,
                            property.total_members,
                            property.food_fee,
                            property.property_picture_url,
                            property_id
                        )
                    )
                    updated_record = db.fetchone()
                    updated_record["food_fee"] = float((updated_record["food_fee"][1:]))
                    if updated_record:
                        return PropertyOut(**updated_record)
                    else:
                        return Error(message="Property not found")
        except Exception as e:
            print(e)
            return {"message:" "An Error Occured"}

    def get_all(self) -> Union[PropertyOut, Error]:
        try:
            with pool.connection() as conn:
                with conn.cursor(row_factory=dict_row) as db:
                    db.execute(
                        """
                        SELECT
                            property_name,
                            street,
                            city,
                            state,
                            zip,
                            property_id

                        FROM properties
                        """
                    )
                    result = db.fetchall()
                    return [PropertyOutSignup(**row) for row in result]
        except Exception as e:
            print(e)
            return {"message": "Could not get all properties"}

    def get_property(self, property_id: int) -> Union[PropertyOut, Error]:
        return self.get(property_id)

    def get_monthly_spend(self, property_id: int) -> Union[float, Error]:
        try:
            with pool.connection() as conn:
                with conn.cursor(row_factory=dict_row) as db:
                    current_month = datetime.now().month
                    current_year = datetime.now().year
                    db.execute(
                        """
                        SELECT SUM(o.purchased_price * o.purchased_quantity) as monthly_spend
                        FROM orders o
                        JOIN users u ON o.requestor = u.user_id
                        WHERE u.property = %s AND EXTRACT(MONTH FROM created_date) = %s AND EXTRACT(YEAR FROM created_date) = %s
                        """,
                        (property_id, current_month, current_year)
                    )
                    result = db.fetchone()
                    return result['monthly_spend'] if result else 0
        except Exception as e:
            return Error(message=str(e))

    def get_yearly_spend(self, property_id: int) -> Union[float, Error]:
        try:
            with pool.connection() as conn:
                with conn.cursor(row_factory=dict_row) as db:
                    current_year = datetime.now().year
                    db.execute(
                        """
                        SELECT SUM(o.purchased_price * o.purchased_quantity) as yearly_spend
                        FROM orders o
                        JOIN users u ON o.requestor = u.user_id
                        WHERE u.property = %s AND EXTRACT(YEAR FROM created_date) = %s
                        """,
                        (property_id, current_year,)
                    )
                    result = db.fetchone()
                    return result['yearly_spend'] if result else 0
        except Exception as e:
            return Error(message=str(e))

    def get_total_spend(self, property_id: int) -> Union[float, Error]:
        try:
            with pool.connection() as conn:
                with conn.cursor(row_factory=dict_row) as db:
                    db.execute(
                        """
                        SELECT SUM(purchased_price * purchased_quantity) as total_spend
                        FROM orders o
                        JOIN users u ON o.requestor = u.user_id
                        WHERE u.property = %s
                        """,
                        (property_id,)
                    )
                    result = db.fetchone()
                    return result['total_spend'] if result else 0
        except Exception as e:
            return Error(message=str(e))


    def create_budget(self, property_id):
        property = self.get_property(property_id)
        if isinstance(property, Error):
            return property

        monthly_spend = self.get_monthly_spend(property_id)
        if isinstance(monthly_spend, Error):
            return monthly_spend

        yearly_spend = self.get_yearly_spend(property_id)
        if isinstance(yearly_spend, Error):
            return yearly_spend

        total_spend = self.get_total_spend(property_id)
        if isinstance(total_spend, Error):
            return total_spend

        monthly_budget = float(property.food_fee * property.total_members)
        yearly_budget = float(monthly_budget * 12)

        return {
            'monthly_budget': monthly_budget,
            'yearly_budget': yearly_budget,
            'monthly_spend': float(monthly_spend.replace('$', '').replace(',', '')) if monthly_spend else 0.0,
            'yearly_spend': float(yearly_spend.replace('$', '').replace(',', '')) if yearly_spend else 0.0,
            'total_spend': float(total_spend.replace('$', '').replace(',', '')) if total_spend else 0.0
        }
