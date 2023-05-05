
import pdfMake from "pdfmake/build/pdfmake.js"
import { URL } from "url";
import fs from 'fs'
import mime from 'mime-types'
import { dataReporte, dataSolicitud, dataActivo, dataListaReporte } from "../db/sqlPdf.js";
import { ddReporte } from "./docDefinitionPdfMake/pdfReporte.js"
import { ddSolicitud } from "./docDefinitionPdfMake/pdfSolicitud.js";
import { ddHojaDeVida } from "./docDefinitionPdfMake/pdfHojadeVida.js";
import { ddListadoReporte } from "./docDefinitionPdfMake/pdfListadoMtto.js";
const pathBase = process.env.PATH_FILES
const __dirname = new URL('.', import.meta.url).pathname.substring(1)

// generamos el pdf
async function crearPdfMake(id, tipo) {
    let data
    let dd

    if (tipo === 'Reporte') {
        data = await reporteData(id)
        dd = await ddReporte(data)
    }

    if (tipo === 'Solicitud') {
        data = await solicitudData(id)
        dd = await ddSolicitud(data)
    }

    if (tipo === 'Activo') {    
        data = await activoData(id)
        dd = await ddHojaDeVida(data)
    }

    if (tipo === 'listadoReportes') {
        data = await listadoReporteData(id)
        dd = await ddListadoReporte(data)
    }

    const pdfDocGenerator = pdfMake.createPdf(dd);
    try {
        // Retorna una promesa que se resuelve con la data del PDF en Base64
        return new Promise((resolve, reject) => {
            pdfDocGenerator.getBase64((data) => {
                // La función de callback se llama cuando se obtiene la data del PDF en Base64
                // Se resuelve la promesa con la data
                resolve(data);
            }, (error) => {
                // Si ocurre un error, se rechaza la promesa con el error
                reject(error);
            });
        });

    } catch (error) {
        console.error('Error al generar PDF:', error);
        throw error;
    }

}
// normalizamos los daros para solicitudes
const solicitudData = async id => {
    const datadb = await dataSolicitud(id)

    datadb.fechaSolicitud = datadb.fechaSolicitud.toLocaleDateString('es-CO')

    if (datadb.tipo_activo_id === 1) {
        datadb.apoyo = ''
        datadb.biomedico = 'X'
    } else {
        datadb.apoyo = 'X'
        datadb.biomedico = ''
    }
    // seleccionamos una imagen del activo la primera 
    datadb.url_img = datadb.url_img.split(',')[0]
    // creamos el path de la ruta donde se encuentran los archivos del activo
    const path = pathBase + datadb.siglas + '\\' + datadb.codigo + '\\'

    if (datadb.url_img != null && datadb.url_img != '') {
        // seleccionamos una imagen del activo la primera 
        datadb.url_img = datadb.url_img.split(',')[0]

        // leemos la imagen del activo de la ruta donde se encuentran los archivos y creamos un buffer de la imagen gurnadola en data.urL_imagens
        const imageData = fs.readFileSync(path + datadb.url_img);
        datadb.url_img = `data:${mime.lookup(datadb.url_img)};base64,${Buffer.from(imageData).toString('base64')}`

    } else {
        datadb.url_img = await bufferNoImage()
    }

    if (datadb.imgSolicitud != null && datadb.imgSolicitud != '') {
        // selecciona mos solo 4 imagenes de las cargadas en en el durante la creaccion del reporte 
        datadb.imgSolicitud = datadb.imgSolicitud.split(',')
        if (datadb.imgSolicitud.length > 4) datadb.imgSolicitud = datadb.imgSolicitud.slice(0, 4)

        // creamos un buffer de las imagenes en un array que se pude insertar  dirrectamente en el PDF del reporte
        const bodyImagenes = datadb.imgSolicitud.map(imagen => {
            const imageData = fs.readFileSync(path + 'Solicitud\\' + imagen);
            const buffer = `data:${mime.lookup(imagen)};base64,${Buffer.from(imageData).toString('base64')}`
            return {
                image: buffer,
                width: 110,
                height: 50,
            }
        })
        datadb.imgSolicitud = bodyImagenes
    }else{
        datadb.imgSolicitud=[]

    }

    datadb.logo = await bufferLogo()

    return datadb
}

