export const API_BASE_URL = 'http://172.16.50.168:3000';

// API endpoints
export const API_ENDPOINTS = {
  PRODUCTS: '/api/products',
  CREATE_PRODUCT: '/api/products/create',
  DELETE_PRODUCT: '/api/products/delete',
  UPDATE_PRODUCT: '/api/products/update'
};

// Routes
export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/product/:id'
};

// Error messages
export const ERROR_MESSAGES = {
  FETCH_ERROR: 'データの取得に失敗しました',
  UPDATE_ERROR: '更新に失敗しました',
  DELETE_ERROR: '削除に失敗しました',
  CREATE_ERROR: '作成に失敗しました'
};

// Success messages
export const SUCCESS_MESSAGES = {
  UPDATE: '更新が完了しました',
  DELETE: '削除が完了しました',
  CREATE: '作成が完了しました'
};