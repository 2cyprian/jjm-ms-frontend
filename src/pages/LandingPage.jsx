import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/components/landing.css';
import { VscGraph } from "react-icons/vsc";
import { MdOutlineInventory } from "react-icons/md";
import { FaUsers } from "react-icons/fa";
import { IoIosFlash } from "react-icons/io";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="landing-content">
        <div className="landing-hero">
          <div className="hero-icon">🖨️</div>
          <h1>JJM GEODATA MANAGEMENT SYSTEM</h1>
          <p className="hero-tagline">Complete Management Solution</p>
          <p className="hero-description">
            Streamline your printing operations with real-time job tracking, 
            inventory management, Rental Management, Land Management and Seamless customer experience
          </p>
          
          <div className="landing-actions">
            <button 
              className="btn-primary-large"
              onClick={() => navigate('/login')}
            >
              Get Started
            </button>
          </div>
        </div>

        <div className="landing-features">
          <div className="feature-card">
            <div className="feature-icon"><VscGraph /></div>
            <h3>Dashboard Analytics</h3>
            <p>Track revenue, jobs, and performance metrics in real-time</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon"><MdOutlineInventory /></div>
            <h3>Inventory Control</h3>
            <p>Manage stock levels with automated low-stock alerts</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon"><FaUsers /></div>
            <h3>Team Management</h3>
            <p>Organize branches and staff with role-based access</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon"><IoIosFlash /></div>
            <h3>Fast Processing</h3>
            <p>Quick job uploads and instant queue management</p>
          </div>
        </div>
      </div>

      <footer className="landing-footer">
        <p>© 2025 PrintSync. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