//normalizamos los daros para un reporte
const reporteData = async id => {
    // consultamos los datos del reporte,
    const datadb = await dataReporte(id)

    // normalizamos los datos del reporte para su ingreso a pdf y creamos los buffer de imagenes para ingresarlos al pdf 
    // normalizamos las fechas 
    datadb.fechaSolicitud = datadb.fechaSolicitud.toLocaleString('es-CO')

    datadb.fechareporte.setMinutes(datadb.fechareporte.getMinutes() + datadb.fechareporte.getTimezoneOffset())
    datadb.fechaReporte = datadb.fechaReporte.toLocaleDateString('es-CO')

    datadb.fechaCierre = datadb.fechaCierre.toLocaleString('es-CO')
    
    datadb.proximoMtto.setMinutes(datadb.proximoMtto.getMinutes() + datadb.proximoMtto.getTimezoneOffset())
    datadb.proximoMtto = datadb.proximoMtto.toLocaleDateString('es-CO')

    // determinamos el tipo de  activo
    if (datadb.tipo_activo_id === 1) {
        datadb.apoyo = ''
        datadb.biomedico = 'X'
    } else {
        datadb.apoyo = 'X'
        datadb.biomedico = ''
    }
    // determinamos el tipo de mantenimiento
    if (datadb.tipoMtoo_id === 1) {
        datadb.correctivo = ''
        datadb.perventivo = 'X'
        datadb.Predictivo = ''
    } else if (datadb.perventivo === 2) {
        datadb.correctivo = ''
        datadb.perventivo = ''
        datadb.Predictivo = 'X'
    } else {
        datadb.correctivo = 'X'
        datadb.perventivo = ''
        datadb.Predictivo = ''
    }
    // creamos el path de la ruta donde se encuentran los archivos del activo
    const path = pathBase + datadb.siglas + '\\' + datadb.codigo + '\\'
    if (datadb.url_img != null && datadb.url_img != '') {
        // seleccionamos una imagen del activo la primera 
        datadb.url_img = datadb.url_img.split(',')[0]

        // leemos la imagen del activo de la ruta donde se encuentran los archivos y creamos un buffer de la imagen gurnadola en data.urL_imagens
        const imageData = fs.readFileSync(path + datadb.url_img);
        datadb.url_img = `data:${mime.lookup(datadb.url_img)};base64,${Buffer.from(imageData).toString('base64')}`

    } else {
        datadb.url_img = await bufferNoImage()
    }

    if (datadb.img_reporte != null && datadb.img_reporte != '') {
        // selecciona mos solo 4 imagenes de las cargadas en en el durante la creaccion del reporte 
        datadb.img_reporte = datadb.img_reporte.split(',')
        if (datadb.img_reporte.length > 4) datadb.img_reporte = datadb.img_reporte.slice(0, 4)

        // creamos un buffer de las imagenes en un array que se pude insertar  dirrectamente en el PDF del reporte
        const bodyImagenes = datadb.img_reporte.map(imagen => {
            const imageData = fs.readFileSync(path + 'Reporte\\' + imagen);
            const buffer = `data:${mime.lookup(imagen)};base64,${Buffer.from(imageData).toString('base64')}`
            return {
                image: buffer,
                width: 110,
                height: 50,

            }
        })
        datadb.img_reporte = bodyImagenes
    }



    // creammor un buffer de las imagenes de las firmas del quiern realzia el reporte y recibe el reporte 
    if (datadb.firmaReporte !== '' && datadb.firmaReporte !== null) {
        const firmaUsuarioReporte = fs.readFileSync(pathBase + 'Usuarios\\' + datadb.firmaReporte)
        datadb.firma = [
            {
                image: `data:${mime.lookup(datadb.firmaReporte)};base64,${Buffer.from(firmaUsuarioReporte).toString('base64')}`,
                fit: [50, 50]
            },
        ]
    } else {
        datadb.firma = [
            {
                text: '',
            },
        ]

    }

    if (datadb.frimaAprobado !== '' && datadb.frimaAprobado !== null) {
        const firmaUsuarioAprovado = fs.readFileSync(pathBase + 'Usuarios\\' + datadb.frimaAprobado)
        datadb.firma.push(
            {
                image: `data:${mime.lookup(datadb.frimaAprobado)};base64,${Buffer.from(firmaUsuarioAprovado).toString('base64')}`,
                fit: [50, 50]
            }
        )
    } else {
        datadb.firma.push(
            {
                text: '',
            },

        )
    }

    datadb.logo = await bufferLogo()

    return datadb

}

