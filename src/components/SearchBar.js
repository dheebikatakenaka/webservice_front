import React, { useState } from 'react';
import styled from 'styled-components';
import api from '../api/config';

const SearchInput = styled.input`
  padding: 0.5rem;
  border-radius: 24px;
  border: 1px solid #ddd;
  width: 250px;
`;

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    navigate(`/products?search=${encodeURIComponent(e)}`);
    // e.preventDefault();
    console.log('Searching for:', e);
  };

  return (
    <form onSubmit={handleSearch}>
      <SearchInput
        type="text"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </form>
  );
};

export default SearchBar;