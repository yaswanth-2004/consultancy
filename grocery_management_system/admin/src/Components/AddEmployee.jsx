import React, { useState } from 'react';
import './AddEmployee.css';
import upload from '../assets/upload.png';

const AddEmployee = () => {
    const [image, setImage] = useState(null);
    const [employeeDetails, setEmployeeDetails] = useState({
        name: "",
        image: "",
        position: "",
        department: "",
        salary: "",
        joinDate: "",
        email: "",
        phone: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const imageHandler = (e) => {
        setImage(e.target.files[0]);
    };

    const changeHandler = (e) => {
        setEmployeeDetails({ ...employeeDetails, [e.target.name]: e.target.value });
    };

    const addEmployee = async () => {
        if (!employeeDetails.name || !employeeDetails.position || !employeeDetails.department || !employeeDetails.salary || !employeeDetails.joinDate) {
            setError("Please fill all required fields");
            return;
        }
    
        const formData = new FormData();
        formData.append("image", image);
        Object.keys(employeeDetails).forEach(key => {
            formData.append(key, employeeDetails[key]);
        });
    
        try {
            setLoading(true);
            const response = await fetch("http://localhost:5000/addemployee", {
                method: "POST",
                body: formData,
            });
    
            const data = await response.json();
            if (data.success) {
                alert("Employee added successfully");
                setEmployeeDetails({
                    name: "",
                    image: "",
                    position: "",
                    department: "",
                    salary: "",
                    joinDate: "",
                    email: "",
                    phone: "",
                });
                setImage(null);
            } else {
                setError(data.message || "Failed to add employee");
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className='addemployee-form-container'>
        <div className='addemployee'>
            <h2>Add New Employee</h2>
            {error && <p className='error'>{error}</p>}
            
            <div className="addemployee-itemfield">
                <p>Full Name <span className="required">*</span></p>
                <input
                    value={employeeDetails.name}
                    onChange={changeHandler}
                    type='text'
                    name="name"
                    placeholder='Enter full name'
                />
            </div>
            
            <div className="addemployee-itemfield">
                <p>Position <span className="required">*</span></p>
                <input
                    value={employeeDetails.position}
                    onChange={changeHandler}
                    type='text'
                    name="position"
                    placeholder='Enter job position'
                />
            </div>
            
            <div className="addemployee-itemfield">
                <p>Department <span className="required">*</span></p>
                <select
                    value={employeeDetails.department}
                    onChange={changeHandler}
                    name="department"
                    className='addemployee-selector'
                >
                    <option value="">--Select Department--</option>
                    <option value="sales">Sales</option>
                    <option value="production">Production</option>
                    <option value="logistics">Logistics</option>
                    <option value="finance">Finance</option>
                    <option value="hr">HR</option>
                </select>
            </div>
            
            <div className="addemployee-itemfield">
                <p>Salary <span className="required">*</span></p>
                <input
                    value={employeeDetails.salary}
                    onChange={changeHandler}
                    type='number'
                    name="salary"
                    placeholder='Enter salary amount'
                />
            </div>
            
            <div className="addemployee-itemfield">
                <p>Join Date <span className="required">*</span></p>
                <input
                    value={employeeDetails.joinDate}
                    onChange={changeHandler}
                    type='date'
                    name="joinDate"
                />
            </div>
            
            <div className="addemployee-itemfield">
                <p>Email Address</p>
                <input
                    value={employeeDetails.email}
                    onChange={changeHandler}
                    type='email'
                    name="email"
                    placeholder='Enter email address'
                />
            </div>
            
            <div className="addemployee-itemfield">
                <p>Phone Number</p>
                <input
                    value={employeeDetails.phone}
                    onChange={changeHandler}
                    type='tel'
                    name="phone"
                    placeholder='Enter phone number'
                />
            </div>
            <div className="addemployee-itemfield addemployee-img-container">

            <div className="addemployee-itemfield">
                <p>Employee Photo</p>
                <label htmlFor='file-input' className="image-upload-container">
                    <img
                        src={image ? URL.createObjectURL(image) : upload}
                        className='addemployee-img'
                        alt="Upload"
                    />
                    <span className="upload-text">{image ? 'Change Photo' : 'Upload Photo'}</span>
                </label>
                <input
                    onChange={imageHandler}
                    type="file"
                    name="image"
                    id="file-input"
                    hidden
                    accept="image/*"
                />
            </div>
            </div>
            
            <button
                onClick={addEmployee}
                className='addemployee-btn'
                disabled={loading}
            >
                {loading ? 'Adding...' : 'ADD EMPLOYEE'}
            </button>
        </div>
        </div>
    );
};

export default AddEmployee;