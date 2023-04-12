import formidable from "formidable"
import { validarDatoReporte } from "../helpers/validarDatosReporte.js"
import { consultarCodigoInterno } from "../db/sqlActivos.js"
import { consultarSolicitudUno} from "../db/sqlSolicitudes.js"
import { guardarImagenesNuevoActivo, bufferimagenes, elimnarImagenes } from "../helpers/copiarCarpetasArchivos.js"
import { consultarReportes,
    consultarReporteUno,
    guardarReporte,
    actualizarReporte } from "../db/sqlReportes.js"



const consultarReportesTodos = async (req, res) => {
    const listadoReportes = await consultarReportes()
    res.json(listadoReportes)
}

const consultarReporte = async (req, res) => {
    const id = req.body.id
    const reporte = await consultarReporteUno(id)
    if (reporte.msg) {
        return res.json(reporte)
    }
    // rcuerda crear el buffer de imagenes 
    //reporte.img_solicitud = reporte.img_solicitud.split(',')
    //const Imagenes = bufferimagenes(reporte.img_solicitud, reporte, 2)

    res.json({
        reporte,
       // Imagenes
    })
    

}

const crearReporte = async (req, res) => {

    // validar permisos para crear activos
    const { sessionid, permisos, Id_proveedores } = req

    const arrPermisos = JSON.parse(permisos)

    const proveedores = JSON.parse(Id_proveedores)

    if (arrPermisos.indexOf(5) === -1) {
        res.json({msg: 'Usted no tiene permisos para crear crear reportes de mantenimiento'})
        return
    }

    // usa  formidable para recibir el req de imagenes y datos
    const form = formidable({ multiples: true });

    form.parse(req, async function (err, fields, files) {

        if (err) {
            console.error(err);
            return res.status(500).json({ error: err });
        }
        const data = JSON.parse(fields.data)
 
     
        // validar que la solicitud exista y que no este cerrada o eliminada
        const dataSolicitud = await consultarSolicitudUno(data.solicitud_id)

        if (dataSolicitud.msg) {
            return res.json(dataSolicitud)
        }

        if(dataSolicitud.id_estado == 3 ){
            return res.json({msg: 'la solicitu esta en estado cerrada y no puede modificarse'})
        }

        if(dataSolicitud.id_estado == 4 ){
            return res.json({msg: 'la solicitu no existe o fue eliminada'})
        }
        
        if(dataSolicitud.id_activo !== data.id_activo){
            return res.json({msg: 'La solicitud no corresponde al activo selecionado'})
        }
             
        if(proveedores.indexOf(data.proveedor_id) === -1) {
            return res.json({msg: 'Usted no esta asociado al proveedor de mantenimientos seleccionado, favor seleccione uno al cual este asociado.'})
            
        }

        const fechaSolicitud = new Date(dataSolicitud.fecha_solicitud)
        const fechaReporte = new Date(data.fechareporte)
     
        if (fechaSolicitud > fechaReporte) {
            res.json({msg: 'La fecha de realizacion del mantenimiento no puede ser inferior a la fecha de solicitud'})
            return
        }

        const validarDatos = validarDatoReporte(data)
       
        if (validarDatos.msg) {
            return res.json(validarDatos)
        }
        data.usuario_idReporte = sessionid
        data.fechaCreacion = new Date(Date.now()).toISOString().substring(0, 19).replace('T', ' ')
        
        const dataBd = await consultarCodigoInterno(data.id_activo)

        if (files.Image) {
           //  sin nada para activos, 1 para solicitudes, 2 reportes
            const img_reporte = await guardarImagenesNuevoActivo(files, dataBd, 2)
            if (img_reporte.msg) {
                return res.json(img_solicitud)
            }
            data.img_reporte = img_reporte
        }

        const guardado = await guardarReporte(data)

        if (guardado.msg) {
            return res.json(guardado)
        }

        data.id = guardado
        let Imagenes
        if(data.img_reporte){
             Imagenes = await bufferimagenes(data.img_reporte, dataBd, 2) //
        }
                
        res.json({
            data,
            Imagenes
        })



    });

}

