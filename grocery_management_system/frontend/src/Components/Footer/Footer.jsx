import React from 'react'
import './Footer.css';
const Footer = () => {
  return (
    <div className='footer'>
        <div className="footer-item">
    <h2>Pipes and Tanks Management</h2>
    <p>We provide durable and efficient piping solutions.</p>
    <p>Available for residential, commercial, and industrial needs.</p>
    <p>Our tanks and pipes ensure long-lasting performance and reliability.</p>
</div>
<div className="footer-item1">
    <h2>Our services:</h2>
    <ul className='footer-service'>
        <li>On-time delivery</li>
        <li>High-quality materials</li>
        <li>Custom installation support</li>
        <li>Affordable pricing</li>
    </ul>
</div>

        <div className="footer-item2">
            <h2>Connect with us:</h2>
            <p>Contact: +916374386020</p>
            <p>Email  :  biospek@gmail.com</p>
        </div>
    </div>
  )
}

export default Footer