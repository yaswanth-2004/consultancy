import React, { useEffect, useState } from 'react';
import './ListEmployees.css';

const ListEmployees = () => {
  const [allEmployees, setAllEmployees] = useState([]);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [editEmployeeDetails, setEditEmployeeDetails] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const fetchInfo = async () => {
    try {
      const response = await fetch('http://localhost:5000/allemployees');
      const data = await response.json();
      setAllEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  const removeEmployee = async (id) => {
    const confirmDeletion = window.confirm("Are you sure you want to delete this employee?");
    
    if (confirmDeletion) {
      try {
        await fetch('http://localhost:5000/removeemployee', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }),
        });
        await fetchInfo();
      } catch (error) {
        console.error('Error removing employee:', error);
      }
    } else {
      console.log("Employee deletion canceled.");
    }
  };

  const updateEmployee = async (employeeId) => {
    try {
      const employeeDetails = editEmployeeDetails[employeeId];
      const updatedEmployeeData = {
        id: employeeId,
        name: employeeDetails.name,
        position: employeeDetails.position,
        department: employeeDetails.department,
        salary: employeeDetails.salary,
        joinDate: employeeDetails.joinDate,
      };
      await fetch('http://localhost:5000/updateemployee', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedEmployeeData),
      });
      await fetchInfo();
      setEditingEmployeeId(null);
    } catch (error) {
      console.error('Error updating employee:', error);
    }
  };

  const handleEditChange = (e, employeeId) => {
    const { name, value } = e.target;
    setEditEmployeeDetails((prevDetails) => ({
      ...prevDetails,
      [employeeId]: {
        ...prevDetails[employeeId],
        [name]: value,
      },
    }));
  };

  const startEditing = (employeeId, employee) => {
    setEditingEmployeeId(employeeId);
    setEditEmployeeDetails((prevDetails) => ({
      ...prevDetails,
      [employeeId]: employee,
    }));
  };

  const filteredEmployees = allEmployees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="listemployees">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="listemployees-format">
        <p>Photo</p>
        <p>Name</p>
        <p>Position</p>
        <p>Department</p>
        <p>Salary</p>
        <p>Join Date</p>
        <p>Actions</p>
      </div>

      <div className="listemployees-allemployees">
        <hr />
        {filteredEmployees.length > 0 ? (
          filteredEmployees.map((employee, index) => (
            <React.Fragment key={index}>
              <div className="listemployees-format-main">
                <img
                  src={employee.image}
                  alt={employee.name}
                  className="listemployees-img"
                />
                {editingEmployeeId === employee._id ? (
                  <>
                    <input
                      type="text"
                      name="name"
                      value={editEmployeeDetails[employee._id]?.name || ''}
                      onChange={(e) => handleEditChange(e, employee._id)}
                    />
                    <input
                      type="text"
                      name="position"
                      value={editEmployeeDetails[employee._id]?.position || ''}
                      onChange={(e) => handleEditChange(e, employee._id)}
                    />
                    <select
                      name="department"
                      value={editEmployeeDetails[employee._id]?.department || ''}
                      onChange={(e) => handleEditChange(e, employee._id)}
                    >
                      <option value="">--Select Department--</option>
                      <option value="sales">Sales</option>
                      <option value="production">Production</option>
                      <option value="logistics">Logistics</option>
                      <option value="finance">Finance</option>
                      <option value="hr">HR</option>
                    </select>
                    <input
                      type="text"
                      name="salary"
                      value={editEmployeeDetails[employee._id]?.salary || ''}
                      onChange={(e) => handleEditChange(e, employee._id)}
                    />
                    <input
                      type="date"
                      name="joinDate"
                      value={editEmployeeDetails[employee._id]?.joinDate || ''}
                      onChange={(e) => handleEditChange(e, employee._id)}
                    />
                    <div className="button-group">
                      <button
                        onClick={() => updateEmployee(employee._id)}
                        className="listemployees-btn save-btn"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingEmployeeId(null)}
                        className="listemployees-btn cancel-btn"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p>{employee.name}</p>
                    <p>{employee.position}</p>
                    <p>{employee.department}</p>
                    <p>Rs.{employee.salary}</p>
                    <p>{new Date(employee.joinDate).toLocaleDateString()}</p>
                    <div className="button-group">
                      <button
                        onClick={() => startEditing(employee._id, employee)}
                        className="listemployees-btn edit-btn"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => removeEmployee(employee._id)}
                        className="listemployees-btn remove-btn"
                      >
                        Remove
                      </button>
                    </div>
                  </>
                )}
              </div>
              <hr />
            </React.Fragment>
          ))
        ) : (
          <p className="no-results">No employees found</p>
        )}
      </div>
    </div>
  );
};

export default ListEmployees;