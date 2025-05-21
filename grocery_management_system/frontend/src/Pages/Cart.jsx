import React, { useContext, useRef } from 'react';
import { Shopcontext } from '../Context/Shopcontext';
import './CSS/Cart.css';
import html2pdf from 'html2pdf.js'; // Only if using npm install

const CartPage = () => {
  const {
    cart,
    updateCartItemWeight,
    updateCartItemQuantity,
    removeFromCart,
  } = useContext(Shopcontext);

  const printRef = useRef();

  const sizeOptions = [
    { label: '100 L / 1 m', value: 100 },
    { label: '500 L / 2 m', value: 500 },
    { label: '1000 L / 5 m', value: 1000 },
    { label: '2000 L / 10 m', value: 2000 },
  ];

  const handleSizeChange = (itemId, event) => {
    const newSize = parseFloat(event.target.value);
    if (!isNaN(newSize)) {
      updateCartItemWeight(itemId, newSize);
    }
  };

  const handleQuantityChange = (itemId, event) => {
    const newQuantity = parseInt(event.target.value, 10);
    if (!isNaN(newQuantity) && newQuantity > 0) {
      updateCartItemQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveFromCart = (itemId) => {
    const confirmed = window.confirm('Are you sure you want to remove this item from the cart?');
    if (confirmed) {
      removeFromCart(itemId);
    }
  };

  const calculatePrice = (item) => {
    const pricePerUnit = item.pricePerUnit || 1;
    const weight = item.weight || 1;
    const quantity = item.quantity || 1;
    const price = weight * quantity * pricePerUnit;
    return isNaN(price) ? 0 : price;
  };

  const calculateSubtotal = () => {
    return cart.reduce((acc, item) => acc + calculatePrice(item), 0).toFixed(2);
  };

  const handleDownload = () => {
    const element = printRef.current;
    const opt = {
      margin: 0.5,
      filename: 'cart-summary.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="cart-page">
      <div ref={printRef}>
        <h1>Your Cart</h1>
        {cart.length === 0 ? (
          <div className="empty-cart-message">
            <p>Your cart is empty</p>
            <a href="/">Browse Products</a>
          </div>
        ) : (
          <>
            <ul className="cart-pages">
              {cart.map((item) => (
                <li key={item.id}>
                  <div className="cart-image">
                    <img src={item.image} alt={item.name} />
                    <span>{item.name}</span>
                    <select
                      value={item.weight}
                      onChange={(e) => handleSizeChange(item.id, e)}
                    >
                      {sizeOptions.map((option, index) => (
                        <option key={index} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={item.quantity}
                      min="1"
                      onChange={(e) => handleQuantityChange(item.id, e)}
                    />
                    <span>Price: ₹{calculatePrice(item).toFixed(2)}</span>
                    <button onClick={() => handleRemoveFromCart(item.id)}>Remove</button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="cartitems-down">
              <div className="cartitems-total">
                <h1>Cart Total</h1>
                <div>
                  <div className="cartitems-total-item">
                    <p>Subtotal</p>
                    <p>₹{calculateSubtotal()}</p>
                  </div>
                  <hr />
                  <div className="cartitems-total-item">
                    <p>Delivery</p>
                    <p>Free</p>
                  </div>
                  <hr />
                  <div className="cartitems-total-item">
                    <h3>Total</h3>
                    <h3>₹{calculateSubtotal()}</h3>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      {cart.length > 0 && (
        <button className="download-button" onClick={handleDownload}>
          Download Cart Summary
        </button>
      )}
    </div>
  );
};

export default CartPage;
