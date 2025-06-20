import React from 'react';
import { Box, Skeleton, Grid, Card, CardContent } from '@mui/material';

export const SkeletonLoader: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Header Skeleton */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Skeleton height={40} variant="text" width="40%" />
              <Skeleton height={40} sx={{ mt: 2 }} variant="rectangular" />
            </CardContent>
          </Card>
        </Grid>

        {/* Filter Bar Skeleton */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Skeleton height={56} variant="rectangular" width={200} />
            <Skeleton height={56} variant="rectangular" width={200} />
            <Skeleton height={56} variant="rectangular" width="100%" />
          </Box>
        </Grid>

        {/* Main Content Skeleton */}
        <Grid item md={8} xs={12}>
          <Card>
            <CardContent>
              <Skeleton height={32} variant="text" width="30%" />
              <Grid container spacing={2} sx={{ mt: 2 }}>
                {[1, 2, 3, 4].map(index => (
                  <Grid key={index} item sm={6} xs={12}>
                    <Card>
                      <CardContent>
                        <Skeleton variant="text" width="60%" />
                        <Skeleton variant="text" width="40%" />
                        <Skeleton variant="text" width="80%" />
                        <Box sx={{ mt: 2 }}>
                          <Skeleton height={36} variant="rectangular" />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar Stats Skeleton */}
        <Grid item md={4} xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Skeleton height={32} variant="text" width="40%" />
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    {[1, 2, 3, 4].map(index => (
                      <Grid key={index} item xs={6}>
                        <Skeleton height={100} variant="rectangular" />
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Skeleton height={32} variant="text" width="40%" />
                  <Skeleton height={300} sx={{ mt: 2 }} variant="rectangular" />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};
