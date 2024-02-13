import React, { useState, useEffect } from 'react';
import { useAuthContext } from "@galvanize-inc/jwtdown-for-react";
import Nav from "../components/Nav";
import "../style.css";

const PropertyList = () => {
    const [properties, setProperties] = useState([]);
    const [monthlySpend, setMonthlySpend] = useState(0);
    // const [ytdSpend, setYtdSpend] = useState(0);
    const { token } = useAuthContext();
    const fetchProperties = async () => {
                try {
                    const response = await fetch(`${process.env.REACT_APP_API_HOST}/property/1`, {
                        credentials: "include",
                    });
                    const data = await response.json();

                    setProperties(data);
                } catch (error) {
                    console.error("Error getting budgets:", error);
                }
            };

    const fetchMonthlySpend = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_HOST}/orders/monthly_spend`, {
                credentials: "include",
            });
            const data = await response.json();

            setMonthlySpend(data.monthly_spend);
        } catch (error) {
            console.error("Error getting monthly spend:", error);
        }
    };

    useEffect(() => {
        fetchProperties();
        fetchMonthlySpend();
        // fetchYtdSpend();
    }, [token]);

    return (
        console.log(monthlySpend),
        <>
        <Nav />
        <div>
            <h1>Budget</h1>
        {properties ? (
            <div>
                <h2>Property: {properties.property_name}</h2>
                <p>Food Fee: ${properties.food_fee}</p>
                <p>Total Members: {properties.total_members}</p>
                <p>Monthly Budget: ${properties.food_fee * properties.total_members}</p>
                <p>Monthly Spend: ${monthlySpend}</p>
                <p>Monthly Remaining: ${properties.monthly_remaining}</p>
                <p>YTD Budget: ${properties.food_fee * properties.total_members * 12}</p>
                <p>YTD Spend: ${properties.ytd_spend}</p>
                <p>YTD Remaining Budget: ${properties.ytd_remaining_budget}</p>
            </div>
        ) : (
            <p>No budgets available</p>
        )}
        </div>
        </>
    );
};

export default PropertyList;
