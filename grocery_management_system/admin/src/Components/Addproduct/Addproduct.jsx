import React, { useState } from 'react';
import './Addproduct.css';
import upload from '../../assets/upload.png';

const AddProduct = () => {
    const [image, setImage] = useState(null);
    const [productDetails, setProductDetails] = useState({
        name: "",
        image: "",
        category: "",
        pricePerUnit: "", // Changed to price per unit for pipe/tank products
        size: "", // Added size for pipe/tank products
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const sizeOptions = [
        { label: '100 L / 1 m', value: 100 },
        { label: '500 L / 2 m', value: 500 },
        { label: '1000 L / 5 m', value: 1000 },
        { label: '2000 L / 10 m', value: 2000 }
    ];

    const imageHandler = (e) => {
        setImage(e.target.files[0]);
    };

    const changeHandler = (e) => {
        setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
    };

    const addProduct = async () => {
        console.log(productDetails);
        let responseData;
        let product = productDetails;
        setError(null);
        let formData = new FormData();
        formData.append('product', image);

        // Upload image first
        await fetch('http://localhost:5000/upload', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
            },
            body: formData,
        })
        .then((resp) => resp.json())
        .then((data) => { responseData = data; });

        if (responseData.success) {
            product.image = responseData.image_url;
            console.log(product);

            await fetch('http://localhost:5000/addproduct', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(product),
            })
            .then((resp) => resp.json())
            .then((data) => {
                data.success ? alert("Product added") : alert("Failed to add product");
            });
        }
    };

    return (
        <div className='addproduct'>
            {error && <p className='error'>{error}</p>}
            <div className="addproduct-itemfield">
                <p>Product title</p>
                <input
                    value={productDetails.name}
                    onChange={changeHandler}
                    type='text'
                    name="name"
                    placeholder='Type here'
                />
            </div>
            <div className="addproduct-price">
                <div className="addproduct-itemfield">
                    <p>Price per Unit</p>
                    <input
                        value={productDetails.pricePerUnit}
                        onChange={changeHandler}
                        type='text'
                        name="pricePerUnit"
                        placeholder='Type price per unit'
                    />
                </div>
            </div>
            <div className="addproduct-itemfield">
                <p>Product Category</p>
                <select
                    value={productDetails.category}
                    onChange={changeHandler}
                    name="category"
                    className='add-product-selector'
                >
                    <option>--select--</option>
                    <option value="pipes">Pipes</option>
                    <option value="tanks">Tanks</option>
                </select>
            </div>
            <div className="addproduct-itemfield">
                <p>Size</p>
                <select
                    value={productDetails.size}
                    onChange={changeHandler}
                    name="size"
                    className='add-product-selector'
                >
                    <option>--select size--</option>
                    {sizeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
            <div className="addproduct-itemfield">
                <label htmlFor='file-input'>
                    <img
                        src={image ? URL.createObjectURL(image) : upload}
                        className='addproduct-img'
                        alt="Upload"
                    />
                </label>
                <input
                    onChange={imageHandler}
                    type="file"
                    name="image"
                    id="file-input"
                    hidden
                />
            </div>
            <button
                onClick={addProduct}
                className='addproduct-btn'
                disabled={loading}
            >
                {loading ? 'Adding...' : 'ADD'}
            </button>
        </div>
    );
};

export default AddProduct;
