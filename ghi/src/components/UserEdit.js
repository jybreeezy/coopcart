import React, { useState, useEffect } from "react";
import { useAuthContext } from "@galvanize-inc/jwtdown-for-react";

const getUser = async (setFormData, token) => {
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
          setFormData(data);
        }
      } catch (err) {
        console.error(err);
      }
    }
  } catch (err) {
    console.error(err);
  }
};

function UserEdit() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    is_km: false,
    property: "",
  });
  const { token } = useAuthContext();
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    getUser(setFormData, token);
  }, [token]); // 

  const handleFormDataChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submittedMessage = submitted
    ? "alert alert-success mb-0"
    : "alert alert-success d-none mb-0";

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = `${process.env.REACT_APP_API_HOST}/user`;

    const data = formData;

    const fetchOptions = {
      method: "PUT",
      body: JSON.stringify(data),
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
            await response.json();
            setSubmitted(true);
            e.target.reset();
          }
        } catch (err) {
          console.error(err);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="row">
        <div className="offset-3 col-6">
          <div className="shadow p-4 mt-4">
            <h1>My User Info</h1>
            <form onSubmit={handleSubmit} id="user-form">
              <div className="form-floating mb-3">
                <input
                  onChange={handleFormDataChange}
                  placeholder="first name"
                  required
                  value={formData.first_name}
                  type="text"
                  name="first_name"
                  id="first_name"
                  className="form-control"
                />
                <label htmlFor="first_name">First Name</label>
              </div>

              <div className="form-floating mb-3">
                <input
                  onChange={handleFormDataChange}
                  placeholder="last name"
                  required
                  type="text"
                  value={formData.last_name}
                  name="last_name"
                  id="last_name"
                  className="form-control"
                />
                <label htmlFor="last_name">Last Name</label>
              </div>

              <div className="form-floating mb-3">
                <input
                  onChange={handleFormDataChange}
                  placeholder="email"
                  required
                  type="text"
                  value={formData.username}
                  name="username"
                  id="username"
                  className="form-control"
                />
                <label htmlFor="employee_id">Email</label>
              </div>
              <button className="btn btn-primary mb-3">Submit</button>
            </form>
            <div className={submittedMessage}>Success! Details updated.</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default UserEdit;
