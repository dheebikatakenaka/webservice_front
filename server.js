const express = require('express');
const { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const cors = require('cors');
const path = require('path');
const fileUpload = require('express-fileupload');

// Initialize express app
const app = express();

// Middleware setup
app.use(cors({
    origin: ['http://172.16.50.168:3000', 'http://localhost:3000', 'https://d1r7jlana2z5u0.cloudfront.net'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Add specific OPTIONS handling
app.options('/api/products/update', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
    createParentPath: true,
    limits: { 
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    abortOnLimit: true,
    responseOnLimit: "File size is too large"
}));
app.use(express.static(path.join(__dirname, 'build')));

// Initialize S3 client
const s3Client = new S3Client({ 
    region: 'ap-northeast-1'
});

// Test endpoint
app.get('/test', (req, res) => {
    res.json({ message: 'Server is working' });
});

// Generate presigned URL helper function
const generatePresignedUrl = async (key) => {
    try {
        const actualKey = key.includes('/') ? key.split('/').pop() : key;
        const command = new GetObjectCommand({
            Bucket: 'my-lists-images',
            Key: actualKey
        });
        return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    } catch (error) {
        console.error('Error generating presigned URL:', error);
        return null;
    }
};

// Get products endpoint
app.get('/api/products', async (req, res) => {
    try {
        console.log('Fetching from S3...');
        const command = new GetObjectCommand({
            Bucket: 'my-lists-images',
            Key: 'products.json'
        });
        
        const response = await s3Client.send(command);
        const rawData = await response.Body.transformToString();
        const cleanData = rawData.trim().replace(/^\uFEFF/, '');
        let products = JSON.parse(cleanData);

        if (!Array.isArray(products)) {
            products = [products];
        }

        // Generate presigned URLs for each product's image
        const productsWithSignedUrls = await Promise.all(products.map(async (product) => {
            if (product.画像URL) {
                const signedUrl = await generatePresignedUrl(product.画像URL);
                return {
                    ...product,
                    画像URL: signedUrl || product.画像URL
                };
            }
            return product;
        }));

        console.log(`Found ${productsWithSignedUrls.length} products`);
        res.json(productsWithSignedUrls);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create product endpoint
app.post('/api/products/create', async (req, res) => {
    try {
        const productData = JSON.parse(req.body.data);

        // Handle image upload
        let imageKey = '';
        if (req.files && req.files.image) {
            const imageFile = req.files.image;
            imageKey = `${productData.商品名}-${Date.now()}${path.extname(imageFile.name)}`;
            
            const putCommand = new PutObjectCommand({
                Bucket: 'my-lists-images',
                Key: imageKey,
                Body: imageFile.data,
                ContentType: imageFile.mimetype
            });
            await s3Client.send(putCommand);
        }

        // Get current products.json
        const getCommand = new GetObjectCommand({
            Bucket: 'my-lists-images',
            Key: 'products.json'
        });
        const response = await s3Client.send(getCommand);
        const data = await response.Body.transformToString();

        let products = JSON.parse(data.replace(/^\uFEFF/, ''));
        if (!Array.isArray(products)) {
            products = [products];
        }

        // Create new product
        const newProduct = {
            Title: productData.商品名,
            商品説明: productData.商品説明 || '',
            商品分類: productData.商品分類 || '',
            提供開始日: productData.提供開始日 || '',
            提供終了日: productData.提供終了日 || '',
            数量: productData.数量 || '',
            単位: productData.単位 || '',
            提供者の連絡先: {
                Email: productData.提供者の連絡先 || '',
                LookupValue: productData.提供者の連絡先 || ''
            },
            提供元の住所: productData.提供元の住所 || '',
            作業所長名: productData.作業所長名 || '',
            画像URL: imageKey,
            ModifiedDate: new Date().toISOString(),
            LastUpdatedFrom: 'Website'
        };

        products.push(newProduct);

        const updateCommand = new PutObjectCommand({
            Bucket: 'my-lists-images',
            Key: 'products.json',
            Body: JSON.stringify(products),
            ContentType: 'application/json'
        });
        await s3Client.send(updateCommand);

        // Generate presigned URL for response
        const signedUrl = imageKey ? await generatePresignedUrl(imageKey) : '';
        const responseProduct = {
            ...newProduct,
            画像URL: signedUrl
        };

        res.json({
            success: true,
            message: '商品が作成されました',
            product: responseProduct
        });

    } catch (error) {
        console.error('Create error:', error);
        res.status(500).json({
            success: false,
            message: '作成に失敗しました: ' + error.message
        });
    }
});

// Delete product endpoint
app.delete('/api/products/delete/:title', async (req, res) => {
    try {
        const productTitle = decodeURIComponent(req.params.title);
        console.log('Deleting product:', productTitle);

        const getCommand = new GetObjectCommand({
            Bucket: 'my-lists-images',
            Key: 'products.json'
        });
        const response = await s3Client.send(getCommand);
        const data = await response.Body.transformToString();

        let products = JSON.parse(data.replace(/^\uFEFF/, ''));
        if (!Array.isArray(products)) {
            products = [products];
        }

        const productToDelete = products.find(p => p.Title === productTitle);
        
        if (!productToDelete) {
            return res.json({
                success: true,
                message: '商品は既に削除されています'
            });
        }

        // Delete image if exists
        if (productToDelete.画像URL) {
            try {
                const deleteImageCommand = new DeleteObjectCommand({
                    Bucket: 'my-lists-images',
                    Key: productToDelete.画像URL
                });
                await s3Client.send(deleteImageCommand);
            } catch (error) {
                console.error('Image deletion error:', error);
            }
        }

        const updatedProducts = products.filter(p => p.Title !== productTitle);
        const updateCommand = new PutObjectCommand({
            Bucket: 'my-lists-images',
            Key: 'products.json',
            Body: JSON.stringify(updatedProducts),
            ContentType: 'application/json'
        });
        await s3Client.send(updateCommand);

        res.json({
            success: true,
            message: '商品が削除されました'
        });

    } catch (error) {
        console.error('Server error:', error);
        res.json({
            success: true,
            message: '商品は既に削除されています'
        });
    }
});

// Edit product endpoint
app.post('/api/products/update', async (req, res) => {
    try {
        const { itemId, fields } = req.body;

        // Get current products.json
        const data = await s3.getObject({
            Bucket: 'my-lists-images',
            Key: 'products.json'
        }).promise();

        let products = JSON.parse(data.Body.toString('utf-8').replace(/^\uFEFF/, ''));
        if (!Array.isArray(products)) {
            products = [products];
        }

        // Find product to update
        const productIndex = products.findIndex(p => p.Title === itemId);
        if (productIndex === -1) {
            throw new Error('商品が見つかりません');
        }

        // Update product
        products[productIndex] = {
            ...products[productIndex],
            Title: itemId,
            商品説明: fields.商品説明,
            提供開始日: fields.提供開始日,
            提供終了日: fields.提供終了日,
            提供者の連絡先: {
                Email: fields.提供者の連絡先,
                LookupValue: products[productIndex].提供者の連絡先?.LookupValue
            },
            提供元の住所: fields.提供元の住所,
            作業所長名: fields.作業所長名,
            ModifiedDate: new Date().toISOString(),
            LastUpdatedFrom: 'Website'
        };

        // Save updated products.json
        await s3.putObject({
            Bucket: 'my-lists-images',
            Key: 'products.json',
            Body: JSON.stringify(products),
            ContentType: 'application/json'
        }).promise();

        res.json({
            success: true,
            message: '更新が完了しました',
            updatedProduct: products[productIndex]
        });

    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({
            success: false,
            message: '更新に失敗しました: ' + error.message
        });
    }
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});