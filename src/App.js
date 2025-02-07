import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AddProductModal from './components/AddProductModal';
import { ROUTES, APP_BASE_URL } from './utils/constants';
import './App.css';
function App() {
  const [showAddModal, setShowAddModal] = useState(false);

  // Function to handle product addition
  const handleProductAdd = (data) => {
    console.log('New product:', data);
    setShowAddModal(false);
  };

  return (
    <Router basename="/pinterest">
      <div className="App">
        <Header onAddProduct={() => setShowAddModal(true)} />
        <Routes>
          <Route path={ROUTES.HOME} element={<Home />} />
          <Route path={ROUTES.PRODUCTS} element={<ProductsPage />} />
          <Route path={ROUTES.PRODUCT_DETAIL} element={<ProductDetailPage />} />
        </Routes>
        {showAddModal && (
          <AddProductModal
            onClose={() => setShowAddModal(false)}
            onAdd={handleProductAdd}
          />
        )}
      </div>
    </Router>
  );
}

export default App;