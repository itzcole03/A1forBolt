import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';

interface Headline {
  id: string;
  title: string;
  source: string;
  timestamp: string;
}

export const ESPNHeadlinesTicker: React.FC = () => {
  const [position, setPosition] = useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  const { data: headlines = [] } = useQuery<Headline[]>({
    queryKey: ['headlines'],
    queryFn: async () => {
      // TODO: Implement API call to fetch headlines
      return [
        {
          id: '1',
          title: 'Breaking: Major trade in the NBA',
          source: 'ESPN',
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Injury update: Star player expected to return',
          source: 'ESPN',
          timestamp: new Date().toISOString(),
        },
        {
          id: '3',
          title: 'Game preview: Key matchup tonight',
          source: 'ESPN',
          timestamp: new Date().toISOString(),
        },
      ];
    },
  });

  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;
    const contentWidth = contentRef.current.offsetWidth;

    const animate = () => {
      setPosition(prev => {
        const newPosition = prev - 1;
        if (newPosition <= -contentWidth) {
          return containerWidth;
        }
        return newPosition;
      });
    };

    const interval = setInterval(animate, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
        height: 40,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderRadius: 1,
      }}
    >
      <Box
        ref={contentRef}
        sx={{
          position: 'absolute',
          whiteSpace: 'nowrap',
          transform: `translateX(${position}px)`,
          display: 'flex',
          alignItems: 'center',
          height: '100%',
        }}
      >
        {headlines.map(headline => (
          <Box
            key={headline.id}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              mr: 4,
            }}
          >
            <Typography
              sx={{
                color: 'text.primary',
                fontWeight: 'medium',
              }}
              variant="body2"
            >
              {headline.title}
            </Typography>
            <Typography
              sx={{
                color: 'text.secondary',
                ml: 1,
              }}
              variant="caption"
            >
              • {headline.source}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
