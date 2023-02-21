import express from 'express';
import { iniciaSesion, crearUsuario, actualizaUsuario } from '../controllers/controllersUsuarios.js';

const router = express.Router()

router.post('/', iniciaSesion)

router.post('/crearUsuario', crearUsuario)

router.post('/actualizaPerfil', actualizaUsuario)

export default  router