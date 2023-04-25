
import pdfMake from "pdfmake/build/pdfmake.js"
import fs from 'fs'
import mime from 'mime-types'
import { dataReporte, dataSolicitud } from "../db/sqlPdf.js";
import { ddReporte } from "./docDefinitionPdfMake/pdfReporte.js"
import { ddSolicitud } from "./docDefinitionPdfMake/pdfSolicitud.js";
import { ddHojaDeVida } from "./docDefinitionPdfMake/pdfHojadeVida.js";
const pathBase = process.env.PATH_FILES


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
       // data = await solicitudData(id)
        dd = await ddHojaDeVida(data)
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

export { crearPdfMake }

const solicitudData = async id=>{
    const datadb = await dataSolicitud(id)

    datadb.fechaSolicitud = new Date(datadb.fechaSolicitud).toLocaleDateString()

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

    // leemos la imagen del activo de la ruta donde se encuentran los archivos y creamos un buffer de la imagen gurnadola en data.urL_imagens
    const imageData = fs.readFileSync(path + datadb.url_img);
    datadb.url_img = `data:${mime.lookup(datadb.url_img)};base64,${Buffer.from(imageData).toString('base64')}`
    
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


    return datadb
}

const reporteData = async id => {
    // consultamos los datos del reporte,
    const datadb = await dataReporte(id)

    // normalizamos los datos del reporte para su ingreso a pdf y creamos los buffer de imagenes para ingresarlos al pdf 
    // normalizamos las fechas 
    datadb.fechaSolicitud = new Date(datadb.fechaSolicitud).toLocaleDateString()
    datadb.fechaReporte = new Date(datadb.fechaReporte).toLocaleDateString()
    datadb.fechaCierre = new Date(datadb.fechaCierre).toLocaleDateString()
    datadb.proximoMtto = new Date(datadb.proximoMtto).toLocaleDateString()

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
    // seleccionamos una imagen del activo la primera 
    datadb.url_img = datadb.url_img.split(',')[0]

    // creamos el path de la ruta donde se encuentran los archivos del activo
     const path = pathBase + datadb.siglas + '\\' + datadb.codigo + '\\'

    // leemos la imagen del activo de la ruta donde se encuentran los archivos y creamos un buffer de la imagen gurnadola en data.urL_imagens
    const imageData = fs.readFileSync(path + datadb.url_img);
    datadb.url_img = `data:${mime.lookup(datadb.url_img)};base64,${Buffer.from(imageData).toString('base64')}`

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

    // creammor un buffer de las imagenes de las firmas del quiern realzia el reporte y recibe el reporte 
    if (datadb.firmaReporte !== '' || datadb.firmaReporte !== null) {
        const firmaUsuarioReporte = fs.readFileSync(pathBase + 'Usuarios\\' + datadb.firmaReporte)
        datadb.firmaReporte = `data:${mime.lookup(datadb.firmaReporte)};base64,${Buffer.from(firmaUsuarioReporte).toString('base64')}`
    }

    if (datadb.frimaAprobado !== '' || datadb.frimaAprobado !== null) {
        const firmaUsuarioAprovado = fs.readFileSync(pathBase + 'Usuarios\\' + datadb.frimaAprobado)
        datadb.frimaAprobado = `data:${mime.lookup(datadb.frimaAprobado)};base64,${Buffer.from(firmaUsuarioAprovado).toString('base64')}`
    }

    return datadb

}
