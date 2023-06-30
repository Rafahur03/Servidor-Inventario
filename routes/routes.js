import express from 'express';
import { iniciaSesion, crearUsuario, actualizaUsuario } from '../controllers/controllersUsuarios.js';
import {checkAuth} from '../middleware/authMiddlewareUsuario.js';
import {
    consultarActivosTodos,
    consultarListasConfActivos,
    crearActivo,
    actualizarActivo,
    cambiarClasificacion,
    eliminarActivo,
    consultarActivo,
    guardarImagenActivo,
    eliminarImagenActivo,
    eliminarDocumento,
    descargarDocumento,
    guardarDocumento,
    descargarHojaDeVida
} from '../controllers/controllersActivos.js'

import { consultarSolicitudTodos,
    crearSolicitud,
    modificarSolicitud,
    eliminarSolicitud,
    consultarSolicitud } from '../controllers/controllerSolicitudSoporte.js'

import { consultarReportesTodos,
    consultarReporte,
    crearReporte,
    modificarReporte } from '../controllers/controllersReportes.js'

import { consultarconfig,
    actualizarConfig,
    crearConfig } from '../controllers/controlerConfig.js';

import { eliminarComponente, guardarComponente  } from '../controllers/controllerComponentes.js';

import { probarfechas } from '../controllers/probarfechas.js';

const router = express.Router()

// router inicio sesion y administration de usuarios

router.post('/', iniciaSesion)

router.post('/crearUsuario', checkAuth, crearUsuario)

router.post('/actualizaPerfil', checkAuth, actualizaUsuario)

// ruta de manejo de activos

router.get('/consultarActivosTodos', checkAuth, consultarActivosTodos)

router.get('/consultarListasConfActivos', checkAuth, consultarListasConfActivos)

router.post('/consultarActivo', checkAuth, consultarActivo)

router.post('/crearActivos', checkAuth, crearActivo)

router.post('/actualizarActivo', checkAuth, actualizarActivo)

router.post('/cambiarClasificacion', checkAuth, cambiarClasificacion)

router.post('/eliminarActivo', checkAuth, eliminarActivo)

router.post('/guardarImagenActivo', checkAuth, guardarImagenActivo)

router.delete('/eliminarImagenActivo', checkAuth, eliminarImagenActivo)

router.delete('/eliminarDocumento', checkAuth, eliminarDocumento)

router.post('/descargarDocumento', checkAuth, descargarDocumento)

router.post('/guardarDocumento', checkAuth, guardarDocumento)

router.post('/descargarHojaDeVida', checkAuth, descargarHojaDeVida)

// ruta de solicitudes de soporte 

router.get('/consultarSoportesTodos', checkAuth, consultarSolicitudTodos)

router.post('/consultarSolicitud', checkAuth, consultarSolicitud)

router.post('/crearSolicitud', checkAuth, crearSolicitud)

router.post('/modificarSolicitud', checkAuth, modificarSolicitud)

router.post('/eliminarSolicitud', checkAuth, eliminarSolicitud)


// router reportes

router.get('/consultarReportesTodos', checkAuth, consultarReportesTodos)

router.post('/consultarReporte', checkAuth, consultarReporte)

router.post('/crearReporte', checkAuth, crearReporte)

router.post('/modificarReporte', checkAuth, modificarReporte)

// router configuraciones
router.post('/consultarconfig', checkAuth, consultarconfig)

router.post('/actualizarConfig', checkAuth, actualizarConfig)

router.post('/crearConfig', checkAuth, crearConfig)

router.post('/probarfechas', probarfechas)


// ruta componente 

router.delete('/eliminarComponente', checkAuth, eliminarComponente)

router.post('/guardarComponente', checkAuth, guardarComponente)

export default  router