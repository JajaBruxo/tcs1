const express = require('express');
const cors = require('cors');
const path = require('path');
const presetsRoutes = require('./routes/presetsRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Servir os ficheiros estáticos do front-end (src/cliente)
app.use(express.static(path.join(__dirname, '../cliente')));

// Rotas da API REST
app.use('/api/presets', presetsRoutes);

// Tratamento consistente para rotas de API não encontradas
app.use('/api/*', (req, res) => {
  res.status(404).json({
    status: 'error',
    code: 404,
    message: 'Endpoint não encontrado na API.'
  });
});

app.listen(PORT, () => {
  console.log(`Servidor WebSampler e API REST ativos em http://localhost:${PORT}`);
});