import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import PinGrid from '../components/PinGrid';
import { useNavigate, useLocation } from 'react-router-dom';
import { getImagesFromS3 } from '../services/s3Service';

const ProductsContainer = styled.div`
  padding-top: 145px;
  padding-left: 20px;
  padding-right: 20px;
  padding-bottom: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const LoadingMessage = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const ErrorMessage = styled.div`
  color: #0A8F96;
  text-align: center;
  padding: 20px;
  margin: 20px auto;
  max-width: 600px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative; // Added for close button positioning
`;

const CloseButton = styled.button`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: #0A8F96;
  }
`;

function ProductsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getImagesFromS3();
      setProducts(data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('データの取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleRefresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await fetchProducts();
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error('Refresh error:', err);
      setError('データの更新に失敗しました。');
    } finally {
      setLoading(false);
    }
  }, [fetchProducts]);

  const handleDeleteSuccess = useCallback(async () => {
    await handleRefresh();
  }, [handleRefresh]);

  return (
    <ProductsContainer>
      {loading && (
        <LoadingOverlay>
          <LoadingMessage>更新中...</LoadingMessage>
        </LoadingOverlay>
      )}

      {error && (
        <ErrorMessage>
          {error}
          <CloseButton onClick={() => setError(null)}>×</CloseButton>
        </ErrorMessage>
      )}

      <PinGrid 
        showAll={true} 
        key={refreshKey}
        products={products}
        onRefresh={handleRefresh}
        onDeleteSuccess={handleDeleteSuccess}
        loading={loading}
      />
    </ProductsContainer>
  );
}

export default ProductsPage;