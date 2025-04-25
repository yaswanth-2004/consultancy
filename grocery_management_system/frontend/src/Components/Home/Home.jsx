import React, { useState, useEffect, useContext } from 'react';
import './Home.css';
import { Link, useNavigate } from 'react-router-dom';
import { Shopcontext } from '../../Context/Shopcontext'; 

const Hero = () => {
  const { addToCart, updateCartItemQuantity, removeFromCart, cart } = useContext(Shopcontext); 
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState({}); 
  const [cartQuantities, setCartQuantities] = useState({}); 
  const navigate = useNavigate(); 

  const sizeOptions = [
    { label: '100 L / 1 m', value: 100 },
    { label: '500 L / 2 m', value: 500 },
    { label: '1000 L / 5 m', value: 1000 },
    { label: '2000 L / 10 m', value: 2000 }
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/allproducts');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setProducts(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const quantitiesFromCart = {};
    cart.forEach((item) => {
      quantitiesFromCart[item.id] = item.quantity;
    });
    setCartQuantities(quantitiesFromCart);
  }, [cart]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSizeChange = (productId, e) => {
    setSelectedSize((prev) => ({ ...prev, [productId]: parseFloat(e.target.value) }));
  };

  const isAuthenticated = () => {
    return !!localStorage.getItem('auth-token');
  };

  const handleAddToCart = (product) => {
    if (!isAuthenticated()) {
      alert('Please login to add products to the cart.');
      navigate('/login');
    } else {
      const size = selectedSize[product._id] || 100;
      const productToAdd = {
        id: product._id,
        name: product.name,
        image: product.image,
        pricePerUnit: product.pricePerUnit,
        weight: size,
        quantity: 1,
      };
      addToCart(productToAdd);
      setCartQuantities((prev) => ({ ...prev, [product._id]: 1 }));
    }
  };

  const handleIncreaseQuantity = (productId) => {
    const newQuantity = (cartQuantities[productId] || 0) + 1;
    setCartQuantities((prev) => ({ ...prev, [productId]: newQuantity }));
    updateCartItemQuantity(productId, newQuantity);
  };

  const handleDecreaseQuantity = (productId) => {
    const newQuantity = (cartQuantities[productId] || 1) - 1;
    if (newQuantity < 1) {
      setCartQuantities((prev) => {
        const { [productId]: _, ...rest } = prev;
        return rest;
      });
      removeFromCart(productId);
    } else {
      setCartQuantities((prev) => ({ ...prev, [productId]: newQuantity }));
      updateCartItemQuantity(productId, newQuantity);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="hero">
      <h2>PURCHASE PIPES & TANKS</h2>
      <input
        type="text"
        placeholder="Search products..."
        value={searchQuery}
        onChange={handleSearch}
        className="search-bar"
      />
      {loading ? (
        <p>Loading products...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <div className="hero-item">
          {filteredProducts.map((item) => (
            <div key={item._id} className="product-item">
              <img src={item.image} alt={item.name} className="product-image" />
              <span className="product-name">{item.name}</span>
              <div className="product-details">
                <label htmlFor="size">Select Size:</label>
                <select
                  id="size"
                  value={selectedSize[item._id] || 100}
                  onChange={(e) => handleSizeChange(item._id, e)}
                >
                  {sizeOptions.map((option, index) => (
                    <option key={index} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <span className="product-price">
                Price: ₹{(item.pricePerUnit * (selectedSize[item._id] || 100)).toFixed(2)}
              </span>
              {cartQuantities[item._id] ? (
                <div className="quantity-controls">
                  <button onClick={() => handleDecreaseQuantity(item._id)}>-</button>
                  <span>{cartQuantities[item._id]}</span>
                  <button onClick={() => handleIncreaseQuantity(item._id)}>+</button>
                </div>
              ) : (
                <button className="add-to-cart" onClick={() => handleAddToCart(item)}>
                  Add to Cart
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Hero;
