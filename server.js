const app = require('./app'); // This imports your Express app
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Hello from your server!');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port  ${PORT}`);
});