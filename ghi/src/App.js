import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignupProperty from "./components/SignupProperty.js";
import RequestForm from "./components/RequestForm";
import { AuthProvider } from "@galvanize-inc/jwtdown-for-react";
import UserEdit from "./components/UserEdit";
import PropertyAdd from "./components/PropertyAddForm.js";
import PropertyCreateForm from "./components/PropertyCreateForm.js";
import Dashboard from "./components/Dashboard";
import MainPage from "./Mainpage.js";
import SignInForm from "./Signin.js";
import OrderHistory from "./orderhistory.js";

function App() {
  const baseUrl = process.env.REACT_APP_API_HOST;
  const domain = /https:\/\/[^/]+/;
  const basename = process.env.PUBLIC_URL.replace(domain, "");

  return (
    <AuthProvider baseUrl={baseUrl}>
      <BrowserRouter basename={basename}>
        <div className="Container">
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/signup" element={<SignupProperty />} />
            <Route path="/signin" element={<SignInForm />} />
            <Route path="/user" element={<UserEdit />} />
            <Route path="/property/add" element={<PropertyAdd />} />
            <Route path="/property/create" element={<PropertyCreateForm />} />
            <Route path="/request/add" element={<RequestForm />} />
            <Route path="/orders" element={<OrderHistory />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
