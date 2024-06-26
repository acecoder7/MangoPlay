import React, { useState, useEffect } from "react";
import Logo from "../Assets/mangoplayer.png";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Popup from "./Popup"; 
import { Form, Button } from "react-bootstrap";


const Navbar = () => {
  const [openMenu, setOpenMenu] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [user, setUser] = useState(null);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    fullName: "",
    age: "",
    gender: "",
    dateOfBirth: "",
    address: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate("/profile");
  };

  useEffect(() => {
    const userData = localStorage.getItem('userMP');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const [formDataL, setFormDataL] = useState({
    userName: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleChangeL = (e) => {
    setFormDataL({ ...formDataL, [e.target.id]: e.target.value });
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch("https://mangoplay.onrender.com/api/v1/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formDataL),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(data);
      
      toast.success("Login successful");

      localStorage.setItem("userMP", JSON.stringify(data.data.user));
      localStorage.setItem("accessTokenMP", data.data.accessToken);
      localStorage.setItem("refreshTokenMP", data.data.refreshToken);

      setFormDataL({
        userName: "",
        password: "",
      });

      setShowPopup(false);
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      console.error("Error:", error.message);
      toast.error("Login failed");
    }
  };



  const handleSignup = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(
        "https://mangoplay.onrender.com/api/v1/users/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(data);
      toast.success("Registration successful");

      setFormData({
        userName: "",
        email: "",
        fullName: "",
        age: "",
        gender: "",
        dateOfBirth: "",
        address: "",
        password: "",
      });

      setShowSignupModal(false); 
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      console.error("Error:", error.message);
      toast.error("Registration failed");
    }
  };



  const togglePopup = () => {
    setShowPopup(!showPopup);
  };



  const handleOpenSignup = () => {
    setShowSignupModal(!showPopup); 
    setShowSignupModal(!showSignupModal);
  };

  
  const handleLogout = () => {
    localStorage.removeItem("userMP");
    localStorage.removeItem("accessTokenMP");
    localStorage.removeItem("refreshTokenMP");
    setUser(null);
    navigate("/");
    toast.success("Logout successful");
  };



  return (
    <>
      <ToastContainer />
    <nav>

      <div className="nav-logo-container">
        <img src={Logo} alt="" width="200" />
      </div>
      <div className="navbar-links-container">
        <button className="demo-button" href="#">
          Demo
        </button>
        {user ? (
          <>
          <Button className="primary-button" onClick={handleProfileClick}>
            Profile
          </Button>
          <Button className = "primary-button" onClick={handleLogout}>Logout
          </Button>
          </>
        ) : (
          <Button className="primary-button" onClick={togglePopup}>
            Login/SignUp
          </Button>
        )}
      </div>
      </nav>

      
      {showPopup && (
        <Popup onClose={togglePopup}>
          <h2>Login/Signup</h2> 
          <Form onSubmit={handleLogin}>
            <Form.Group controlId="userName">
              <Form.Label>Username or Email Address</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username or email"
                value={formDataL.userName}
                onChange={handleChangeL}
                required
              />
            </Form.Group>
            <Form.Group controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                value={formDataL.password}
                onChange={handleChangeL}
                required
              />
            </Form.Group>
            <Button type="submit" variant="primary">
              Login
            </Button>
            <Button variant="primary" onClick={handleOpenSignup}>
              Signup
            </Button>
          </Form>
        </Popup>
      )}
      {showSignupModal && (
        <Popup onClose={handleOpenSignup}>
          <h2>Login/Signup</h2> 
          <Form onSubmit={handleSignup}>
            <Form.Group controlId="userName">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={formData.userName}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="email">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="fullName">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="age">
              <Form.Label>Age</Form.Label>
              <Form.Control
                type="number"
                value={formData.age}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="gender">
              <Form.Label>Gender</Form.Label>
              <Form.Control
                type="text"
                value={formData.gender}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="dateOfBirth">
              <Form.Label>Date of Birth</Form.Label>
              <Form.Control
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="address">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Signup
            </Button>
          </Form>
        </Popup>
      )}

      {(showPopup || showSignupModal) && <div className="overlay"></div>}
    </>
  );
};

export default Navbar;
