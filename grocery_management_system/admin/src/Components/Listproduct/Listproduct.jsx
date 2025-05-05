import React, { useEffect, useState } from 'react';
import '../Listproduct/Listproduct.css'
const Listproduct = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null);
  const [editProductDetails, setEditProductDetails] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInfo = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/allproducts');
      const data = await response.json();
      setAllProducts(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  const removeProduct = async (id) => {
    const confirmDeletion = window.confirm("Are you sure you want to delete the product?");
    
    if (confirmDeletion) {
      try {
        await fetch('http://localhost:5000/removeproduct', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }),
        });
        await fetchInfo();
      } catch (error) {
        console.error('Error removing product:', error);
        setError('Failed to remove product. Please try again.');
      }
    }
  };

  const updateProduct = async (productId) => {
    try {
      const productDetails = editProductDetails[productId];
      const updatedProductData = {
        id: productId,
        name: productDetails.name,
        pricePerUnit: productDetails.pricePerUnit,
        category: productDetails.category || 'defaultCategory',
        size: productDetails.size || 'defaultSize',
      };
      
      await fetch('http://localhost:5000/updateproduct', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProductData),
      });
      
      await fetchInfo();
      setEditingProductId(null);
    } catch (error) {
      console.error('Error updating product:', error);
      setError('Failed to update product. Please try again.');
    }
  };

  const handleEditChange = (e, productId) => {
    const { name, value } = e.target;
    setEditProductDetails((prevDetails) => ({
      ...prevDetails,
      [productId]: {
        ...prevDetails[productId],
        [name]: value,
      },
    }));
  };

  const startEditing = (productId, product) => {
    setEditingProductId(productId);
    setEditProductDetails((prevDetails) => ({
      ...prevDetails,
      [productId]: product,
    }));
  };

  const cancelEditing = () => {
    setEditingProductId(null);
  };

  const filteredProducts = allProducts.filter(
    (product) =>
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sizeOptions = [
    { label: '100 L / 1 m', value: 100 },
    { label: '500 L / 2 m', value: 500 },
    { label: '1000 L / 5 m', value: 1000 },
    { label: '2000 L / 10 m', value: 2000 }
  ];

  return (
    <div className="listproduct-container">
      <div className="listproduct-header">
        <h1>Product Inventory</h1>
        <div className="search-container">
          <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M10 4a6 6 0 100 12 6 6 0 000-12zm-8 6a8 8 0 1114.32 4.906l5.387 5.387a1 1 0 01-1.414 1.414l-5.387-5.387A8 8 0 012 10z"></path>
          </svg>
          <input
            type="text"
            placeholder="Search products by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {error && (
        <div className="listproduct-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="error-icon" viewBox="0 0 24 24">
            <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading products...</p>
        </div>
      ) : (
        <>
          {filteredProducts.length > 0 ? (
            <div className="product-table-container">
              <table className="product-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Product Name</th>
                    <th>Price</th>
                    <th>Category</th>
                    <th>Size</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product._id} className={editingProductId === product._id ? 'editing-row' : ''}>
                      <td className="product-img-cell">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="product-img"
                        />
                      </td>
                      
                      {editingProductId === product._id ? (
                        <>
                          <td>
                            <input
                              type="text"
                              name="name"
                              value={editProductDetails[product._id]?.name || ''}
                              onChange={(e) => handleEditChange(e, product._id)}
                              className="edit-input"
                            />
                          </td>
                          <td>
                            <div className="price-input-container">
                              <span className="price-symbol">$</span>
                              <input
                                type="text"
                                name="pricePerUnit"
                                value={editProductDetails[product._id]?.pricePerUnit || ''}
                                onChange={(e) => handleEditChange(e, product._id)}
                                className="edit-input edit-price"
                              />
                            </div>
                          </td>
                          <td>
                            <select
                              name="category"
                              value={editProductDetails[product._id]?.category || 'defaultCategory'}
                              onChange={(e) => handleEditChange(e, product._id)}
                              className="edit-select"
                            >
                              <option value="pipes">Pipes</option>
                              <option value="tanks">Tanks</option>
                            </select>
                          </td>
                          <td>
                            <select
                              name="size"
                              value={editProductDetails[product._id]?.size || ''}
                              onChange={(e) => handleEditChange(e, product._id)}
                              className="edit-select"
                            >
                              <option value="">Select Size</option>
                              {sizeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="action-cell">
                            <div className="action-buttons">
                              <button
                                onClick={() => updateProduct(product._id)}
                                className="save-btn"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="cancel-btn"
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{product.name}</td>
                          <td className="price-cell">${product.pricePerUnit}</td>
                          <td>
                            <span className={`category-badge ${product.category}`}>
                              {product.category}
                            </span>
                          </td>
                          <td>{product.size}</td>
                          <td className="action-cell">
                            <div className="action-buttons">
                              <button
                                onClick={() => startEditing(product._id, product)}
                                className="edit-btn"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="btn-icon" viewBox="0 0 24 24">
                                  <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                                Edit
                              </button>
                              <button
                                onClick={() => removeProduct(product._id)}
                                className="delete-btn"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="btn-icon" viewBox="0 0 24 24">
                                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                                Delete
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-products">
              <svg xmlns="http://www.w3.org/2000/svg" className="no-products-icon" viewBox="0 0 24 24">
                <path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6 0h-4V4h4v2z"></path>
              </svg>
              <p>No products found</p>
              {searchTerm && (
                <button className="clear-search" onClick={() => setSearchTerm('')}>
                  Clear search
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Listproduct;