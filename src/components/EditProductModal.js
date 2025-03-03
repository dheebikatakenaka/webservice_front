import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import { updateProduct } from '../services/s3Service';
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
    color: #0A8F96;
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
    border-color: #0A8F96;
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
    border-color: #0A8F96;
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
    background-color: #0A8F96;
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
  color: #0A8F96;
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

const EditProductModal = ({ product, onClose, onUpdate }) => {
    const API_BASE_URL = 'http://172.16.50.168:3000';
    const navigate = useNavigate();
    const location = useLocation();

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';

        try {
            const sharePointMatch = /\/Date\((\d+)\)\//.exec(dateString);
            if (sharePointMatch) {
                const timestamp = parseInt(sharePointMatch[1]);
                const date = new Date(timestamp);
                return date.toISOString().split('T')[0];
            }

            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                return date.toISOString().split('T')[0];
            }

            return '';
        } catch (error) {
            console.error('Date formatting error:', error);
            return '';
        }
    };

    const [formData, setFormData] = useState({
        商品名: '',
        商品説明: '',
        商品分類: '',
        提供開始日: '',
        提供終了日: '',
        数量: '',
        単位: '',
        提供者の連絡先: '',
        提供元の住所: '',
        作業所長名: '',
        画像URL: '',
        newImage: null
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState('');

    // In EditProductModal.js, add these logs
    useEffect(() => {
        if (product) {
            console.log('Setting initial form data:', product);
            setFormData({
                商品名: product.title || '',
                商品説明: product.description || '',
                商品分類: product.category || '',    // Make sure this is set
                提供開始日: formatDateForInput(product.startDate) || '',
                提供終了日: formatDateForInput(product.endDate) || '',
                数量: product.quantity || '',        // Make sure this is set
                単位: product.unit || '',            // Make sure this is set
                提供者の連絡先: product.contactInfo || '',
                提供元の住所: product.address || '',
                作業所長名: product.managerName || '',
                画像URL: product.image || ''
            });
            setImagePreview(product.image || '');
        }
    }, [product]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, newImage: file }));
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.商品名.trim()) {
            newErrors.商品名 = '商品名は必須です';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            setIsSubmitting(true);
            try {
                const updateData = {
                    itemId: product.title,
                    fields: {
                        商品名: product.title, // Keep original title
                        商品説明: formData.商品説明,
                        商品分類: formData.商品分類,
                        提供開始日: formData.提供開始日,
                        提供終了日: formData.提供終了日,
                        数量: formData.数量?.toString(),
                        単位: formData.単位,
                        提供者の連絡先: formData.提供者の連絡先,
                        提供元の住所: formData.提供元の住所,
                        作業所長名: formData.作業所長名
                    }
                };

                const result = await updateProduct(product.title, updateData.fields);

                if (result.success) {
                    alert('更新が完了しました');
                    onClose();
                    window.location.href = '/pinterest';
                } else {
                    throw new Error(result.message || '更新に失敗しました');
                }
            } catch (error) {
                console.error('Update error:', error);
                alert('更新に失敗しました: ' + error.message);
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
                                    disabled={true}  // Make title non-editable
                                    readOnly={true}
                                />
                                {errors.商品名 && <ErrorMessage>{errors.商品名}</ErrorMessage>}
                            </InputWrapper>
                        </FormGroup>

                        <FormGroup>
                            <Label>商品説明</Label>
                            <InputWrapper>
                                <TextArea
                                    value={formData.商品説明}
                                    onChange={e => setFormData(prev => ({ ...prev, 商品説明: e.target.value }))}
                                />
                            </InputWrapper>
                        </FormGroup>
                    </FormSection>

                    <FormSection>

                        <FormGroup>
                            <Label>提供開始日</Label>
                            <InputWrapper>
                                <Input
                                    type="date"
                                    value={formData.提供開始日}
                                    onChange={e => setFormData(prev => ({ ...prev, 提供開始日: e.target.value }))}
                                />
                            </InputWrapper>
                        </FormGroup>

                        <FormGroup>
                            <Label>提供終了日</Label>
                            <InputWrapper>
                                <Input
                                    type="date"
                                    value={formData.提供終了日}
                                    onChange={e => setFormData(prev => ({ ...prev, 提供終了日: e.target.value }))}
                                />
                                {errors.提供終了日 && <ErrorMessage>{errors.提供終了日}</ErrorMessage>}
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
                                    onChange={e => setFormData(prev => ({ ...prev, 提供者の連絡先: e.target.value }))}
                                />
                            </InputWrapper>
                        </FormGroup>

                        <FormGroup>
                            <Label>提供元の住所</Label>
                            <InputWrapper>
                                <Input
                                    type="text"
                                    value={formData.提供元の住所}
                                    onChange={e => setFormData(prev => ({ ...prev, 提供元の住所: e.target.value }))}
                                />
                            </InputWrapper>
                        </FormGroup>

                        <FormGroup>
                            <Label>作業所長名</Label>
                            <InputWrapper>
                                <Input
                                    type="text"
                                    value={formData.作業所長名}
                                    onChange={e => setFormData(prev => ({ ...prev, 作業所長名: e.target.value }))}
                                />
                            </InputWrapper>
                        </FormGroup>
                    </FormSection>

                    <FormSection>
                        <FormGroup>
                            <Label>商品写真更新</Label>
                            <InputWrapper>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                                {imagePreview && (
                                    <ImagePreview>
                                        <img src={imagePreview} alt="商品画像プレビュー" />
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
                            {isSubmitting ? '更新中...' : '更新'}
                        </Button>
                    </ButtonGroup>
                </Form>
            </ModalContent>
        </ModalOverlay>
    );
}

export default EditProductModal;