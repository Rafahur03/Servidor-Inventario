import express from 'express';
import { iniciaSesion, crearUsuario, actualizaUsuario } from '../controllers/controllersUsuarios.js';
import { consultarActivosTodos, crearActivo } from '../controllers/controllersActivos.js';

const router = express.Router()

// router inicio sesion y administration de usuarios

router.post('/', iniciaSesion)

router.post('/crearUsuario', crearUsuario)

router.post('/actualizaPerfil', actualizaUsuario)

// ruta de manejo de activos

router.get('/consultarActivosTodos', consultarActivosTodos)

router.post('/crearActivos', crearActivo)

export default  router