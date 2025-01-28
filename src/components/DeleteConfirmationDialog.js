import styled from 'styled-components';
import { deleteProduct } from '../services/s3Service';
import React, { useState, useEffect } from 'react';

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
        background-color: #0A8F96;
        color: white;
    ` : `
        background-color: #efefef;
        color: black;
    `}
`;

const DeleteConfirmationDialog = ({ productName, onCancel, onDelete }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteProduct(productName);
            
            if (result.success) {
                if (onDelete) {
                    await onDelete();
                    window.location.href = '/pinterest';
                }
                // Close the dialog first
                onCancel();
                // Then refresh the page
                setTimeout(() => {
                    window.location.reload();
                }, 100);
            } else {
                throw new Error(result.message || '削除に失敗しました');
            }
        } catch (error) {
            console.error('Delete error:', error);
            // Close the dialog even if there's an error
            onCancel();
            // Refresh after a short delay
            setTimeout(() => {
                window.location.reload();
            }, 100);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <DialogOverlay onClick={e => e.stopPropagation()}>
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