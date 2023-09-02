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
    descargarHojaDeVida,
    consultarDatosActivoSolicitud
} from '../controllers/controllersActivos.js'

import { consultarSolicitudTodos,
    crearSolicitud,
    editarSolicitud,
    eliminarSolicitud,
    consultarSolicitud,
    eliminarImagenSolicitud,
    guardarImagenSolicitud,
    descargarSolicitud,
    consultarSolicitudReporte } from '../controllers/controllerSolicitudSoporte.js'

import { consultarReportesTodos,
    consultarReporte,
    crearReporte,
    modificarReporte,
    descargarListaMtto,
    consultarListasCofigReporte,
    eliminarReporte,
    eliminarImagenReporte,
    eliminarSoporteExtReporte,
    guardarImagenReporte,
    guardarSoporteExtReporte,
    descargarReporteExterno,
    descargarReporte } from '../controllers/controllersReportes.js'

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

router.delete('/eliminarActivo', checkAuth, eliminarActivo)

router.post('/guardarImagenActivo', checkAuth, guardarImagenActivo)

router.delete('/eliminarImagenActivo', checkAuth, eliminarImagenActivo)

router.delete('/eliminarDocumento', checkAuth, eliminarDocumento)

router.post('/descargarDocumento', checkAuth, descargarDocumento)

router.post('/guardarDocumento', checkAuth, guardarDocumento)

router.post('/descargarHojaDeVida', checkAuth, descargarHojaDeVida)

router.post('/consultarDatosActivoSolicitud', checkAuth, consultarDatosActivoSolicitud)

// ruta de solicitudes de soporte 

router.get('/consultarSolicitudTodos', checkAuth, consultarSolicitudTodos)

router.post('/consultarSolicitud', checkAuth, consultarSolicitud)

router.post('/crearSolicitud', checkAuth, crearSolicitud)

router.post('/editarSolicitud', checkAuth, editarSolicitud)

router.delete('/eliminarSolicitud', checkAuth, eliminarSolicitud)

router.post('/descargarSolicitud', checkAuth, descargarSolicitud)

router.post('/guardarImagenSolicitud', checkAuth, guardarImagenSolicitud)

router.delete('/eliminarImagenSolicitud', checkAuth, eliminarImagenSolicitud)

router.post('/consultarSolicitudReporte', checkAuth, consultarSolicitudReporte)

// router reportes

router.get('/consultarReportesTodos', checkAuth, consultarReportesTodos)

router.post('/consultarReporte', checkAuth, consultarReporte)

router.post('/crearReporte', checkAuth, crearReporte)

router.post('/editarReporte', checkAuth, modificarReporte)

router.post('/descargarListaMtto', checkAuth, descargarListaMtto)

router.get('/consultarListasCofigReporte', checkAuth, consultarListasCofigReporte)

router.delete('/eliminarReporte', checkAuth, eliminarReporte)

router.delete('/eliminarImagenReporte', checkAuth, eliminarImagenReporte)

router.delete('/eliminarSoporteExtReporte', checkAuth, eliminarSoporteExtReporte)

router.post('/guardarImagenReporte', checkAuth, guardarImagenReporte)

router.post('/guardarSoporteExtReporte', checkAuth, guardarSoporteExtReporte)

router.post('/descargarReporte', checkAuth, descargarReporte)

router.post('/descargarReporteExterno', checkAuth, descargarReporteExterno)

// router configuraciones
router.post('/consultarconfig', checkAuth, consultarconfig)

router.post('/actualizarConfig', checkAuth, actualizarConfig)

router.post('/crearConfig', checkAuth, crearConfig)

router.post('/probarfechas', probarfechas)


// ruta componente 

router.delete('/eliminarComponente', checkAuth, eliminarComponente)

router.post('/guardarComponente', checkAuth, guardarComponente)

export default  router