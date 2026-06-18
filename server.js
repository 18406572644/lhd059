const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./src/config/database');
const routes = require('./src/routes');

const app = express();
const PORT = process.env.PORT || 3000;

initDatabase();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`漂流瓶服务已启动: http://localhost:${PORT}`);
});

