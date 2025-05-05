import React, { useState } from 'react';
import '../Addproduct/Addproduct.css'

const Addproduct = () => {
  const [image, setImage] = useState(null);
  const [productDetails, setProductDetails] = useState({
    name: "",
    image: "",
    category: "",
    pricePerUnit: "",
    size: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const sizeOptions = [
    { label: '100 L / 1 m', value: 100 },
    { label: '500 L / 2 m', value: 500 },
    { label: '1000 L / 5 m', value: 1000 },
    { label: '2000 L / 10 m', value: 2000 }
  ];

  const imageHandler = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
      setSuccess(false);
    }
  };

  const changeHandler = (e) => {
    setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
    setSuccess(false);
  };

  const addProduct = async () => {
    // Validation
    if (!productDetails.name || !productDetails.category || !productDetails.pricePerUnit || !productDetails.size || !image) {
      setError("Please fill all fields and upload an image");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Simulating the API call for this UI demo
      setTimeout(() => {
        setLoading(false);
        setSuccess(true);
        // Reset form
        setProductDetails({
          name: "",
          image: "",
          category: "",
          pricePerUnit: "",
          size: "",
        });
        setImage(null);
      }, 1500);
      
      // In a real implementation, you would use your actual API calls:
      
      let formData = new FormData();
      formData.append('product', image);
      
      const imageResponse = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData,
      });
      
      const imageData = await imageResponse.json();
      
      if (imageData.success) {
        const product = {...productDetails, image: imageData.image_url};
        
        const productResponse = await fetch('http://localhost:5000/addproduct', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(product),
        });
        
        const productData = await productResponse.json();
        
        if (productData.success) {
          setSuccess(true);
          setProductDetails({
            name: "",
            image: "",
            category: "",
            pricePerUnit: "",
            size: "",
          });
          setImage(null);
        } else {
          setError("Failed to add product");
        }
      } else {
        setError("Failed to upload image");
      }
      
      
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="addproduct-container">
      <div className="addproduct-card">
        <h1 className="addproduct-title">Add New Product</h1>
        
        {error && (
          <div className="addproduct-error">
            <svg xmlns="http://www.w3.org/2000/svg" className="icon-alert" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="addproduct-success">
            <svg xmlns="http://www.w3.org/2000/svg" className="icon-check" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Product added successfully!</span>
          </div>
        )}
        
        <div className="addproduct-form">
          {/* Left Column */}
          <div className="addproduct-form-left">
            <div className="form-group">
              <label className="form-label">
                Product Title
              </label>
              <input
                value={productDetails.name}
                onChange={changeHandler}
                type="text"
                name="name"
                className="form-input"
                placeholder="Enter product name"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">
                Price per Unit
              </label>
              <div className="price-input-container">
                <span className="price-symbol">$</span>
                <input
                  value={productDetails.pricePerUnit}
                  onChange={changeHandler}
                  type="text"
                  name="pricePerUnit"
                  className="form-input price-input"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                Product Category
              </label>
              <select
                value={productDetails.category}
                onChange={changeHandler}
                name="category"
                className="form-select"
              >
                <option value="">Select Category</option>
                <option value="pipes">Pipes</option>
                <option value="tanks">Tanks</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                Size
              </label>
              <select
                value={productDetails.size}
                onChange={changeHandler}
                name="size"
                className="form-select"
              >
                <option value="">Select Size</option>
                {sizeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Right Column - Image Upload */}
          <div className="addproduct-form-right">
            <label className="form-label">
              Product Image
            </label>
            <div className="image-upload-container">
              {image ? (
                <div className="image-preview-container">
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Product preview"
                    className="image-preview"
                  />
                  <button
                    onClick={() => setImage(null)}
                    className="remove-image-btn"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <svg xmlns="http://www.w3.org/2000/svg" className="upload-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <div className="upload-text">
                    <label
                      htmlFor="file-upload"
                      className="upload-button"
                    >
                      <span>Upload an image</span>
                      <input
                        id="file-upload"
                        name="image"
                        type="file"
                        className="hidden-input"
                        onChange={imageHandler}
                        accept="image/*"
                      />
                    </label>
                    <p className="upload-description">or drag and drop</p>
                  </div>
                  <p className="upload-info">PNG, JPG, GIF up to 10MB</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="addproduct-actions">
          <button
            onClick={addProduct}
            disabled={loading}
            className={loading ? "addproduct-btn loading" : "addproduct-btn"}
          >
            {loading ? (
              <>
                <svg className="loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="spinner-track" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Add Product'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Addproduct;