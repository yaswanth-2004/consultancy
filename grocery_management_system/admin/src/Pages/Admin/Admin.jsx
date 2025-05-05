import React from 'react';
import './Admin.css';
import Sidebar from '../../Components/Sidebar/Sidebar';
import { Routes, Route } from 'react-router-dom';
import Addproduct from '../../Components/Addproduct/Addproduct';
import Listproduct from '../../Components/Listproduct/Listproduct';
import AddEmployee from '../../Components/AddEmployee';
import ListEmployees from '../../Components/ListEmployees';
import SentimentDashboard from '../../Components/SentimentDashboard';
import SentimentAnalyzer from '../../Components/SentimentAnalyzer';

const Admin = () => {
  return (
    <div className='admin'>
      <Sidebar />
      <div className='admin-content'>
        <Routes>
          <Route path='/addproduct' element={<Addproduct />} />
          <Route path='/listproduct' element={<Listproduct />} />
          <Route path='/addemployee' element={<AddEmployee />} />
          <Route path='/listemployees' element={<ListEmployees />} />
          <Route path='/sentimentdashboard' element={<SentimentDashboard/>} />
          <Route path='/sentimentanalyzer' element={<SentimentAnalyzer/>} />
        </Routes>
      </div>
    </div>
  );
};

export default Admin;