  import React, { useContext, useState, useEffect } from 'react';
  import './CSS/Shopcategory.css';
  import { Shopcontext } from '../Context/Shopcontext';
  import { Link, useNavigate } from 'react-router-dom';

  const Shopcategory = ({ category }) => {
    const { all_product, fetchProducts, addToCart, updateCartItemQuantity, removeFromCart: removeProductFromContext, cart } = useContext(Shopcontext);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSize, setSelectedSize] = useState(() => {
      return JSON.parse(localStorage.getItem('selectedSize')) || {};
    });
    const [cartQuantities, setCartQuantities] = useState({});
    const navigate = useNavigate();

    const sizeOptions = [
      { label: '100 L / 1 m', value: 100 },
      { label: '500 L / 2 m', value: 500 },
      { label: '1000 L / 5 m', value: 1000 },
      { label: '2000 L / 10 m', value: 2000 }
    ];

    useEffect(() => {
      fetchProducts(category);
    }, [category]);

    useEffect(() => {
      const quantitiesFromCart = {};
      cart.forEach((cartItem) => {
        quantitiesFromCart[cartItem.id] = cartItem.quantity;
      });
      setCartQuantities(quantitiesFromCart);
    }, [cart]);

    const handleSearch = (event) => {
      setSearchQuery(event.target.value);
    };

    const handleSizeChange = (productId, event) => {
      setSelectedSize((prev) => ({ ...prev, [productId]: parseFloat(event.target.value) }));
    };

    const handleAddToCart = (product) => {
      const authToken = localStorage.getItem('auth-token');

      if (!authToken) {
        alert('You need to be logged in to add products to the cart.');
        navigate('/login');
        return;
      }

      const size = selectedSize[product._id] || 100;
      const productToAdd = {
        id: product._id,
        name: product.name,
        image: product.image,
        pricePerUnit: product.pricePerUnit,
        size: size,
        quantity: 1,
      };
      addToCart(productToAdd);
      setCartQuantities((prev) => ({ ...prev, [product._id]: 1 }));
    };

    const handleIncreaseQuantity = (productId) => {
      const newQuantity = (cartQuantities[productId] || 0) + 1;

      setCartQuantities((prev) => ({
        ...prev,
        [productId]: newQuantity,
      }));
      updateCartItemQuantity(productId, newQuantity);
    };

    const handleDecreaseQuantity = (productId) => {
      const newQuantity = (cartQuantities[productId] || 1) - 1;
      if (newQuantity < 1) {
        removeFromCart(productId);
      } else {
        setCartQuantities((prev) => ({
          ...prev,
          [productId]: newQuantity,
        }));
        updateCartItemQuantity(productId, newQuantity);
      }
    };

    const removeFromCart = (productId) => {
      setCartQuantities((prev) => {
        const { [productId]: _, ...rest } = prev;
        return rest;
      });

      removeProductFromContext(productId);
    };

    if (!all_product || all_product.length === 0) {
      return <div>No products found.</div>;
    }

    const filteredProducts = all_product.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="shop-category">
        <div className='search-container'>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
        <div className="shopcategory-items">
          {filteredProducts.map(product => (
            <div key={product._id} className="product-item">
              <img src={product.image} alt={product.name} className="product-image" />
              <span className="product-name">{product.name}</span>
              <div className="product-details">
                <label htmlFor="size">Select Size:</label>
                <select
                  id="size"
                  value={selectedSize[product._id] || 100}
                  onChange={(e) => handleSizeChange(product._id, e)}
                >
                  {sizeOptions.map((option, index) => (
                    <option key={index} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>Price: <span className="product-price">₹{(product.pricePerUnit * (selectedSize[product._id] || 100)).toFixed(2)}</span></div>
              {cartQuantities[product._id] ? (
                <div className="quantity-controls">
                  <button onClick={() => handleDecreaseQuantity(product._id)}>-</button>
                  <span>{cartQuantities[product._id]}</span>
                  <button onClick={() => handleIncreaseQuantity(product._id)}>+</button>
                </div>
              ) : (
                <button
                  className="add-to-cart"
                  onClick={() => handleAddToCart(product)}
                >
                  Add to Cart
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  export default Shopcategory;
