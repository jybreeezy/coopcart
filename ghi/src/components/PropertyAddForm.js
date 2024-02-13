import React, { useState, useEffect } from "react";
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

function PropertyAdd() {
  const [properties, setProperties] = useState([]);
  const [newProperty, setNewProperty] = useState("");
  const { token } = useAuthContext();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({
    first_name: "",
    last_name: "",
    username: "",
    is_km: false,
    property: "",
  });

  useEffect(() => {
    getUser(setUserInfo, token);
  }, [token]); 

  // fetch all properties for form
  const getProperties = async () => {
    const url = `${process.env.REACT_APP_API_HOST}/properties`;
    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setProperties(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getProperties();
  }, []);

  const handleNewPropertyChange = (e) => {
    const value = e.target.value;
    setNewProperty(value);
  };

  // adds property to user
  const handleNewPropertySubmit = async (e) => {
    e.preventDefault();
    const url = `${process.env.REACT_APP_API_HOST}/user`;

    const data = userInfo;
    data.property = newProperty;
    data.terms_boolean = true;

    const fetConfig = {
      method: "PUT",
      body: JSON.stringify(data),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      const response = await fetch(url, fetConfig);
      if (response.ok) {
        await response.json();
        setNewProperty("");
        alert("Successfully added your coop!");
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="container margin-bottom">
        <h2>2. Select Your Coop</h2>
        <p className="info-text">
          If you don't see your property, please ask your Kitchen Manager to add
          one!
        </p>
        {properties === undefined ? null : (
          <form onSubmit={handleNewPropertySubmit}>
            <div className="form-floating mb-3">
              <select onChange={handleNewPropertyChange}>
                <option>Choose Property</option>
                {properties.map((property) => {
                  return (
                    <option
                      key={property.property_id}
                      value={property.property_id}
                    >
                      {property.property_name}, {property.street},{" "}
                      {property.state}
                    </option>
                  );
                })}
              </select>
            </div>
            <button>Submit!</button>
          </form>
        )}
      </div>
    </>
  );
}

export default PropertyAdd;
