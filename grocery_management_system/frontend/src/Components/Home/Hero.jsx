import React, { useState, useEffect, useContext } from 'react';
import './Home.css';
import { useNavigate } from 'react-router-dom';
import { Shopcontext } from '../../Context/Shopcontext';
import axios from 'axios';

const Hero = () => {
  const { addToCart, updateCartItemQuantity, removeFromCart, cart } = useContext(Shopcontext);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState({});
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [cartQuantities, setCartQuantities] = useState({});
  const [feedbacks, setFeedbacks] = useState({});
  const [sentimentResults, setSentimentResults] = useState({});
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
  
  const handleQuantityChange = (productId, value) => {
    const quantity = Math.max(1, value); // Ensure quantity is at least 1
    setSelectedQuantities((prev) => ({ ...prev, [productId]: quantity }));
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
      const quantity = selectedQuantities[product._id] || (cartQuantities[product._id] || 1);
      
      const productToAdd = {
        id: product._id,
        name: product.name,
        image: product.image,
        pricePerUnit: product.pricePerUnit,
        weight: size,
        quantity: quantity,
      };
      
      addToCart(productToAdd);
      setCartQuantities((prev) => ({ ...prev, [product._id]: quantity }));
      
      // Reset the selected quantity after adding to cart
      setSelectedQuantities((prev) => {
        const { [product._id]: _, ...rest } = prev;
        return rest;
      });
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

  const handleFeedbackChange = (productId, value) => {
    setFeedbacks((prev) => ({ ...prev, [productId]: value }));
  };

  const handleAnalyzeAndSubmit = async (productId) => {
    const text = feedbacks[productId];
    if (!text || text.trim() === '') {
      alert('Please enter feedback.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/analyze-sentiment', { text });
      const result = response.data;

      setSentimentResults((prev) => ({
        ...prev,
        [productId]: result
      }));

      // Optional: Send feedback to admin server
      await axios.post('http://localhost:5000/submit-feedback', {
        productId,
        text,
        sentiment: result.sentiment,
        score: result.score
      });

      alert('Feedback submitted successfully.');
    } catch (err) {
      console.error('Sentiment analysis failed:', err);
      alert('Failed to analyze or submit feedback.');
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
                <label htmlFor={`size-${item._id}`}>Select Size:</label>
                <select
                  id={`size-${item._id}`}
                  value={selectedSize[item._id] || 100}
                  onChange={(e) => handleSizeChange(item._id, e)}
                >
                  {sizeOptions.map((option, index) => (
                    <option key={index} value={option.value}>
                      {option.label}
                    </option>
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
                <div className="product-actions">
                  <div className="quantity-selector">
                    <label htmlFor={`quantity-${item._id}`}>Quantity:</label>
                    <div className="quantity-input-group">
                      <button 
                        onClick={() => handleQuantityChange(item._id, (selectedQuantities[item._id] || 1) - 1)}
                        disabled={(selectedQuantities[item._id] || 1) <= 1}
                      >-</button>
                      <input
                        id={`quantity-${item._id}`}
                        type="number"
                        min="1"
                        value={selectedQuantities[item._id] || 1}
                        onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value) || 1)}
                      />
                      <button 
                        onClick={() => handleQuantityChange(item._id, (selectedQuantities[item._id] || 1) + 1)}
                      >+</button>
                    </div>
                  </div>
                  <button className="add-to-cart" onClick={() => handleAddToCart(item)}>
                    Add to Cart
                  </button>
                </div>
              )}

              <div className="feedback-section">
                <textarea
                  rows="2"
                  placeholder="Leave feedback..."
                  value={feedbacks[item._id] || ''}
                  onChange={(e) => handleFeedbackChange(item._id, e.target.value)}
                />
                <button onClick={() => handleAnalyzeAndSubmit(item._id)}>
                  Analyze & Submit
                </button>
                
                {sentimentResults[item._id] && (
                  <div className="sentiment-result">
                    <p>
                      <strong>Sentiment:</strong> {sentimentResults[item._id].sentiment}
                    </p>
                    <p>
                      <strong>Confidence:</strong>{' '}
                      {(sentimentResults[item._id].score * 100).toFixed(2)}%
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Hero;