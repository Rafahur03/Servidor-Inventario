
import pdfMake from "pdfmake/build/pdfmake.js"
import { URL } from "url";
import fs from 'fs'
import mime, { contentType } from 'mime-types'
import { dataReporte, dataSolicitud, dataActivo, dataListaReporte } from "../db/sqlPdf.js";
import { ddReporte } from "./docDefinitionPdfMake/pdfReporte.js"
import { ddSolicitud } from "./docDefinitionPdfMake/pdfSolicitud.js";
import { ddHojaDeVida } from "./docDefinitionPdfMake/pdfHojadeVida.js";
import { ddListadoReporte } from "./docDefinitionPdfMake/pdfListadoMtto.js";
import { ddInformeActivoCosteado } from "./docDefinitionPdfMake/informeActivo.js";
import { ddcronogramaMtto } from "./docDefinitionPdfMake/cronogramaMtto.js";
import { ddListadoActivoCosteado } from "./docDefinitionPdfMake/ddListadoActivoCosteado.js";
import { ddinformelistadoActivo } from "./docDefinitionPdfMake/ddinformelistadoActivo.js";
import { ddInformeInsumos } from "./docDefinitionPdfMake/informeInsumo.js";
import { consultarActivoUno } from "../db/sqlActivos.js";
import { consultaconfi } from "../db/sqlConfig.js";
import { consultarInformeInsumos } from "../db/sqlInsumos.js";
import { sqlCronogramaManteniento, sqlListadoActivoCosteado, sqlInformeListadoActivo } from "../db/sqlInformes.js";
import { bufferimagen } from "./copiarCarpetasArchivos.js";
const pathBase = process.env.PATH_FILES
const __dirname = new URL('.', import.meta.url).pathname.substring(1)

