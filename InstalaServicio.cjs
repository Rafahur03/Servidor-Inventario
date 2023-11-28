const path = require('path');
const { config } = require('dotenv');
const { Service } = require('node-windows');

// Cargar variables de entorno desde el archivo .env
config();
// Configurar el servicio de Windows
var svc = new Service({
  name: 'ServidorInventario',
  description: 'Servicio ejecuta el servidor de la APP servidor inventario de CLIOF',
  script: path.resolve(__dirname, 'index.js'), // Ruta completa al script principal de tu aplicació
});


svc.on('install',function(){
  svc.start();
});

svc.install();