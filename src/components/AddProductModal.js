import React, { useState } from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import { createProduct } from '../services/s3Service';
import api from '../api/config';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;
  overflow-y: auto;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 24px;
  border-radius: 16px;
  width: 90%;
  max-width: 800px;
  margin: 40px auto;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormSection = styled.div`
  border-bottom: 1px solid #efefef;
  padding-bottom: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 15px;
`;

const Label = styled.label`
  font-weight: 600;
  font-size: 14px;
  width: 180px;
  min-width: 180px;
  padding-top: 12px;
  
  &::after {
    content: " ${props => props.required ? '*' : ''}";
    color: #E60023;
  }
`;

const InputWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Input = styled.input`
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  
  &:focus {
    border-color: #E60023;
    outline: none;
  }
`;

const TextArea = styled.textarea`
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    border-color: #E60023;
    outline: none;
  }
`;

const Select = styled.select`
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  
  &:focus {
    border-color: #E60023;
    outline: none;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 12px 24px;
  border-radius: 24px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  
  ${props => props.primary ? `
    background-color: #E60023;
    color: white;
  ` : `
    background-color: #efefef;
    color: black;
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #E60023;
  font-size: 12px;
  margin-top: 4px;
`;

const ImagePreview = styled.div`
  margin-top: 8px;
  img {
    max-width: 200px;
    border-radius: 8px;
  }
