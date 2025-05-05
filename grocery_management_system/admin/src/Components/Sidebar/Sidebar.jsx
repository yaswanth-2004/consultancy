import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('/dashboard');
  
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        {!isCollapsed && <h1 className="sidebar-title">Admin Panel</h1>}
        <button 
          onClick={toggleSidebar} 
          className="toggle-button"
        >
          <span className={`toggle-icon ${isCollapsed ? 'menu-icon' : 'close-icon'}`}></span>
        </button>
      </div>
      
      {/* Menu Items */}
      <div className="sidebar-menu">
        <Link to="/dashboard" className={`sidebar-item ${activeItem === '/dashboard' ? 'active' : ''}`}>
          <div className="sidebar-icon dashboard-icon"></div>
          {!isCollapsed && <span className="sidebar-label">Dashboard</span>}
        </Link>
        
        <Link to="/addproduct" className={`sidebar-item ${activeItem === '/addproduct' ? 'active' : ''}`}>
          <div className="sidebar-icon add-icon"></div>
          {!isCollapsed && <span className="sidebar-label">Add Product</span>}
        </Link>
        
        <Link to="/listproduct" className={`sidebar-item ${activeItem === '/listproduct' ? 'active' : ''}`}>
          <div className="sidebar-icon product-icon"></div>
          {!isCollapsed && <span className="sidebar-label">Your Products</span>}
        </Link>
        
        <Link to="/addemployee" className={`sidebar-item ${activeItem === '/addemployee' ? 'active' : ''}`}>
          <div className="sidebar-icon employee-add-icon"></div>
          {!isCollapsed && <span className="sidebar-label">Add Employee</span>}
        </Link>
        
        <Link to="/listemployees" className={`sidebar-item ${activeItem === '/listemployees' ? 'active' : ''}`}>
          <div className="sidebar-icon employee-list-icon"></div>
          {!isCollapsed && <span className="sidebar-label">Employee List</span>}
        </Link>
        
        <Link to="/sentimentdashboard" className={`sidebar-item ${activeItem === '/sentimentdashboard' ? 'active' : ''}`}>
          <div className="sidebar-icon feedback-icon"></div>
          {!isCollapsed && <span className="sidebar-label">Customer Feedback</span>}
        </Link>
      </div>
      
      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <div className={`user-profile ${isCollapsed ? 'collapsed' : ''}`}>
          <div className="avatar">A</div>
          {!isCollapsed && (
            <div className="user-info">
              <p className="user-name">Admin User</p>
              <p className="user-email">admin@example.com</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;