import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { MdDelete, MdEdit } from 'react-icons/md';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import CompletionDialog from './CompletionDialog';
import EditProductModal from './EditProductModal';
import UpdateCompletionDialog from './UpdateCompletionDialog';
import api from '../api/config';
import { API_BASE_URL, ERROR_MESSAGES } from '../utils/constants';

const PinContainer = styled.div`
  break-inside: avoid;
  margin-bottom: 16px;
  position: relative;
  cursor: pointer;
`;

const IconsContainer = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s;
  z-index: 2;
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

const PinImage = styled.img`
  width: 100%;
  display: block;
  border-radius: 16px;
  transition: transform 0.3s ease;
`;

const ImageTitle = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 16px;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  opacity: 0;
  transition: opacity 0.3s ease;
`;

const Container = styled.div`
  position: relative;
  &:hover {
    ${IconsContainer} {
      opacity: 1;
    }
    ${ImageTitle} {
      opacity: 1;
    }
    ${PinImage} {
      transform: scale(1.02);
    }
  }
`;

const Pin = ({ 
    id, 
    image, 
    title, 
    description, 
    category, 
    startDate, 
    endDate, 
    quantity, 
    unit, 
    contactInfo, 
    address, 
    managerName, 
    onDeleteSuccess,
    refreshGrid 
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showDeleteCompletion, setShowDeleteCompletion] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showUpdateCompletion, setShowUpdateCompletion] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleRedirectAfterDelete = () => {
        const currentPath = location.pathname;
        if (currentPath === '/') {
            navigate('/', { replace: true });
        } else if (currentPath.includes('/product/')) {
            navigate('/products', { replace: true });
        } else {
            navigate('/products', { replace: true });
        }
    };

    const handleClick = () => {
        navigate(`/product/${id}`, {
            state: {
                id,
                title,
                image,
                url: image,
                description,
                category,
                startDate,
                endDate,
                quantity,
                unit,
                contactInfo: contactInfo || '',
                contactName: contactInfo ? contactInfo.split('@')[0] : '',
                address,
                managerName
            }
        });
    };

    const handleDelete = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowDeleteConfirm(true);
    };

    const handleEdit = (e) => {
        e.stopPropagation();
        setShowEditModal(true);
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/products/delete/${encodeURIComponent(title)}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            if (data.success) {
                setShowDeleteConfirm(false);
                setShowDeleteCompletion(true);
                if (onDeleteSuccess) {
                    await onDeleteSuccess();
                }
                handleRedirectAfterDelete();
            } else {
                throw new Error(data.message || '削除に失敗しました');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert(ERROR_MESSAGES.DELETE_ERROR);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleUpdate = async (updatedProduct) => {
        setShowEditModal(false);
        setShowUpdateCompletion(true);
        if (refreshGrid) {
            await refreshGrid();
            handleRedirectAfterDelete();
        }
    };

    return (
        <>
            <PinContainer>
                <Container onClick={handleClick}>
                    <PinImage src={image} alt={title} />
                    <IconsContainer onClick={e => e.stopPropagation()}>
                        <IconButton onClick={handleEdit} type="button">
                            <MdEdit size={16} />
                        </IconButton>
                        <IconButton delete onClick={handleDelete} type="button">
                            <MdDelete size={16} />
                        </IconButton>
                    </IconsContainer>
                    <ImageTitle>{title}</ImageTitle>
                </Container>
            </PinContainer>

            {showEditModal && (
                <EditProductModal
                    product={{
                        id,
                        title,
                        description: description || '',
                        image,
                        url: image,
                        category,
                        startDate,
                        endDate,
                        quantity,
                        unit,
                        contactInfo,
                        address,
                        managerName
                    }}
                    onClose={() => setShowEditModal(false)}
                    onUpdate={handleUpdate}
                />
            )}

            {showDeleteConfirm && (
                <DeleteConfirmationDialog
                    productName={title}
                    onCancel={() => setShowDeleteConfirm(false)}
                    onDelete={confirmDelete}
                    isDeleting={isDeleting}
                />
            )}

            {showDeleteCompletion && (
                <CompletionDialog
                    productName={title}
                    onClose={() => {
                        setShowDeleteCompletion(false);
                        if (onDeleteSuccess) {
                            onDeleteSuccess(id);
                        }
                    }}
                />
            )}

            {showUpdateCompletion && (
                <UpdateCompletionDialog
                    productName={title}
                    onClose={() => setShowUpdateCompletion(false)}
                />
            )}
        </>
    );
};

export default Pin;