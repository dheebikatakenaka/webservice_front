const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    region: 'ap-northeast-1'
});

async function testS3Access() {
    try {
        console.log('Testing S3 access...');
        
        const data = await s3.listObjects({
            Bucket: 'my-lists-images'
        }).promise();
        
        console.log('S3 access successful!');
        console.log('Files in bucket:', data.Contents.map(item => item.Key));
    } catch (error) {
        console.error('S3 access failed:', error);
    }
}

testS3Access();