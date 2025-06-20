import React from 'react';
import { Skeleton as MuiSkeleton, Box } from '@mui/material';

interface SkeletonProps {
  variant?: 'text' | 'rectangular' | 'circular';
  width?: number | string;
  height?: number | string;
  animation?: 'pulse' | 'wave' | false;
}

const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rectangular',
  width = '100%',
  height = 20,
  animation = 'wave',
}) => {
  return (
    <Box sx={{ width, height }}>
      <MuiSkeleton animation={animation} height={height} variant={variant} width={width} />
    </Box>
  );
};

export default React.memo(Skeleton);
