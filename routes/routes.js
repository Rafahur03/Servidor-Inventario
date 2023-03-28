import express from 'express';
import { iniciaSesion, crearUsuario, actualizaUsuario } from '../controllers/controllersUsuarios.js';
import { consultarActivosTodos, crearActivo, actualizarActivo } from '../controllers/controllersActivos.js';
import {checkAuth, checkAuthImage} from '../middleware/authMiddlewareUsuario.js';
const router = express.Router()

// router inicio sesion y administration de usuarios

router.post('/', iniciaSesion)

router.post('/crearUsuario', checkAuth, crearUsuario)

router.post('/actualizaPerfil', checkAuth, actualizaUsuario)

// ruta de manejo de activos

router.get('/consultarActivosTodos', checkAuth, consultarActivosTodos)

router.post('/crearActivos', checkAuthImage, crearActivo)

router.post('/actualizarActivo', checkAuthImage, actualizarActivo)

export default  router