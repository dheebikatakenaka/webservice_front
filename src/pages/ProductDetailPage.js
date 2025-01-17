import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { MdDelete, MdEdit } from 'react-icons/md';
import PinGrid from '../components/PinGrid';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';
import EditProductModal from '../components/EditProductModal';
import UpdateCompletionDialog from '../components/UpdateCompletionDialog';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const DetailContainer = styled.div`
  padding: 80px 20px 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const MainSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-bottom: 40px;
`;

const ImageSection = styled.div`
  position: relative;
`;

const MainImage = styled.img`
  width: 100%;
  border-radius: 16px;
  cursor: zoom-in;
`;

const ZoomedImage = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  cursor: zoom-out;
  
  img {
    max-width: 90%;
    max-height: 90%;
  }
`;

const InfoSection = styled.div`
  padding: 20px;
  position: relative;
`;

const IconsContainer = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button`
  background: ${props => props.delete ? '#E60023' : '#000000'};
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.3s;

  &:hover {
    opacity: 0.8;
  }
`;

const InfoItem = styled.div`
  margin-bottom: 16px;
`;

const InfoLabel = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
`;

const InfoValue = styled.div`
  font-size: 16px;
`;

const MoreSection = styled.div`
  margin-top: 40px;
`;

const MoreTitle = styled.h2`
  font-size: 20px;
  margin-bottom: 20px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ddd;
`;

const ProductDetailPage = () => {
  const [showZoom, setShowZoom] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUpdateCompletion, setShowUpdateCompletion] = useState(false);
  const { state } = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  // Add error state
  const [error, setError] = useState(null);

  // Redirect if no state
  useEffect(() => {
    if (!state) {
      navigate('/products');
    }
  }, [state, navigate]);

  if (!state) {
    return null;
  }

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleBack = () => {
    navigate('/products');
  };

  const handleUpdate = async (updatedProduct) => {
    try {
      setShowEditModal(false);
      setShowUpdateCompletion(true);
      console.log('Updated product:', updatedProduct);
      // Optional: Refresh data after update
      // await fetchUpdatedData();
    } catch (error) {
      console.error('Update error:', error);
      setError('更新に失敗しました');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setShowDeleteConfirm(false);
      navigate('/products');
    } catch (error) {
      console.error('Delete error:', error);
      setError('削除に失敗しました');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '未設定';

    try {
      // Handle SharePoint date format "/Date(1234567890000)/"
      if (dateString.includes('/Date(')) {
        const timestamp = parseInt(dateString.replace('/Date(', '').replace(')/', ''));
        return new Date(timestamp).toLocaleDateString('ja-JP');
      }

      // Handle regular date string
      return new Date(dateString).toLocaleDateString('ja-JP');
    } catch (error) {
      console.error('Date parsing error:', error);
      return '未設定';
    }
  };

  return (
    <DetailContainer>
      <MainSection>
        <ImageSection>
          <MainImage
            src={state.image || state.url}
            alt={state.title}
            onClick={() => setShowZoom(true)}
          />
        </ImageSection>
        <InfoSection>
          <IconsContainer>
            <IconButton onClick={handleEdit}>
              <MdEdit size={16} />
            </IconButton>
            <IconButton delete onClick={handleDelete}>
              <MdDelete size={16} />
            </IconButton>
          </IconsContainer>

          <InfoItem>
            <InfoLabel>商品名</InfoLabel>
            <InfoValue>{state.title || '未設定'}</InfoValue>
          </InfoItem>

          <InfoItem>
            <InfoLabel>商品説明</InfoLabel>
            <InfoValue>{state.description || '未設定'}</InfoValue>
          </InfoItem>

          <InfoItem>
            <InfoLabel>商品分類</InfoLabel>
            <InfoValue>{state.category || '未設定'}</InfoValue>
          </InfoItem>

          <InfoItem>
            <InfoLabel>提供期間</InfoLabel>
            <InfoValue>
              {formatDate(state.startDate)} ～ {formatDate(state.endDate)}
            </InfoValue>
          </InfoItem>

          <InfoItem>
            <InfoLabel>数量</InfoLabel>
            <InfoValue>
              {state.quantity ? `${state.quantity}${state.unit || ''}` : '未設定'}
            </InfoValue>
          </InfoItem>

          <InfoItem>
            <InfoLabel>提供者の連絡先</InfoLabel>
            <InfoValue>
              {state.contactName ? (
                <>
                  {state.contactName}
                  {state.contactInfo && ` (${state.contactInfo})`}
                </>
              ) : (
                '未設定'
              )}
            </InfoValue>
          </InfoItem>

          <InfoItem>
            <InfoLabel>提供元の住所</InfoLabel>
            <InfoValue>{state.address || '未設定'}</InfoValue>
          </InfoItem>

          <InfoItem>
            <InfoLabel>作業所長名</InfoLabel>
            <InfoValue>{state.managerName || '未設定'}</InfoValue>
          </InfoItem>
        </InfoSection>
      </MainSection>

      <MoreSection>
        <MoreTitle>もっと見る</MoreTitle>
        <PinGrid showAll={false} limit={6} excludeId={state.id} noTransition={true} />
      </MoreSection>

      {showZoom && (
        <ZoomedImage onClick={() => setShowZoom(false)}>
          <img src={state.image || state.url} alt={state.title} />
        </ZoomedImage>
      )}

      {showDeleteConfirm && (
        <DeleteConfirmationDialog
          productName={state.title}
          onCancel={() => setShowDeleteConfirm(false)}
          onDelete={handleDeleteConfirm}
        />
      )}

      {showEditModal && (
        <EditProductModal
          product={{
            ...state,
            Title: state.title || '未設定', // Changed to match backend expectations
            商品説明: state.description || '未設定',
            商品分類: state.category || '未設定',
            提供開始日: state.startDate || null,
            提供終了日: state.endDate || null,
            数量: state.quantity || '',
            単位: state.unit || '',
            提供者の連絡先: {
              Email: state.contactInfo || '',
              LookupValue: state.contactName || ''
            },
            提供元の住所: state.address || '',
            作業所長名: state.managerName || ''
          }}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleUpdate}
        />
      )}


      {showDeleteConfirm && (
        <DeleteConfirmationDialog
          productName={state.title}
          onCancel={() => setShowDeleteConfirm(false)}
          onDelete={() => {
            setShowDeleteConfirm(false);
            navigate('/products');
          }}
        />
      )}

      {showUpdateCompletion && (
        <UpdateCompletionDialog
          productName={state.title}
          onClose={() => setShowUpdateCompletion(false)}
        />
      )}
    </DetailContainer>
  );
};

export default ProductDetailPage;