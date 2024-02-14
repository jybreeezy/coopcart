import React, { useState, useEffect } from 'react';
import { useAuthContext } from "@galvanize-inc/jwtdown-for-react";
import Nav from "../components/Nav";
import "../style.css";

const PropertyList = () => {
    const [properties, setProperties] = useState([]);
    const [monthlySpend, setMonthlySpend] = useState(0);
    const { token } = useAuthContext();
    const [monthlyBudget, setMonthlyBudget] = useState(0);
    const [yearlyBudget, setYearlyBudget] = useState(0);
    const [yearlySpend, setYearlySpend] = useState(0);
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


    const fetchBudget = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_HOST}/property/1/budget`, {
                credentials: "include",
            });
            const data = await response.json();

            if (data.error) {
                console.error("Error getting budget:", data.error);
            } else {
                setMonthlyBudget(data.monthly_budget);
                setYearlyBudget(data.yearly_budget);
                setMonthlySpend(data.monthly_spend);
                setYearlySpend(data.yearly_spend);
            }
        } catch (error) {
            console.error("Error getting budget:", error);
        }
    };

    useEffect(() => {
        fetchProperties();
        fetchBudget();
    }, [token]);

    return (
        <>
        <Nav />
        <div>
            <h1>Budget</h1>
        {properties ? (
            <div>
               <h2>Property: {properties.property_name}</h2>
                <p>Food Fee: ${properties.food_fee}</p>
                <p>Total Members: {properties.total_members}</p>
                <p>Monthly Budget: ${monthlyBudget}</p>
                <p>Monthly Spend: ${monthlySpend}</p>
                <p>Monthly Remaining: ${monthlyBudget - monthlySpend}</p>
                <p>YTD Budget: ${yearlyBudget}</p>
                <p>YTD Spend: ${yearlySpend}</p>
                <p>YTD Remaining Budget: ${yearlyBudget - yearlySpend}</p>
            </div>
        ) : (
            <p>No budgets available</p>
        )}
        </div>
        </>
    );
};

export default PropertyList;
