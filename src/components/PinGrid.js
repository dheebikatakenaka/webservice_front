// PinGrid.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Pin from './Pin';
import { getImagesFromS3 } from '../services/s3Service';
import api from '../api/config';

const GridContainer = styled.div`
  width: 95%;
  margin: 0 auto;
  columns: ${props => props.showAll ? '6 200px' : '3 300px'};
  column-gap: 16px;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 20px;
  font-size: 16px;
`;

const PinGrid = ({ limit, showAll, excludeId, noTransition }) => {
    const [pins, setPins] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchImages = async () => {
        try {
            const images = await getImagesFromS3();
            console.log('Fetched images:', images);
            setPins(images);
        } catch (err) {
            console.error('Error loading images:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    // Handle delete success
    const handleDeleteSuccess = async (deletedId) => {
        console.log('Handling delete success for ID:', deletedId);
        await fetchImages(); // Refresh the grid
    };

    // Filter and limit the pins
    const displayPins = React.useMemo(() => {
        let filtered = pins;

        // Filter out excluded ID if provided
        if (excludeId) {
            filtered = filtered.filter(pin => pin.id !== excludeId);
        }

        // Limit the number of pins if specified
        if (!showAll && limit) {
            filtered = filtered.slice(0, limit);
        }

        return filtered;
    }, [pins, excludeId, showAll, limit]);

    if (loading) {
        return <LoadingMessage>読み込み中...</LoadingMessage>;
    }

    return (
        <GridContainer showAll={showAll}>
            {displayPins.map(pin => (
                <Pin
                    key={pin.id}
                    id={pin.id}
                    image={pin.image || '/placeholder.png'}
                    title={pin.title}
                    description={pin.description}
                    category={pin.category}
                    startDate={pin.startDate}
                    endDate={pin.endDate}
                    quantity={pin.quantity}
                    unit={pin.unit}
                    contactInfo={pin.contactInfo}
                    address={pin.address}
                    managerName={pin.managerName}
                    onDeleteSuccess={handleDeleteSuccess}
                    refreshGrid={fetchImages}
                />
            ))}
        </GridContainer>
    );
};

export default PinGrid;