`;

const AddProductModal = ({ onClose, onAdd }) => {
    const API_BASE_URL = 'http://172.16.50.168:3000';
    const navigate = useNavigate();
    const location = useLocation();
    
    const [formData, setFormData] = useState({
        商品名: '',
        商品説明: '',
        商品分類: '',
        提供開始日: null,
        提供終了日: null,
        数量: '',
        単位: '',
        提供者の連絡先: '',
        提供元の住所: '',
        作業所長名: '',
        画像: null
    });

    const [previewUrl, setPreviewUrl] = useState(null);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRedirectAfterAdd = () => {
        const currentPath = location.pathname;
        if (currentPath === '/') {
            window.location.href = '/';
        } else if (currentPath.includes('/product/')) {
            window.location.href = '/products';
        } else {
            window.location.href = '/products';
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.商品名.trim()) {
            newErrors.商品名 = '商品名は必須です';
        }
        if (!formData.画像) {
            newErrors.画像 = '商品画像は必須です';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, 画像: file });
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            setIsSubmitting(true);
            try {
                const uploadData = new FormData();
                
                if (formData.画像) {
                    uploadData.append('image', formData.画像);
                }
    
                const productData = {
                    商品名: formData.商品名,
                    商品説明: formData.商品説明,
                    商品分類: formData.商品分類,
                    提供開始日: formData.提供開始日,
                    提供終了日: formData.提供終了日,
                    数量: formData.数量,
                    単位: formData.単位,
                    提供者の連絡先: formData.提供者の連絡先,
                    提供元の住所: formData.提供元の住所,
                    作業所長名: formData.作業所長名
                };
    
                uploadData.append('data', JSON.stringify(productData));
    
                const response = await fetch(`${API_BASE_URL}/api/products/create`, {
                    method: 'POST',
                    body: uploadData
                });
    
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
    
                const result = await response.json();
                
                if (result.success) {
                    if (previewUrl) {
                        URL.revokeObjectURL(previewUrl);
                    }
                    alert('商品が追加されました');
                    onClose();
                    handleRedirectAfterAdd();
                } else {
                    throw new Error(result.message || '商品の追加に失敗しました');
                }
            } catch (error) {
                console.error('Error creating product:', error);
                alert('商品の追加に失敗しました: ' + error.message);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={e => e.stopPropagation()}>
                <Form onSubmit={handleSubmit}>
                    <FormSection>
                        <FormGroup>
                            <Label required>商品名</Label>
                            <InputWrapper>
                                <Input
                                    type="text"
                                    value={formData.商品名}
                                    onChange={e => setFormData({ ...formData, 商品名: e.target.value })}
                                />
                                {errors.商品名 && <ErrorMessage>{errors.商品名}</ErrorMessage>}
                            </InputWrapper>
                        </FormGroup>

                        <FormGroup>
                            <Label>商品説明</Label>
                            <InputWrapper>
                                <TextArea
                                    value={formData.商品説明}
                                    onChange={e => setFormData({ ...formData, 商品説明: e.target.value })}
                                />
                            </InputWrapper>
                        </FormGroup>
                    </FormSection>

                    <FormSection>
                        <FormGroup>
                            <Label>商品分類</Label>
                            <InputWrapper>
                                <Input
                                    type="text"
                                    value={formData.商品分類}
                                    onChange={e => setFormData({ ...formData, 商品分類: e.target.value })}
                                />
                            </InputWrapper>
                        </FormGroup>

                        <FormGroup>
                            <Label>提供開始日</Label>
                            <InputWrapper>
                                <Input
                                    type="date"
                                    value={formData.提供開始日 || ''}
                                    onChange={e => setFormData({ ...formData, 提供開始日: e.target.value })}
                                />
                            </InputWrapper>
                        </FormGroup>

                        <FormGroup>
                            <Label>提供終了日</Label>
                            <InputWrapper>
                                <Input
                                    type="date"
                                    value={formData.提供終了日 || ''}
                                    onChange={e => setFormData({ ...formData, 提供終了日: e.target.value })}
                                    min={formData.提供開始日}
                                />
                            </InputWrapper>
                        </FormGroup>
                    </FormSection>

                    <FormSection>
                        <FormGroup>
                            <Label>数量</Label>
                            <InputWrapper>
                                <Input
                                    type="number"
                                    value={formData.数量}
                                    onChange={e => setFormData({ ...formData, 数量: e.target.value })}
                                />
                            </InputWrapper>
                        </FormGroup>

                        <FormGroup>
                            <Label>単位</Label>
                            <InputWrapper>
                                <Input
                                    type="text"
                                    value={formData.単位}
                                    onChange={e => setFormData({ ...formData, 単位: e.target.value })}
                                />
                            </InputWrapper>
                        </FormGroup>
                    </FormSection>

                    <FormSection>
                        <FormGroup>
                            <Label>提供者の連絡先</Label>
                            <InputWrapper>
                                <Input
                                    type="text"
                                    value={formData.提供者の連絡先}
                                    onChange={e => setFormData({ ...formData, 提供者の連絡先: e.target.value })}
                                />
                            </InputWrapper>
                        </FormGroup>

                        <FormGroup>
                            <Label>提供元の住所</Label>
                            <InputWrapper>
                                <Input
                                    type="text"
                                    value={formData.提供元の住所}
                                    onChange={e => setFormData({ ...formData, 提供元の住所: e.target.value })}
                                />
                            </InputWrapper>
                        </FormGroup>

                        <FormGroup>
                            <Label>作業所長名</Label>
                            <InputWrapper>
                                <Input
                                    type="text"
                                    value={formData.作業所長名}
                                    onChange={e => setFormData({ ...formData, 作業所長名: e.target.value })}
                                />
                            </InputWrapper>
                        </FormGroup>
                    </FormSection>

                    <FormSection>
                        <FormGroup>
                            <Label required>商品写真アップロード</Label>
                            <InputWrapper>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                                {errors.画像 && <ErrorMessage>{errors.画像}</ErrorMessage>}
                                {previewUrl && (
                                    <ImagePreview>
                                        <img src={previewUrl} alt="プレビュー" />
                                    </ImagePreview>
                                )}
                            </InputWrapper>
                        </FormGroup>
                    </FormSection>

                    <ButtonGroup>
                        <Button type="button" onClick={onClose} disabled={isSubmitting}>
                            キャンセル
                        </Button>
                        <Button type="submit" primary disabled={isSubmitting}>
                            {isSubmitting ? '追加中...' : '追加'}
                        </Button>
                    </ButtonGroup>
                </Form>
            </ModalContent>
        </ModalOverlay>
    );
};

export default AddProductModal;