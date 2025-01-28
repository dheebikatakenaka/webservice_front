import React from 'react';
import styled from 'styled-components';
import api from '../api/config';
import { useNavigate } from 'react-router-dom';

const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const DialogContent = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  text-align: center;
`;

const Message = styled.p`
  margin: 20px 0;
  font-size: 16px;
`;

const Button = styled.button`
  padding: 8px 24px;
  border-radius: 20px;
  border: none;
  background-color: #0A8F96;
  color: white;
  font-weight: 600;
  cursor: pointer;
  margin-top: 16px;
`;

const CompletionDialog = ({ productName, onClose }) => {
  const navigate = useNavigate();

  const handleViewProducts = () => {
    navigate('/products');
    onClose();
  };

  const handleClose = async () => {
      if (onClose) {
          await onClose(); // 閉じる前にリフレッシュを待つ
      }
  };


  return (
    <DialogOverlay onClick={onClose}>
      <DialogContent onClick={e => e.stopPropagation()}>
        <Message>
          {productName}商品を削除完了です。
        </Message>
        <Button onClick={onClose}>OK</Button>
      </DialogContent>
    </DialogOverlay>
  );
};
// const CompletionDialog = ({ productName, onClose }) => {
//   return (
//     <DialogOverlay onClick={onClose}>
//       <DialogContent onClick={e => e.stopPropagation()}>
//         <Message>
//           {productName}商品を削除完了です。
//         </Message>
//         <Button onClick={onClose}>OK</Button>
//       </DialogContent>
//     </DialogOverlay>
//   );
// };

export default CompletionDialog;