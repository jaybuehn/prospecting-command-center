const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

// Simple root endpoint. In a full implementation this would serve
// the web application UI.
app.get('/', (req, res) => {
  res.send('Prospecting Command Center placeholder');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
