const API_BASE_URL = 'http://172.16.50.168:3000';

export const getImagesFromS3 = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/products`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const productsArray = Array.isArray(data) ? data : [data];

        return productsArray.map(item => ({
            id: item.Title,
            title: item.Title,
            image: item.画像URL,
            description: item.商品説明 || '',
            category: item.商品分類 || '',
            startDate: item.提供開始日 || '',
            endDate: item.提供終了日 || '',
            quantity: item.数量?.toString() || '',
            unit: item.単位 || '',
            contactInfo: item.提供者の連絡先?.Email || '',
            contactName: item.提供者の連絡先?.LookupValue || '',
            address: item.提供元の住所 || '',
            managerName: item.作業所長名 || '',
            status: item.商品状態 || ''
        }));

    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
};

export const createProduct = async (formData) => {
    try {
        const uploadData = new FormData();

        if (formData.画像) {
            uploadData.append('image', formData.画像);
        }

        const productData = {
            商品名: formData.商品名,
            商品説明: formData.商品説明 || '',
            商品分類: formData.商品分類 || '',
            提供開始日: formData.提供開始日 || '',
            提供終了日: formData.提供終了日 || '',
            数量: formData.数量 || '',
            単位: formData.単位 || '',
            提供者の連絡先: formData.提供者の連絡先 || '',
            提供元の住所: formData.提供元の住所 || '',
            作業所長名: formData.作業所長名 || ''
        };

        uploadData.append('data', JSON.stringify(productData));

        const response = await fetch(`${API_BASE_URL}/api/products/create`, {
            method: 'POST',
            body: uploadData
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || `HTTP error! status: ${response.status}`);
        }

        return result;
    } catch (error) {
        console.error('Error creating product:', error);
        throw error;
    }
};

export const updateProduct = async (itemId, fields, newImage = null) => {
    try {
        const updateData = {
            itemId,
            fields: {
                商品名: fields.商品名,
                商品説明: fields.商品説明 || '',
                商品分類: fields.商品分類 || '',
                提供開始日: fields.提供開始日 || '',
                提供終了日: fields.提供終了日 || '',
                数量: fields.数量?.toString() || '',
                単位: fields.単位 || '',
                提供者の連絡先: fields.提供者の連絡先 || '',
                提供元の住所: fields.提供元の住所 || '',
                作業所長名: fields.作業所長名 || ''
            }
        };

        console.log('Sending update request:', updateData);

        const response = await fetch(`${API_BASE_URL}/api/products/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error updating product:', error);
        throw error;
    }
};

export const deleteProduct = async (title) => {
    try {
        const encodedTitle = encodeURIComponent(title);
        const response = await fetch(`${API_BASE_URL}/api/products/delete/${encodedTitle}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || `HTTP error! status: ${response.status}`);
        }

        return result;
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
};