const modificarReporte = async (req, res) => {

    // validar permisos para crear activos
    const { sessionid, permisos, Id_proveedores } = req

    // usa  formidable para recibir el req de imagenes y datos
    const form = formidable({ multiples: true });

    form.parse(req, async function (err, fields, files) {

        if (err) {
            console.error(err);
            return res.status(500).json({ error: err });
        }
        const data = JSON.parse(fields.data)

        // VALIDAR QUE EL CODIGO PERTENESCA AL ACTIVO
        const dataSolicitud = await consultarSolicitudUno(data.solicitud_id)

        if (dataSolicitud.id_estado === 3) {
            return res.json({ msg: 'La solicitud de mantenimiento ya ha sido gestionada, no se puede modificar el reporte' })
        }

        const dataReporte = await consultarReporteUno(data.id)
        if(typeof dataReporte === 'undefined'){
            return res.json({ msg:'La solicitud no existe'})
        }
        if (dataReporte.usuario_idReporte !== sessionid) {
            const arrPermisos = JSON.parse(permisos)
            if (arrPermisos.indexOf(6) === -1) {
                return res.json({ msg: 'Usted no tiene permisos para modificar solicitudes' })
            } else {
                return res.json({ msg: 'Esta solicitud Fue radicada por otro usuario.' })
            }
        }

        if(dataReporte.id_activo !== dataReporte.id_activo){
            return res.json({ msg: 'El activo no corresponde al ID del reporte que intenta modificar' })
        }

        const fechaSolicitud = new Date(dataSolicitud.fecha_solicitud).toLocaleDateString()
        const fechaReporte = new Date(data.fechareporte).toLocaleDateString()
          
        if (new Date(fechaSolicitud).getTime() > new Date(fechaReporte).getTime()) {
            res.json({msg: 'La fecha de realizacion del mantenimiento no puede ser inferior a la fecha de solicitud'})
            return
        }

        const validarDatos = validarDatoReporte(data)

        if (validarDatos.msg) {
            return res.json(validarDatos)
        }

        // validar si se elimino alguna imagen
        if (data.img_reporte.length <= 0 && !files.Image) {
            return res.json({ msg: 'No se puede eliminar todas las imagenes' })
        }

        let imageneDb = dataReporte.img_reporte.split(',')
        const ElminoImagen = JSON.stringify(imageneDb) === JSON.stringify(data.img_solicitud)

        let imagenesEliminar

        if (!ElminoImagen) {
             imagenesEliminar = imageneDb.filter(image => !data.img_reporte.includes(image))
        }

         const dataActivo = await consultarCodigoInterno(data.id_activo)


        if (files.Image) {
           const nuevaUrl_imag = await guardarImagenesNuevoActivo(files, dataActivo, 2)
            if (nuevaUrl_imag.msg) {
               return res.json(nuevaUrl_imag)
            }
            const nuevasImages = nuevaUrl_imag.concat(data.img_reporte)
            data.img_reporte = nuevasImages
        }
         
        if (!ElminoImagen) {
            await elimnarImagenes(imagenesEliminar, dataActivo, 2)
        }
        data.img_reporte = data.img_reporte.toString()
        data.fechaCierre = new Date(Date.now()).toISOString().substring(0, 19).replace('T', ' ')
 
        const actualizar = await actualizarReporte(data)
        if (actualizar.msg) {
            return res.json(actualizar)
        }

        data.img_reporte = data.img_reporte.split(',')
        console.log(data.img_reporte)
        const Imagenes = bufferimagenes(data.img_reporte, dataActivo, 2)
        delete data.fechaCierre


        // enviar respuesta con los datos del activo e imagenes
        res.json({
            msg: 'El reporte se a actualizado correctamente',
            data,
            Imagenes
        })
    });

}

export{consultarReportesTodos,
    consultarReporte,
    crearReporte,
    modificarReporte
}