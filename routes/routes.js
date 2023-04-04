import express from 'express';
import { iniciaSesion, crearUsuario, actualizaUsuario } from '../controllers/controllersUsuarios.js';
import {checkAuth} from '../middleware/authMiddlewareUsuario.js';
import {
    consultarActivosTodos,
    crearActivo,
    actualizarActivo,
    cambiarClasificacion,
    eliminarActivo,
    consultarActivo} from '../controllers/controllersActivos.js';
import { consultarSoportesTodos,
    crearSolicitud,
    modificarSolicitud,
    eliminarSolicitud } from '../controllers/controllerSolicitudSoporte.js';


const router = express.Router()

// router inicio sesion y administration de usuarios

router.post('/', iniciaSesion)

router.post('/crearUsuario', checkAuth, crearUsuario)

router.post('/actualizaPerfil', checkAuth, actualizaUsuario)

// ruta de manejo de activos

router.get('/consultarActivosTodos', checkAuth, consultarActivosTodos)

router.post('/consultarActivo', checkAuth, consultarActivo)

router.post('/crearActivos', checkAuth, crearActivo)

router.post('/actualizarActivo', checkAuth, actualizarActivo)

router.post('/cambiarClasificacion', checkAuth, cambiarClasificacion)

router.post('/eliminarActivo', checkAuth, eliminarActivo)


// ruta de solicitudes de soporte 

router.get('/consultarSoportesTodos', checkAuth, consultarSoportesTodos)

router.post('/crearSolicitud', checkAuth, crearSolicitud)

router.post('/modificarSolicitud', checkAuth, modificarSolicitud)

router.post('/eliminarSolicitud', checkAuth, eliminarSolicitud)

export default  router