// normalizamos los datos para un activo
const activoData = async id => {
    // consultamos los datos del reporte,
    const datos = await dataActivo(id)
    const datadb = datos[0][0]
    if (datos[1].length > 0) datadb.componentes = datos[1]
    // normalizamos los datos del reporte para su ingreso a pdf y creamos los buffer de imagenes para ingresarlos al pdf 
    // normalizamos las fechas 
    datadb.fechaCompra.setMinutes(datadb.fechaCompra.getMinutes() + datadb.fechaCompra.getTimezoneOffset())
    datadb.fechaCompra = datadb.fechaCompra.toLocaleDateString('es-CO')

    datadb.garantia.setMinutes(datadb.garantia.getMinutes() + datadb.garantia.getTimezoneOffset())
    datadb.garantia = datadb.garantia.toLocaleDateString('es-CO')
    datadb.ingreso = new Date(datadb.ingreso).toLocaleString('es-CO')

    // determinamos el tipo de  activo
    if (datadb.tipo_activo_id === 1) {
        datadb.apoyo = ''
        datadb.biomedico = 'X'
    } else {
        datadb.apoyo = 'X'
        datadb.biomedico = ''
    }

    // creamos el path de la ruta donde se encuentran los archivos del activo
    const path = pathBase + datadb.siglas + '\\' + datadb.codigo + '\\'
    // seleccionamos una imagen del activo la primera 
    datadb.url_img = datadb.url_img.split(',')[0]

    if (datadb.url_img != null && datadb.url_img != '') {
        // seleccionamos una imagen del activo la primera 
        datadb.url_img = datadb.url_img.split(',')[0]

        // leemos la imagen del activo de la ruta donde se encuentran los archivos y creamos un buffer de la imagen gurnadola en data.urL_imagens
        const imageData = fs.readFileSync(path + datadb.url_img);
        datadb.url_img = `data:${mime.lookup(datadb.url_img)};base64,${Buffer.from(imageData).toString('base64')}`

    } else {
        datadb.url_img = await bufferNoImage()
    }

    if (datadb.componentes) {
        const arrayComponentes = datadb.componentes.map(element => {
            return (
                [
                    { text: element.nombre },
                    { text: element.marca },
                    { text: element.modelo },
                    { text: element.serie },
                    { text: element.capacidad },
                ]
            )
        })
        arrayComponentes.unshift(
            [
                { text: 'ESPECIFICACIONES TECNICAS DE COMPONENTES', fontSize: 12, margin: [0, 0, 0, 5], colSpan: 5, bold: true, alignment: 'center' },
                '',
                '',
                '',
                ''
            ],
            [
                { text: 'COMPONENTE:', bold: true },
                { text: 'Marca:', bold: true },
                { text: 'Modelo:', bold: true },
                { text: 'Serie:', bold: true },
                { text: 'Capacidad:', bold: true },
            ]
        )

        datadb.componentes = arrayComponentes
    } else {
        datadb.componentes = [
            [
                { text: 'ESPECIFICACIONES TECNICAS DE COMPONENTES', fontSize: 12, margin: [0, 0, 0, 5], colSpan: 5, bold: true, alignment: 'center' },
                '',
                '',
                '',
                ''
            ],
            [
                { text: 'COMPONENTE:', bold: true },
                { text: 'Marca:', bold: true },
                { text: 'Modelo:', bold: true },
                { text: 'Serie:', bold: true },
                { text: 'Capacidad:', bold: true },
            ]
        ]

    }
    datadb.logo = await bufferLogo()

    return datadb

}

// normalizamos los datos para el lisato de reprotes
const listadoReporteData = async id => {
    // consultamos los datos del reporte,
    const datos = await dataListaReporte(id)
    if (datos < 1) return { msg: 'No se encontraron reportes' }

    const datadb = {
        codigo: datos[0].codigo,
        nombre: datos[0].nombre

    }

    datadb.body = datos.map((element, index) => {
        element.fechaReporte.setMinutes(element.fechaReporte.getMinutes() + element.fechaReporte.getTimezoneOffset())
        element.fechaReporte = element.fechaReporte.toLocaleDateString('es-CO')
        element.fechaProximo.setMinutes(element.fechaProximo.getMinutes() + element.fechaProximo.getTimezoneOffset())
        element.fechaProximo = element.fechaProximo.toLocaleDateString('es-CO')
        return [
            { text: index + 1 },
            { text: element.id },
            { text: element.fechaReporte },
            { text: element.hallazgos },
            { text: element.reporte },
            { text: element.recomendaciones },
            { text: element.proveedor },
            { text: element.fechaProximo },
        ]
    });

    datadb.body.unshift(

        [
            { text: '#', bold: true, alignment: 'center' },
            { text: 'Id', bold: true, alignment: 'center' },
            { text: 'Fecha del reporte', bold: true, alignment: 'center' },
            { text: 'Hallazgos', bold: true, alignment: 'center' },
            { text: 'Reporte Tecnico', bold: true, alignment: 'center' },
            { text: 'Recomendaciones', bold: true, alignment: 'center' },
            { text: 'Proveedor', bold: true, alignment: 'center' },
            { text: 'Fecha Proximo Mtto', bold: true, alignment: 'center' },

        ]
    )

    datadb.logo = await bufferLogo()
    return datadb
}

// generamos el logo
const bufferLogo = async () => {
    const imageData = fs.readFileSync(__dirname + 'docDefinitionPdfMake/image/logo.png');
    return `data:image/png;base64,${Buffer.from(imageData).toString('base64')}`
}

const bufferNoImage = async () => {
    const imageData = fs.readFileSync(__dirname + 'docDefinitionPdfMake/image/noimage.png');
    return `data:image/png;base64,${Buffer.from(imageData).toString('base64')}`
}

export { crearPdfMake, bufferNoImage }