// generamos el pdf
async function crearPdfMake(id, tipo) {
    let data
    let dd

    if (tipo === 'Reporte') {
        data = await reporteData(id)
        if (data.msg) return data.msg
        dd = await ddReporte(data)
        if (dd.msg) return dd.msg
    }

    if (tipo === 'Solicitud') {
        data = await solicitudData(id)
        if (data.msg) return data.msg
        dd = await ddSolicitud(data)
        if (dd.msg) return dd.msg
    }

    if (tipo === 'Activo') {
        data = await activoData(id)
        if (data.msg) return data.msg
        dd = await ddHojaDeVida(data)
        if (dd.msg) return dd.msg
    }

    if (tipo === 'listadoReportes') {
        data = await listadoReporteData(id)
        if (data.msg) return data.msg
        dd = await ddListadoReporte(data)
        if (dd.msg) return dd.msg
    }

    if (tipo === 'InformActivoCosteado') {
        data = await informeActivoCosteado(id)
        if (data.msg) return data.msg
        dd = await ddInformeActivoCosteado(data)
        if (dd.msg) return dd.msg
    }

    if (tipo === 'cronogramaMtto') {
        data = await cronogramaMtto(id)
        if (data.msg) return data.msg
        dd = await ddcronogramaMtto(data)
        if (dd.msg) return dd.msg
    }

    if (tipo === 'listadoActivoCosteado') {
        data = await listadoActivoCosteado(id)
        if (data.msg) return data.msg
        dd = await ddListadoActivoCosteado(data)
        if (dd.msg) return dd.msg
    }

    if (tipo === 'informelistadoActivo') {
        data = await informelistadoActivo(id)
        if (data.msg) return data.msg
        dd = await ddinformelistadoActivo(data)
        if (dd.msg) return dd.msg
    }

    if (tipo === 'informeInsumos') {
        data = await informeInsumo(id)
        if (data.msg) return data.msg
        dd = await ddInformeInsumos(data)
        if (dd.msg) return dd.msg
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
            const imageData = fs.readFileSync(path + 'Solicitud\\' + id + '\\' + imagen);
            const buffer = `data:${mime.lookup(imagen)};base64,${Buffer.from(imageData).toString('base64')}`
            return {
                image: buffer,
                width: 110,
                height: 50,
            }
        })
        datadb.imgSolicitud = bodyImagenes
    } else {
        datadb.imgSolicitud = []

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
    datadb.fechaReporte = datadb.fechaReporte.toISOString().substring(0, 10)
    if (datadb.fechaCierre == null || datadb.fechaCierre == '') {
        datadb.fechaCierre = ''
    } else {
        datadb.fechaCierre = datadb.fechaCierre.toLocaleString('es-CO')
    }

    datadb.proximoMtto = datadb.proximoMtto.toISOString().substring(0, 10)

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

    if (datadb.img_reporte !== null && datadb.img_reporte !== '') {
        // selecciona mos solo 4 imagenes de las cargadas en en el durante la creaccion del reporte 
        datadb.img_reporte = datadb.img_reporte.split(',')
        if (datadb.img_reporte.length > 4) datadb.img_reporte = datadb.img_reporte.slice(0, 4)

        // creamos un buffer de las imagenes en un array que se pude insertar  dirrectamente en el PDF del reporte
        const bodyImagenes = datadb.img_reporte.map(imagen => {
            const imageData = fs.readFileSync(path + 'Reporte\\' + datadb.idReporte + '\\' + imagen);
            const buffer = `data:${mime.lookup(imagen)};base64,${Buffer.from(imageData).toString('base64')}`
            return {
                image: buffer,
                width: 110,
                height: 50,

            }
        })

        datadb.img_reporte = bodyImagenes

    } else {
        datadb.img_reporte = []
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
    // consultamos los datos del activo
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

    let datadb = {}

    if (datos < 1) {
        const activoBd = await consultarActivoUno(id)
        datadb.codigo = activoBd.codigo,
            datadb.nombre = activoBd.nombre
        const noDatos = [
            { text: ' ' },
            { text: ' ' },
            { text: ' ' },
            { text: 'A LA FECHA EL ACTIVO NO CUENTA CON REPORTES DE MANTENIMIENTO ' },
            { text: ' ' },
            { text: ' ' },
            { text: ' ' },
            { text: ' ' },
        ]
        datadb.body = [noDatos]

    } else {

        datadb.codigo = datos[0].codigo,
            datadb.nombre = datos[0].nombre

        datadb.body = datos.map((element, index) => {
            element.fechaReporte = element.fechaReporte.toISOString().substring(0, 10)
            if (element.fechaProximo == undefined) {
                element.fechaProximo = ''
            } else {
                element.fechaProximo = element.fechaProximo.toISOString().substring(0, 10)
            }
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
    }

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

const informeActivoCosteado = async id => {
    // consultamos los datos del reporte,
    const datos = await dataActivo(id)
    if (datos.msg) return datos
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

    const datosreportes = await dataListaReporte(id)

    if (datosreportes === 0) {
        const noDatos = [
            { text: 'A LA FECHA EL ACTIVO NO CUENTA CON REPORTES DE MANTENIMIENTO ', colSpan: 10 },
            { text: ' ' },
            { text: ' ' },
            { text: ' ' },
            { text: ' ' },
            { text: ' ' },
            { text: ' ' },
            { text: ' ' },
            { text: ' ' },
            { text: ' ' },
        ]
        datadb.bodyreportes = [noDatos]

    } else {
        let mo = 0
        let mp = 0
        datadb.bodyreportes = datosreportes.map((element, index) => {

            element.fechaReporte = element.fechaReporte.toISOString().substring(0, 10)
            if (element.fechaProximo == undefined || element.fechaProximo == null) {
                element.fechaProximo = ''
            } else {
                element.fechaProximo = element.fechaProximo.toISOString().substring(0, 10)
            }
            mo += element.MO
            mp += element.MP

            return [
                { text: index + 1 },
                { text: element.id },
                { text: element.fechaReporte },
                { text: element.hallazgos },
                { text: element.reporte },
                { text: element.recomendaciones },
                { text: element.proveedor },
                { text: element.fechaProximo },
                { text: element.MO },
                { text: element.MP },
            ]
        });

        datadb.bodyreportes.push([
            { text: 'Total', colSpan: 8 },
            { text: '' },
            { text: '' },
            { text: '' },
            { text: '' },
            { text: '' },
            { text: '' },
            { text: '' },
            { text: mo },
            { text: mp },
        ])
    }

    datadb.bodyreportes.unshift(

        [
            { text: '#', bold: true, alignment: 'center' },
            { text: 'Id', bold: true, alignment: 'center' },
            { text: 'Fecha del reporte', bold: true, alignment: 'center' },
            { text: 'Hallazgos', bold: true, alignment: 'center' },
            { text: 'Reporte Tecnico', bold: true, alignment: 'center' },
            { text: 'Recomendaciones', bold: true, alignment: 'center' },
            { text: 'Proveedor', bold: true, alignment: 'center' },
            { text: 'Fecha Proximo Mtto', bold: true, alignment: 'center' },
            { text: 'Costo Mo', bold: true, alignment: 'center' },
            { text: 'Costo Mp', bold: true, alignment: 'center' },
        ]
    )
    datadb.logo = await bufferLogo()

    return datadb

}

const cronogramaMtto = async data => {
    // consultamos los datos del reporte,
    const clasificacion = await consultaconfi('SELECT id, TRIM(siglas) AS siglas FROM clasificacion_activos WHERE estado = 1')

    const todos = data.filtros.some(element => element.id === 'TD' && element.valor === true)
    let condicion = 'WHERE (la.estado_id = 1'

    if (!todos) {
        const filtrosSiglas = data.filtros.filter(element => element.valor)
        const filtros = clasificacion.filter(element => filtrosSiglas.some(item => item.id === element.siglas))
        if (filtros.length == 0) return res.json({ msg: 'Debe seleccionar un filtro valido' })
        filtros.forEach((element, index) => {
            if (index == 0) {
                condicion = condicion + ' AND la.clasificacion_id = ' + element.id
            } else {
                condicion = condicion + ' OR la.clasificacion_id = ' + element.id
            }
        });

    }

    condicion = condicion + ') \nORDER BY la.clasificacion_id ASC, codigo;'
    const datos = await sqlCronogramaManteniento(condicion)

    if (datos.msg) return res.json({ msg: 'No fue posible consultar los datos' })
    let cronograma = [
        [
            { rowSpan: 2, text: '#', style: 'textheader' },
            { rowSpan: 2, text: 'Codigo', style: 'textheader' },
            { rowSpan: 2, text: 'Activo', style: 'textheader' },
            { rowSpan: 2, text: 'Marca', style: 'textheader' },
            { rowSpan: 2, text: 'Modelo', style: 'textheader' },
            { rowSpan: 2, text: 'Serie', style: 'textheader' },
            { rowSpan: 2, text: 'Ubicacion', style: 'textheader' },
            { rowSpan: 2, text: 'Proveedor Mtto', style: 'textheader' },
            { colSpan: 12, text: 'Cronograma 2023', style: 'textheader' },
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            ''
        ],
        [
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            { text: 'Ene', style: 'textbodymonth' },
            { text: 'Feb', style: 'textbodymonth' },
            { text: 'Mar', style: 'textbodymonth' },
            { text: 'Abr', style: 'textbodymonth' },
            { text: 'May', style: 'textbodymonth' },
            { text: 'Jun', style: 'textbodymonth' },
            { text: 'Jul', style: 'textbodymonth' },
            { text: 'Ago', style: 'textbodymonth' },
            { text: 'Sep', style: 'textbodymonth' },
            { text: 'Oct', style: 'textbodymonth' },
            { text: 'Nov', style: 'textbodymonth' },
            { text: 'Dic', style: 'textbodymonth' }
        ],

    ]

    let content = []
    let consecutivo = 1
    datos.forEach((element, index) => {

        if (element.dias === 0) {
            cronograma.push(
                [
                    consecutivo++,
                    element.codigo,
                    element.nombre,
                    element.marca,
                    element.modelo,
                    element.serie,
                    element.ubicacion,
                    element.proveedor,
                    { colSpan: 12, text: 'No Aplica', alignment: 'center' }
                ]
            )
        } else {

            let fechapivote = null
            if (element.fechareporte !== null) {
                fechapivote = element.fechareporte.toISOString().substring(0, 10);
            } else if (element.fecha_proximo_mtto !== null && element.fecha_proximo_mtto.toISOString() !== '1900-01-01T00:00:00.000Z') {
                fechapivote = element.fecha_proximo_mtto.toISOString().substring(0, 10);
            } else if (element.vencimiento_garantia !== null && element.vencimiento_garantia.toISOString() !== '1900-01-01T00:00:00.000Z') {
                fechapivote = element.vencimiento_garantia.toISOString().substring(0, 10);
            } else if (element.fecha_compra !== null && element.fecha_compra.toISOString() !== '1900-01-01T00:00:00.000Z') {
                fechapivote = element.fecha_compra.toISOString().substring(0, 10);
            } else if (element.fecha_creacion !== null && element.fecha_creacion.toISOString() !== '1900-01-01T00:00:00.000Z') {
                fechapivote = element.fecha_creacion.toISOString().substring(0, 10);
            }

            fechapivote = new Date(fechapivote)
            const fechaInicio = new Date(fechapivote)
            if (fechapivote.getFullYear() === parseInt(data.year)) {

                do {
                    fechaInicio.setDate(fechaInicio.getDate() - element.dias)
                } while (fechaInicio.getFullYear() === parseInt(data.year))

                fechaInicio.setDate(fechaInicio.getDate() + element.dias)

            } else if (fechapivote.getFullYear() < parseInt(data.year)) {
                do {
                    fechaInicio.setDate(fechaInicio.getDate() + element.dias)
                } while (fechaInicio.getFullYear() !== parseInt(data.year))

            } else if (fechapivote.getFullYear() > parseInt(data.year)) {

                do {
                    fechaInicio.setDate(fechaInicio.getDate() - element.dias)
                } while (fechaInicio.getFullYear() >= parseInt(data.year))

                fechaInicio.setDate(fechaInicio.getDate() + element.dias)
            }

            let fechas = []

            for (let i = 0; i < 12; i++) {
                if (fechaInicio.getMonth() === i && fechaInicio.getFullYear() === parseInt(data.year)) {
                    fechas[i] = fechaInicio.getDate()
                    fechaInicio.setDate(fechaInicio.getDate() + element.dias)
                } else {
                    fechas[i] = ''
                }
            }

            cronograma.push(
                [
                    consecutivo++,
                    element.codigo,
                    element.nombre,
                    element.marca,
                    element.modelo,
                    element.serie,
                    element.ubicacion,
                    element.proveedor
                ].concat(fechas)
            )
        }

        let ingresardatos = false
        if (datos.length === index + 1) {
            ingresardatos = true
        } else if (datos[index + 1].idSigla !== element.idSigla) {
            ingresardatos = true
        }

        if (ingresardatos) {
            content.push(
                { text: element.clasificacion + ' "' + element.siglas + '" ', style: 'title' },
                {
                    style: 'table',
                    table: {
                        widths: [22.5, 70, 70, 70, 70, 70, 80, 106.5, 17, 16.5, 18, 16.5, 19, 18, 16.5, 18, 17, 16.5, 18, 16.5],
                        body: cronograma
                    },

                    layout: {
                        fillColor: function (rowIndex, node, columnIndex) {
                            return (rowIndex % 2 === 0) ? '#CCCCCC' : null;
                        },
                        hLineWidth: function (i, node) {
                            return (i === 1 || i === 2 || i === node.table.body.length) ? 2 : 0;
                        },
                        vLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.widths.length) ? 2 : (i > 7 ? 1 : 0);
                        }

                    }
                }

            )

            cronograma = [
                [
                    { rowSpan: 2, text: '#', style: 'textheader' },
                    { rowSpan: 2, text: 'Codigo', style: 'textheader' },
                    { rowSpan: 2, text: 'Activo', style: 'textheader' },
                    { rowSpan: 2, text: 'Marca', style: 'textheader' },
                    { rowSpan: 2, text: 'Modelo', style: 'textheader' },
                    { rowSpan: 2, text: 'Serie', style: 'textheader' },
                    { rowSpan: 2, text: 'Ubicacion', style: 'textheader' },
                    { rowSpan: 2, text: 'Proveedor Mtto', style: 'textheader' },
                    { colSpan: 12, text: 'Cronograma 2023', style: 'textheader' },
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    ''
                ],
                [
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    { text: 'Ene', style: 'textbodymonth' },
                    { text: 'Feb', style: 'textbodymonth' },
                    { text: 'Mar', style: 'textbodymonth' },
                    { text: 'Abr', style: 'textbodymonth' },
                    { text: 'May', style: 'textbodymonth' },
                    { text: 'Jun', style: 'textbodymonth' },
                    { text: 'Jul', style: 'textbodymonth' },
                    { text: 'Ago', style: 'textbodymonth' },
                    { text: 'Sep', style: 'textbodymonth' },
                    { text: 'Oct', style: 'textbodymonth' },
                    { text: 'Nov', style: 'textbodymonth' },
                    { text: 'Dic', style: 'textbodymonth' }
                ],

            ]
            consecutivo = 1
        }
    })
    const logo = await bufferLogo()
    const datadb = {
        content,
        logo
    }
    return datadb

}

const listadoActivoCosteado = async data => {
    // consultamos los datos del reporte,
    const clasificacion = await consultaconfi('SELECT id, TRIM(siglas) AS siglas FROM clasificacion_activos WHERE estado = 1')

    const todos = data.filtros.some(element => element.id === 'TD' && element.valor === true)
    let condicion

    if (!todos) {
        const filtrosSiglas = data.filtros.filter(element => element.valor)
        const filtros = clasificacion.filter(element => filtrosSiglas.some(item => item.id === element.siglas))
        if (filtros.length == 0) return { msg: 'Debe seleccionar un filtro valido' }

        filtros.forEach((element, index) => {
            if (index === 0) {
                if (data.estado) {
                    condicion = 'WHERE (la.clasificacion_id = ' + element.id
                } else {
                    condicion = 'WHERE (la.estado_id = 1 AND la.clasificacion_id = ' + element.id
                }

            } else {
                condicion = condicion + ' OR la.clasificacion_id = ' + element.id
            }
        });

        if (data.estado) {
            condicion = condicion + ') \nORDER BY la.clasificacion_id DESC, estado_id ASC, codigo;'
        } else {
            condicion = condicion + ') \nORDER BY la.clasificacion_id ASC, codigo;'
        }
    } else {

        if (data.estado) {
            condicion = 'ORDER BY la.clasificacion_id DESC, estado_id ASC, codigo;'
        } else {
            condicion = 'ORDER BY la.clasificacion_id ASC, codigo;'
        }
    }


    const datos = await sqlListadoActivoCosteado(condicion)
    if (datos.msg) return { msg: 'No fue posible consultar los datos' }


    let content = []
    let reporte = []
    let consecutivo = 1
    datos.forEach((element, index) => {
        const costo = parseFloat(element.valor.replace(',', '.'), 2)
        reporte.push(
            [
                consecutivo++,
                element.codigo,
                element.nombre,
                element.marca,
                element.modelo,
                element.serie,
                element.proceso,
                element.area,
                element.ubicacion,
                element.usuario,
                costo,
                element.totalMo,
                element.totalMp,
                (costo + element.totalMo + element.totalMp),
                element.estado
            ]
        )

        let ingresardatos = false

        if (datos.length === index + 1) {
            ingresardatos = true
        } else if (datos[index + 1].idSigla !== element.idSigla) {
            ingresardatos = true
        }

        if (ingresardatos) {
            reporte.unshift(

                [
                    { text: '#', style: 'header' },
                    { text: 'Codigo', style: 'header' },
                    { text: 'Activo', style: 'header' },
                    { text: 'Marca', style: 'header' },
                    { text: 'Modelo', style: 'header' },
                    { text: 'Serie', style: 'header' },
                    { text: 'Proceso', style: 'header' },
                    { text: 'Area', style: 'header' },
                    { text: 'Ubicacion', style: 'header' },
                    { text: 'Responsable', style: 'header' },
                    { text: 'Valor', style: 'header' },
                    { text: 'Valor Mo Mtto', style: 'header' },
                    { text: 'Valor Mp Mtto', style: 'header' },
                    { text: 'Total', style: 'header' },
                    { text: 'Estado', style: 'header' }
                ],

            )

            content.push(
                [
                    { text: element.clasificacion + ' "' + element.sigla + '" ', style: 'title' },
                    {
                        style: 'table',
                        table: {
                            widths: ['*', 55, 55, 55, 55, 55, 55, 55, 55, 70, 60, 60, 60, 60, '*'],
                            body: reporte,
                        },
                        layout: {
                            fillColor: function (rowIndex) {
                                return (rowIndex % 2 === 0) ? '#CCCCCC' : null;
                            },

                            hLineWidth: function (i, node) {
                                return (i === 1 || i === node.table.body.length) ? 2 : 0;
                            },
                            vLineWidth: function (i, node) {
                                return (i === 0 || i === node.table.widths.length) ? 2 : 0;
                            }

                        }
                    },
                ]
            )
            reporte = [];
            consecutivo = 1
        }
    })



    const logo = await bufferLogo()

    const datadb = {
        content,
        logo
    }
    return datadb

}

const informelistadoActivo = async data => {
    // consultamos los datos del reporte,
    const clasificacion = await consultaconfi('SELECT id, TRIM(siglas) AS siglas FROM clasificacion_activos WHERE estado = 1')

    const todos = data.filtros.some(element => element.id === 'TD' && element.valor === true)
    let condicion

    if (!todos) {
        const filtrosSiglas = data.filtros.filter(element => element.valor)
        const filtros = clasificacion.filter(element => filtrosSiglas.some(item => item.id === element.siglas))
        if (filtros.length == 0) return { msg: 'Debe seleccionar un filtro valido' }

        filtros.forEach((element, index) => {
            if (index === 0) {
                if (data.estado) {
                    condicion = 'WHERE (la.clasificacion_id = ' + element.id
                } else {
                    condicion = 'WHERE (la.estado_id = 1 AND la.clasificacion_id = ' + element.id
                }

            } else {
                condicion = condicion + ' OR la.clasificacion_id = ' + element.id
            }
        });

        if (data.estado) {
            condicion = condicion + ') \nORDER BY la.clasificacion_id DESC, estado_id ASC, codigo;'
        } else {
            condicion = condicion + ') \nORDER BY la.clasificacion_id ASC, codigo;'
        }
    } else {

        if (data.estado) {
            condicion = 'ORDER BY la.clasificacion_id DESC, estado_id ASC, codigo;'
        } else {
            condicion = 'ORDER BY la.clasificacion_id ASC, codigo;'
        }
    }


    const datos = await sqlInformeListadoActivo(condicion)
    if (datos.msg) return { msg: 'No fue posible consultar los datos' }


    let content = []
    let reporte = []
    let consecutivo = 1
    datos.forEach((element, index) => {
        reporte.push(
            [
                consecutivo++,
                element.codigo,
                element.nombre,
                element.marca,
                element.modelo,
                element.serie,
                element.proceso,
                element.area,
                element.ubicacion,
                element.usuario,
                element.estado
            ]
        )

        let ingresardatos = false

        if (datos.length === index + 1) {
            ingresardatos = true
        } else if (datos[index + 1].idSigla !== element.idSigla) {
            ingresardatos = true
        }

        if (ingresardatos) {
            reporte.unshift(

                [
                    { text: '#', style: 'header' },
                    { text: 'Codigo', style: 'header' },
                    { text: 'Activo', style: 'header' },
                    { text: 'Marca', style: 'header' },
                    { text: 'Modelo', style: 'header' },
                    { text: 'Serie', style: 'header' },
                    { text: 'Proceso', style: 'header' },
                    { text: 'Area', style: 'header' },
                    { text: 'Ubicacion', style: 'header' },
                    { text: 'Responsable', style: 'header' },
                    { text: 'Estado', style: 'header' }
                ],

            )

            content.push(
                [
                    { text: element.clasificacion + ' "' + element.sigla + '" ', style: 'title' },
                    {
                        style: 'table',
                        table: {
                            widths: [22.5, 43.5, 70, 60, 67, 67, 77, 55, 64, 80, 55],
                            body: reporte,
                        },
                        layout: {
                            fillColor: function (rowIndex) {
                                return (rowIndex % 2 === 0) ? '#CCCCCC' : null;
                            },

                            hLineWidth: function (i, node) {
                                return (i === 1 || i === node.table.body.length) ? 2 : 0;
                            },
                            vLineWidth: function (i, node) {
                                return (i === 0 || i === node.table.widths.length) ? 2 : 0;
                            }

                        }
                    },
                ]
            )
            reporte = []
            consecutivo = 1
        }
    })



    const logo = await bufferLogo()

    const datadb = {
        content,
        logo
    }
    return datadb

}

const informeInsumo = async data => {

    try {
        const consulta = await consultarInformeInsumos(data)
        if (consulta.msg) return { msg: 'No fue posible consultar los datos para el informe solicitado' }
        const insumo = consulta[0][0]
        if (insumo.imagen !== null && insumo.imagen !== '' && insumo.imagen !== undefined) {
            insumo.bufferImagen = await bufferimagen(insumo.imagen, data, 4)
        } else {
            insumo.bufferImagen = await bufferNoImage()
        }
        const movimientos = consulta[1]

        const bodyMovimientos = movimientos.map((element, index) => {
            let total = null
            let cantidad
            if (element.tipo == 'Entrada') {
                total = element.cantidadAnterior + element.cantidad
                cantidad = {text:element.cantidad, color:'#25B009'}
                
            }
            if (element.tipo == 'Salida') {
                total = element.cantidadAnterior - element.cantidad
                cantidad = {text:element.cantidad, color:'#F30E15'}
            }
            if (element.tipo == 'Arqueo') {
                total = element.cantidad
                cantidad = element.cantidad
            }


            return (

                [
                    index,
                    element.id,
                    element.fecha.toISOString().slice(0, 19).replace('T', ' '),
                    cantidad,
                    element.cantidadAnterior,
                    total,
                    element.tipo,
                    element.usuarioDestino,
                    element.usuarioResponsable,
                    element.descripcionAqueo
                ]
            )
        })

        bodyMovimientos.unshift(
            [
                { text: '#', bold: true, alignment: 'center' },
                { text: 'id Mov', bold: true, alignment: 'center' },
                { text: 'Fecha', bold: true, alignment: 'center' },
                { text: 'Cant Mov', bold: true, alignment: 'center' },
                { text: 'Cant Ant', bold: true, alignment: 'center' },
                { text: 'Total', bold: true, alignment: 'center' },
                { text: 'Tipo Mov', bold: true, alignment: 'center' },
                { text: 'Usu Recibido', bold: true, alignment: 'center' },
                { text: 'Usu Responsable', bold: true, alignment: 'center' },
                { text: 'Observacion', bold: true, alignment: 'center' },
            ]

        )



        return ({ insumo, bodyMovimientos })


    } catch (error) {
        console.log(error)
        return { msg: 'no fue posible crear el informe del insumo' }
    }
    // consultamos los datos del reporte,



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
