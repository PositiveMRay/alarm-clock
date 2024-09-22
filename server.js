const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname)));

// Serve the index.html file at the root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
