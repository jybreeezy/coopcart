import React, { useState, useEffect } from "react";
import "../style.css";
import { useAuthContext } from "@galvanize-inc/jwtdown-for-react";
import { useNavigate } from "react-router-dom";

const getUser = async (setUserInfo, token) => {
  const url = `${process.env.REACT_APP_API_HOST}/user`;
  const fetchOptions = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    if (token) {
      try {
        const response = await fetch(url, fetchOptions);
        if (response.ok) {
          const data = await response.json();
          setUserInfo(data);
        }
      } catch (err) {
        console.error(err);
      }
    }
  } catch (err) {
    console.error(err);
  }
};

function PropertyCreateForm() {
  const { token } = useAuthContext();
  const navigate = useNavigate();

  const [property, setProperty] = useState({
    property_name: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    food_fee: "",
    total_members: "",
  });

  const [userInfo, setUserInfo] = useState({
    first_name: "",
    last_lame: "",
    username: "",
    is_km: "",
    property: "",
  });

  useEffect(() => {
    getUser(setUserInfo, token);
  }, [token]); // 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProperty((prevProperty) => ({
      ...prevProperty,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // post for create property
    const propertyData = {
      property_name: property.property_name,
      street: property.street,
      city: property.city,
      state: property.state,
      zip: property.zip,
      food_fee: property.food_fee,
      total_members: property.total_members,
    };

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_HOST}/property`,
        {
          method: "post",
          body: JSON.stringify(propertyData),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        await response.json();

        // put for add property to user
        const userUrl = `${process.env.REACT_APP_API_HOST}/user`;

        setUserInfo((prevUserInfo) => ({
          ...prevUserInfo,
          first_name: userInfo.first_name,
          last_name: userInfo.last_name,
          username: userInfo.username,
          is_km: true,
          terms_boolean: true,
          property: userInfo.property,
        }));

        const fetchConfig = {
          method: "PUT",
          body: JSON.stringify(userInfo),
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        };

        const userResponse = await fetch(userUrl, fetchConfig);
        if (userResponse.ok) {
          await userResponse.json();
          alert("Successfully added your coop!");
          navigate("/dashboard");
        } else {
          console.error("Failed to add your coop");
          const errorResponse = await userResponse.text();
          console.error(errorResponse);
        }
      } else {
        console.error("Failed to create property");
        const errorResponse = await response.text();
        console.error(errorResponse);
      }
    } catch (error) {
      console.error("Error: ", error);
    }
  };

  return (
    <div className="container my-5">
      <div className="card shadow">
        <div className="card-body">
          <h2 className="card-title text-center">Create Your Coop</h2>
          <form onSubmit={handleSubmit} id="create-property-form">
            <div className="mb-3">
              <label htmlFor="property_name" className="form-label">
                Property Name
              </label>
              <input
                type="text"
                className="form-control"
                id="property_name"
                name="property_name"
                value={property.property_name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Street */}
            <div className="mb-3">
              <label htmlFor="street" className="form-label">
                Street
              </label>
              <input
                type="text"
                className="form-control"
                id="street"
                name="street"
                value={property.street}
                onChange={handleChange}
                required
              />
            </div>

            {/* City */}
            <div className="mb-3">
              <label htmlFor="city" className="form-label">
                City
              </label>
              <input
                type="text"
                className="form-control"
                id="city"
                name="city"
                value={property.city}
                onChange={handleChange}
                required
              />
            </div>

            {/* State */}
            <div className="mb-3">
              <label htmlFor="state" className="form-label">
                State
              </label>
              <input
                type="text"
                className="form-control"
                id="state"
                name="state"
                value={property.state}
                onChange={handleChange}
                placeholder="Two-letter abbreviations only"
                required
              />
            </div>

            {/* Zip Code */}
            <div className="mb-3">
              <label htmlFor="zip" className="form-label">
                Zip Code
              </label>
              <input
                type="text"
                className="form-control"
                id="zip"
                name="zip"
                value={property.zip}
                onChange={handleChange}
                required
              />
            </div>

            {/* Food Fee */}
            <div className="mb-3">
              <label htmlFor="food_fee" className="form-label">
                Food Fee
              </label>
              <input
                type="text"
                className="form-control"
                id="food_fee"
                name="food_fee"
                value={property.food_fee}
                onChange={handleChange}
                required
                placeholder="Amount"
              />
            </div>

            {/* Total Members */}
            <div className="mb-3">
              <label htmlFor="total_members" className="form-label">
                Total Members
              </label>
              <input
                type="text"
                className="form-control"
                id="total_members"
                name="total_members"
                value={property.total_members}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn btn-primary w-100">
              Create
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PropertyCreateForm;
