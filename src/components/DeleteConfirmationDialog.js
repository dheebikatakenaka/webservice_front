import React from 'react';
import styled from 'styled-components';
import { deleteProduct } from '../services/s3Service';

const DialogOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const DialogContent = styled.div`
    background: white;
    padding: 24px;
    border-radius: 16px;
    width: 90%;
    max-width: 400px;
`;

const Title = styled.h3`
    margin: 0 0 16px 0;
    font-size: 18px;
`;

const Message = styled.p`
    margin: 0 0 24px 0;
    color: #666;
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 12px;
    justify-content: flex-end;
`;

const Button = styled.button`
    padding: 12px 24px;
    border-radius: 24px;
    border: none;
    font-weight: 600;
    cursor: pointer;
    
    ${props => props.delete ? `
        background-color: #E60023;
        color: white;
    ` : `
        background-color: #efefef;
        color: black;
    `}
`;

const DeleteConfirmationDialog = ({ productId, productName, onCancel, onDelete }) => {
    const API_BASE_URL = 'http://172.16.50.168:3000';
    const [isDeleting, setIsDeleting] = React.useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const encodedTitle = encodeURIComponent(productName);
            const response = await fetch(`${API_BASE_URL}/api/products/delete/${encodedTitle}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            const result = await response.json();
            
            if (result.success) {
                onDelete();
                window.location.reload(); // Add this line to refresh the page
            } else {
                throw new Error(result.message || '削除に失敗しました');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('削除に失敗しました: ' + error.message);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <DialogOverlay onClick={onCancel}>
            <DialogContent onClick={e => e.stopPropagation()}>
                <Title>商品の削除</Title>
                <Message>
                    「{productName}」を削除してもよろしいですか？
                    この操作は取り消せません。
                </Message>
                <ButtonGroup>
                    <Button 
                        onClick={onCancel} 
                        disabled={isDeleting}
                    >
                        キャンセル
                    </Button>
                    <Button 
                        delete 
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? '削除中...' : '削除'}
                    </Button>
                </ButtonGroup>
            </DialogContent>
        </DialogOverlay>
    );
};

export default DeleteConfirmationDialog;