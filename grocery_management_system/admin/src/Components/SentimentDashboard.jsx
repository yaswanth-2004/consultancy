import React, { useEffect, useState } from 'react';
import './SentimentDashboard.css'; // optional
import axios from 'axios';

const SentimentDashboard = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await axios.get('http://localhost:5000/get-feedbacks');
        setFeedbacks(res.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching feedbacks:', error);
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, []);

  return (
    <div className="sentiment-dashboard">
      <h2>Customer Feedback Dashboard</h2>
      {loading ? (
        <p>Loading feedbacks...</p>
      ) : feedbacks.length === 0 ? (
        <p>No feedbacks available.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Feedback</th>
              <th>Sentiment</th>
              <th>Score</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.map((fb) => (
              <tr key={fb._id}>
                <td>{fb.productId?.name || 'Unknown Product'}</td>
                <td>{fb.text}</td>
                <td>{fb.sentiment}</td>
                <td>{fb.score.toFixed(2)}</td>
                <td>{new Date(fb.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SentimentDashboard;
