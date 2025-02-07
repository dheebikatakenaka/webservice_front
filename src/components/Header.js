import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MdAdd, MdSearch } from 'react-icons/md';
import { getImagesFromS3 } from '../services/s3Service';
import api from '../api/config';
import logoImage from '../images/button.png';

const HeaderContainer = styled.header`
  height: 100px;
  padding: 10px 40px;
  background: transparent;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: all 0.3s ease;

  &.scrolled {
    background: #fff;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    height: 70px;
  }

  @media (max-width: 1024px) {
    padding: 10px 20px;
  }

  @media (max-width: 768px) {
    height: 80px;
    padding: 10px 15px;
  }
`;

const Logo = styled(Link)`
  position: fixed;
  top: 10px;
  left: 40px;
  margin: 0;
  z-index: 1001;
  transition: all 0.3s ease;

  img {
    height: 125px;
    width: auto;
    display: block;
    transition: all 0.3s ease;
  }

  header.scrolled ~ & img {
    height: 70px;
  }

  @media (max-width: 1024px) {
    left: 20px;
  }

  @media (max-width: 768px) {
    top: 5px;
    left: 15px;

    img {
      height: 80px;
    }

    header.scrolled ~ & img {
      height: 60px;
    }
  }
`;

const Nav = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  margin-left: auto;
  width: fit-content;

  @media (max-width: 1024px) {
    gap: 16px;
  }

  @media (max-width: 768px) {
    gap: 12px;
  }
`;

const SearchContainer = styled.div`
  width: 300px;
  margin: 0 24px;
  position: relative;
  flex-shrink: 0;

  @media (max-width: 1024px) {
    width: 250px;
    margin: 0 16px;
  }

  @media (max-width: 768px) {
    width: 200px;
    margin: 0 12px;
  }
`;

const SearchInput = styled.input`
  width: 75%;
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

  @media (max-width: 768px) {
    padding: 8px 40px;
    font-size: 14px;
  }
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
  white-space: nowrap;
  flex-shrink: 0;
  
  &:hover {
    background-color: #0A8F96;
  }

  svg {
    width: 20px;
    height: 20px;
  }

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 14px;

    svg {
      width: 16px;
      height: 16px;
    }
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
  white-space: nowrap;
  flex-shrink: 0;
  
  &:hover {
    background-color: #333333;
  }

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 14px;
  }
`;
const StyledLink = styled(Link)`
  color: black;
  text-decoration: none;
  font-weight: ${props => props.$active ? '600' : 'normal'};
  font-size: 16px;
  white-space: nowrap;
  
  &:hover {
    text-decoration: underline;
  }

  @media (max-width: 768px) {
    font-size: 14px;
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

  @media (max-width: 768px) {
    width: 16px;
    height: 16px;
    left: 12px;
  }
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

  @media (max-width: 768px) {
    padding: 8px 12px;
    gap: 8px;
  }
`;

const ResultImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
  }
`;

const ResultInfo = styled.div`
  flex: 1;
`;

const ResultTitle = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 16px;

  @media (max-width: 768px) {
    font-size: 14px;
    margin-bottom: 2px;
  }
`;

const NoResults = styled.div`
  padding: 16px;
  text-align: center;
  color: #666;
  font-size: 14px;

  @media (max-width: 768px) {
    padding: 12px;
    font-size: 13px;
  }
`;

function Header({ onAddProduct }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const searchContainerRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await getImagesFromS3();
        const mappedProducts = products.map(product => ({
          id: product.id,
          title: product.title,
          url: product.image,
          description: product.description
        }));
        setAllProducts(mappedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

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

  const isActivePath = (path) => {
    const currentPath = location.pathname.replace('/pinterest', '');
    return currentPath === path;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <Logo to="/">
        <img src={logoImage} alt="Logo" />
      </Logo>
      <HeaderContainer className={isScrolled ? 'scrolled' : ''}>
        <Nav>
          <StyledLink to="/" $active={isActivePath('/')}>
            ホーム
          </StyledLink>
          <ItemsButton to="/products">アイテムを探す</ItemsButton>
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
                            e.target.src = '/placeholder.png';
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
          <AddButton onClick={onAddProduct}>
            <MdAdd />
            商品追加
          </AddButton>
        </Nav>
      </HeaderContainer>
    </>
  );
}

export default Header;