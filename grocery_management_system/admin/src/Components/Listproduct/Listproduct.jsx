import React, { useEffect, useState } from 'react';
import './Listproduct.css';

const Listproduct = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null);
  const [editProductDetails, setEditProductDetails] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const fetchInfo = async () => {
    try {
      const response = await fetch('http://localhost:5000/allproducts');
      const data = await response.json();
      setAllProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
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
      }
    } else {
      console.log("Product deletion canceled.");
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

  const filteredProducts = allProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="listproduct">
      <div className="search-container">
        <input
          type="text"
          placeholder="search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="listproduct-format">
        <p>Products</p>
        <p>Title</p>
        <p>Price</p>
        <p>Category</p>
        <p>Size</p> {/* Added size column */}
        
      </div>

      <div className="listproduct-allproducts">
        <hr />
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product, index) => (
            <React.Fragment key={index}>
              <div className="listproduct-format-main">
                <img
                  src={product.image}
                  alt={product.name}
                  className="listproduct-img"
                />
                {editingProductId === product._id ? (
                  <>
                    <input
                      type="text"
                      name="name"
                      value={editProductDetails[product._id]?.name || ''}
                      onChange={(e) => handleEditChange(e, product._id)}
                    />
                    <input
                      type="text"
                      name="pricePerUnit"
                      value={editProductDetails[product._id]?.pricePerUnit || ''}
                      onChange={(e) => handleEditChange(e, product._id)}
                    />
                    <select
                      name="category"
                      value={editProductDetails[product._id]?.category || 'defaultCategory'}
                      onChange={(e) => handleEditChange(e, product._id)}
                    >
                      <option value="pipes">Pipes</option>
                      <option value="tanks">Tanks</option>
                    </select>
                    <input
                      type="text"
                      name="size"
                      value={editProductDetails[product._id]?.size || ''}
                      onChange={(e) => handleEditChange(e, product._id)}
                      placeholder="Enter size (e.g., 100 L)"
                    />
                    <button
                      onClick={() => updateProduct(product._id)}
                      className="listproduct-btn"
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <>
                    <p>{product.name}</p>
                    <p>${product.pricePerUnit}</p>
                    <p>{product.category}</p>
                    <p>{product.size}</p> {/* Displaying size */}
                    <button
                      onClick={() => startEditing(product._id, product)}
                      className="listproduct-btn"
                    >
                      Edit
                    </button>
                  </>
                )}
                <button
                  onClick={() => removeProduct(product._id)}
                  className="listproduct-btn"
                >
                  Remove
                </button>
              </div>
              <hr />
            </React.Fragment>
          ))
        ) : (
          <p>No products found</p>
        )}
      </div>
    </div>
  );
};

export default Listproduct;
