import React from 'react';
import styled from 'styled-components';
import PinGrid from '../components/PinGrid';

const HomeContainer = styled.div`
  padding-top: 120px;
  text-align: center;
`;

const WelcomeText = styled.h1`
  font-size: 60px;
  margin-bottom: 40px;
  font-weight: 600;
`;

function Home() {
  return (
    <HomeContainer>
      <WelcomeText>建材マッチングプラットフォーム</WelcomeText>
      <PinGrid limit={10} showAll={false} />
    </HomeContainer>
  );
}

export default Home;