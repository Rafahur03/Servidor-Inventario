import express from 'express';
import { iniciaSesion, crearUsuario } from '../controllers/controllersUsuarios.js';

const router = express.Router()

router.post('/', iniciaSesion)

router.post('/crearUsuario', crearUsuario)


export default  router