const path = require('path');
const { config } = require('dotenv');
const { Service } = require('node-windows');

config();
// Configurar el servicio de Windows
var svc = new Service({
  name: 'ServidorInventario',
  script: path.resolve(__dirname, 'index.js'), // Ruta completa al script principal de tu aplicación
});

// Desinstalar el servicio
// Listen for the "uninstall" event so we know when it's done.
svc.on('uninstall',function(){
  console.log('Uninstall complete.');
  console.log('The service exists: ',svc.exists);
});

// Uninstall the service.
svc.uninstall();
