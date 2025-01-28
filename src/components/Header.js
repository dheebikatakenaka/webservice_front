import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MdAdd, MdSearch } from 'react-icons/md';
import { getImagesFromS3 } from '../services/s3Service';
import api from '../api/config';

const HeaderContainer = styled.header`
  height: 56px;
  padding: 4px 16px;
  background: white;
  display: flex;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  border-bottom: 1px solid #efefef;
`;

const Logo = styled(Link)`
  color: #0A8F96;
  font-weight: bold;
  font-size: 20px;
  text-decoration: none;
  padding: 0 16px;
  min-width: fit-content;
`;

const Nav = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  min-width: fit-content;
`;

const StyledLink = styled(Link)`
  color: black;
  text-decoration: none;
  font-weight: ${props => props.$active ? '600' : 'normal'};
  font-size: 16px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ItemsButton = styled(Link)`
  background-color: #000000;
  color: white;
  padding: 8px 16px;
  border-radius: 24px;
  text-decoration: none;
  font-weight: 600;
  font-size: 16px;
  
  &:hover {
    background-color: #333333;
  }
`;

const SearchContainer = styled.div`
  flex: 1;
  margin: 0 16px;
  position: relative;
  max-width: 800px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 48px;
  border-radius: 24px;
  border: 2px solid #efefef;
  background-color: #efefef;
  font-size: 16px;
  
  &:focus {
    border-color: #0A8F96;
    background-color: white;
    outline: none;
  }

  &::placeholder {
    color: #666;
  }
`;

const StyledSearchIcon = styled(MdSearch)`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  width: 20px;
  height: 20px;
`;

const SearchResults = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  margin-top: 8px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
`;

const SearchResultItem = styled.div`
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #f0f0f0;
  }
`;

const ResultImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
`;

const ResultInfo = styled.div`
  flex: 1;
`;

const ResultTitle = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
`;

const NoResults = styled.div`
  padding: 16px;
  text-align: center;
  color: #666;
`;

const Right = styled.div`
  margin-left: auto;
  display: flex;
  gap: 8px;
  min-width: fit-content;
`;

const AddButton = styled.button`
  background-color: #0A8F96;
  color: white;
  padding: 8px 16px;
  border-radius: 24px;
  border: none;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &:hover {
    background-color: #0A8F96;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

function Header({ onAddProduct }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const searchContainerRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Update useEffect to handle data mapping
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await getImagesFromS3();
        // Map the products to match the search result structure
        const mappedProducts = products.map(product => ({
          id: product.id,
          title: product.title,
          url: product.image, // Update to use the correct image URL
          description: product.description
        }));
        setAllProducts(mappedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  // Update handleResultClick to use correct path
  const handleResultClick = (product) => {
    navigate(`/product/${product.id}`, { 
      state: { 
        id: product.id,
        image: product.url,
        title: product.title,
        description: product.description
      }
    });
    setShowResults(false);
    setSearchQuery('');
  };

  // Update search logic
  const handleSearch = (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const filtered = allProducts.filter(product => 
      product.title.toLowerCase().includes(query.toLowerCase()) ||
      product.description?.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filtered);
    setShowResults(true);
  };

  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    handleSearch(query);
  };

  // Check if current path matches (considering /pinterest basename)
  const isActivePath = (path) => {
    const currentPath = location.pathname.replace('/pinterest', '');
    return currentPath === path;
  };

  return (
    <HeaderContainer>
      <Logo to="/">商品</Logo>
      <Nav>
        <StyledLink 
          to="/" 
          $active={isActivePath('/')}
        >
          ホーム
        </StyledLink>
        <ItemsButton to="/products">アイテムを探す</ItemsButton>
      </Nav>
      <SearchContainer ref={searchContainerRef}>
        <StyledSearchIcon />
        <SearchInput
          type="text"
          placeholder="商品を検索"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => {
            if (searchQuery) setShowResults(true);
          }}
        />
        {showResults && (
          <SearchResults>
            {searchResults.length > 0 ? (
              searchResults.map(product => (
                <SearchResultItem 
                  key={product.id}
                  onClick={() => handleResultClick(product)}
                >
                  {product.url && (
                    <ResultImage 
                      src={product.url} 
                      alt={product.title}
                      onError={(e) => {
                        console.error('Image load error:', product.url);
                        e.target.src = '/placeholder.png'; // Add a placeholder image
                      }}
                    />
                  )}
                  <ResultInfo>
                    <ResultTitle>{product.title}</ResultTitle>
                  </ResultInfo>
                </SearchResultItem>
              ))
            ) : (
              <NoResults>
                「{searchQuery}」に一致する商品が見つかりませんでした。
              </NoResults>
            )}
          </SearchResults>
        )}
      </SearchContainer>
      <Right>
        <AddButton onClick={onAddProduct}>
          <MdAdd />
          商品追加
        </AddButton>
      </Right>
    </HeaderContainer>
  );
}

export default Header;