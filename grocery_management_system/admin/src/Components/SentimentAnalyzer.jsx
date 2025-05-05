import React, { useState } from 'react';
import axios from 'axios';

const SentimentAnalyzer = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeSentiment = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/analyze-sentiment', { text });
      setResult(response.data);
    } catch (err) {
      console.error('Error analyzing sentiment:', err);
      setResult({ sentiment: 'Error', score: 0 });
    }
    setLoading(false);
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Sentiment Analyzer</h2>
      <textarea
        rows="4"
        className="w-full p-2 border rounded"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter feedback or text..."
      />
      <button
        onClick={analyzeSentiment}
        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>

      {result && (
        <div className="mt-4 p-3 border rounded bg-gray-100">
          <p><strong>Sentiment:</strong> {result.sentiment}</p>
          <p><strong>Confidence Score:</strong> {(result.score * 100).toFixed(2)}%</p>
        </div>
      )}
    </div>
  );
};

export default SentimentAnalyzer;
