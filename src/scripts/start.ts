import { app } from '../index';

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Health check available at http://localhost:${port}/health`);
  console.log(`API endpoints available at http://localhost:${port}/api/predictions`);
});
