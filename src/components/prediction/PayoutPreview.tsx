import React from "react";
import { Box, Typography } from "@mui/material";

interface PayoutPreviewProps {
  payout: number;
}

const PayoutPreview: React.FC<PayoutPreviewProps> = ({ payout }) => (
  <Box mt={1} mb={1}>
    <Typography variant="subtitle2">Payout Preview</Typography>
    <Typography variant="h5" color="primary">
      ${payout.toFixed(2)}
    </Typography>
  </Box>
);

export default PayoutPreview;
