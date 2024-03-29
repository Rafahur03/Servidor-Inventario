import express from 'express';
import {
    iniciaSesion,
    crearUsuario,
    actualizaUsuario,
    consultarUsuario,
    cambiarFirma,
    guardarProveedorUsuario,
    eliminarProveedorUsuario,
    cambiarContraseña
} from '../controllers/controllersUsuarios.js';

import { checkAuth } from '../middleware/authMiddlewareUsuario.js';

import {
    consultarActivosTodos,
    consultarlistadoActivoFiltrado,
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
    consultarDatosActivoSolicitud,
    consultarDatosActivoReportePrev,
    consultarActivoCambiarClasificacion
} from '../controllers/controllersActivos.js'

import {
    consultarSolicitudTodos,
    crearSolicitud,
    editarSolicitud,
    eliminarSolicitud,
    consultarSolicitud,
    eliminarImagenSolicitud,
    guardarImagenSolicitud,
    descargarSolicitud,
    consultarSolicitudReporte
} from '../controllers/controllerSolicitudSoporte.js'

import {
    consultarReportesTodos,
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
    descargarReporte,
    guardarReportePrev
} from '../controllers/controllersReportes.js'

import {
    consultarconfig,
    actualizarConfig,
    crearConfig,
    consultarTodasTablasConfig
} from '../controllers/controlerConfig.js';

import {
    eliminarComponente, guardarComponente
} from '../controllers/controllerComponentes.js';

import {
    descargaCronograma,
    informelistadoAct,
    informelistadoActCost,
    descargarIfoActCosteado,
    informelistadoReportes,
    informelistadoSolicitudes,
    informeMovimientoInsumos
} from '../controllers/informes.js';

import { listadoInsumosBodega,
    consultarUnInsumo,
    ingresoInicalInsumo,
    movimientoInsumoBodega,
    actualizarFactInsumo,
    guardarImagInsumo,
    actualizarInsumo,
    eliminarFactInsumo,
    descargarFactInsumo,
    eliminarImagInsumo,
    consultartablasInsumo
} from '../controllers/bodegaInsumos.js'

import { probarfechas } from '../controllers/probarfechas.js';

const router = express.Router()

// router inicio sesion y administration de usuarios----------------------------------

router.post('/', iniciaSesion)

router.post('/crearUsuario', checkAuth, crearUsuario)

router.post('/actualizaPerfil', checkAuth, actualizaUsuario)

router.post('/consultarUsuario', checkAuth, consultarUsuario)

router.post('/cambiarFirma', checkAuth, cambiarFirma)

router.post('/guardarProveedorUsuario', checkAuth, guardarProveedorUsuario)

router.post('/cambiarClave', checkAuth, cambiarContraseña)

router.delete('/eliminarProveedorUsuario', checkAuth, eliminarProveedorUsuario)


// ruta de manejo de activos-----------------------------------------------------------------

router.get('/consultarActivosTodos', checkAuth, consultarActivosTodos)

router.post('/consultarlistadoActivoFiltrado', checkAuth, consultarlistadoActivoFiltrado)

router.get('/consultarListasConfActivos', checkAuth, consultarListasConfActivos)

router.post('/consultarActivo', checkAuth, consultarActivo)

router.post('/consultarActivoCambiarClasificacion', checkAuth, consultarActivoCambiarClasificacion)

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

router.post('/consultarDatosActivoReportePrev', checkAuth, consultarDatosActivoReportePrev)

// ruta de solicitudes de soporte -------------------------------------------------------------

router.post('/consultarSolicitudTodos', checkAuth, consultarSolicitudTodos)

router.post('/consultarSolicitud', checkAuth, consultarSolicitud)

router.post('/crearSolicitud', checkAuth, crearSolicitud)

router.post('/editarSolicitud', checkAuth, editarSolicitud)

router.delete('/eliminarSolicitud', checkAuth, eliminarSolicitud)

router.post('/descargarSolicitud', checkAuth, descargarSolicitud)

router.post('/guardarImagenSolicitud', checkAuth, guardarImagenSolicitud)

router.delete('/eliminarImagenSolicitud', checkAuth, eliminarImagenSolicitud)

router.post('/consultarSolicitudReporte', checkAuth, consultarSolicitudReporte)

// router reportes-----------------------------------------------------------------------------

router.post('/consultarReportesTodos', checkAuth, consultarReportesTodos)

router.post('/consultarReporte', checkAuth, consultarReporte)

router.post('/crearReporte', checkAuth, crearReporte)

router.post('/guardarReportePrev', checkAuth, guardarReportePrev)

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

router.post('/informeMovimientoInsumos', checkAuth, informeMovimientoInsumos)



// router configuraciones----------------------------------------------------------
router.post('/consultarconfig', checkAuth, consultarconfig)

router.post('/actualizarConfig', checkAuth, actualizarConfig)

router.post('/crearConfig', checkAuth, crearConfig)

router.get('/consultarTodasTablasConfig', checkAuth, consultarTodasTablasConfig)

router.post('/probarfechas', probarfechas)

// ruta componente ------------------------------------------------------------

router.delete('/eliminarComponente', checkAuth, eliminarComponente)

router.post('/guardarComponente', checkAuth, guardarComponente)
//informes---------------------------------------------------------------
router.post('/descargaCronograma', checkAuth, descargaCronograma)
router.post('/informelistadoAct', checkAuth, informelistadoAct)
router.post('/informelistadoActCost', checkAuth, informelistadoActCost)
router.post('/descargarIfoActCosteado', checkAuth, descargarIfoActCosteado)
router.post('/informelistadoReportes', checkAuth, informelistadoReportes)
router.post('/informelistadoSolicitudes', checkAuth, informelistadoSolicitudes)

//-------------------------insumos -------------------------------------

router.get('/consultartablasInsumo', checkAuth, consultartablasInsumo)
router.post('/consultarInsumosBodega', checkAuth, listadoInsumosBodega)
router.post('/ingresoInicalInsumo', checkAuth, ingresoInicalInsumo)
router.post('/consultarUnInsumo', checkAuth, consultarUnInsumo)
router.post('/movimientoInsumo', checkAuth, movimientoInsumoBodega)
router.post('/actualizarFactInsumo', checkAuth, actualizarFactInsumo)
router.post('/guardarImagInsumo', checkAuth, guardarImagInsumo)
router.post('/actualizarInsumo', checkAuth, actualizarInsumo)
router.post('/eliminarFactInsumo', checkAuth, eliminarFactInsumo)
router.post('/descargarFactInsumo', checkAuth, descargarFactInsumo)
router.post('/eliminarImagInsumo', checkAuth, eliminarImagInsumo)







export default router