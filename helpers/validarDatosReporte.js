import { dataConfReporte } from "../db/sqlReportes.js"

const validarDatoReporte = async (datos, token) => {

    if (datos.solicitud != datos.idSolicitud) return { msg: 'No fue posible validar la solicitud' }

    if (validarVacios(datos.estadoActivoId)) return { msg: 'El campo estado activo no puede estar vacio' }

    if (validarId(datos.estadoActivoId)) return { msg: 'Debe escoger un elemento de la lista en el campo Estado Activo' }

    if (validarVacios(datos.tipoMantenimientoId)) return { msg: 'El campo tipo de mantenimiento no puede estar vacio' }

    if (validarId(datos.tipoMantenimientoId)) return { msg: 'Debe escoger un elemento de la lista en el campo tipo de mantenimiento' }

    if (validarVacios(datos.provedorMttoId)) return { msg: 'El campo proveedor de manteniento no puede estar vacio' }

    if (validarId(datos.provedorMttoId)) return { msg: 'Debe escoger un elemento de la lista en el campo proveedor de manteniento' }

    if (validarVacios(datos.recibidoConformeId)) return { msg: 'El campo recibido conforme no puede estar vacio' }

    if (validarId(datos.recibidoConformeId)) return { msg: 'Debe escoger un elemento de la lista en el campo recibido conforme' }

    if (validarVacios(datos.estadoSolicitudId)) return { msg: 'El campo Estado solicitud no puede estar vacio' }

    if (validarId(datos.estadoSolicitudId)) return { msg: 'Debe escoger un elemento de la lista en el campo Estado solicitud' }

    if (validarVacios(datos.hallazgos)) return { msg: 'El campo Hallazgo es obligatorio' }

    if (validarCaracteres(datos.hallazgos)) return { msg: 'El campo Hallazgo no puede contener caracteres como {}, () []' }

    if (validarPalabras(datos.hallazgos)) return { msg: 'El campo Hallazgo no puede contener palabras como Select, From ect..' }

    if (validarVacios(datos.reporte)) return { msg: 'El campo reporte es obligatorio' }

    if (validarCaracteres(datos.reporte)) return { msg: 'El campo reporte no puede contener caracteres como {}, () []' }

    if (validarPalabras(datos.reporte)) return { msg: 'El campo reporte no puede contener palabras como Select, From ect..' }

    if (validarVacios(datos.recomendaciones)) return { msg: 'El campo recomendaciones es obligatorio' }

    if (validarCaracteres(datos.recomendaciones)) return { msg: 'El campo recomendaciones no puede contener caracteres como {}, () []' }

    if (validarPalabras(datos.recomendaciones)) return { msg: 'El campo recomendaciones no puede contener palabras como Select, From ect..' }

    if (validarVacios(datos.costoMo)) return { msg: 'El campo costo de mano de obra es obligatorio' }

    if (validarCaracteres(datos.costoMo)) return { msg: 'El campo costo de mano de obra no puede contener caracteres como {}, () []' }

    if (validarPalabras(datos.costoMo)) return { msg: 'El campo costo de mano de obra no puede contener palabras como Select, From ect..' }

    if (validarVacios(datos.costoMp)) return { msg: 'El campo costo de materiales es obligatorio' }

    if (validarCaracteres(datos.costoMp)) return { msg: 'El campo costo de materiales no puede contener caracteres como {}, () []' }

    if (validarPalabras(datos.costoMp)) return { msg: 'El campo costo de materiales no puede contener palabras como Select, From ect..' }

    const config = await dataConfReporte()
    if (config.msg) return { msg: 'no se pudieron validar correctamente los datos intentalo más tarde' }

    const estadoActivoId = datos.estadoActivoId.split('-')[1]
    const tipoMantenimientoId = datos.tipoMantenimientoId.split('-')[1]
    const estadoSolicitudId = datos.estadoSolicitudId.split('-')[1]
    const provedorMttoId = datos.provedorMttoId.split('-')[1]
    const recibidoConformeId = datos.recibidoConformeId.split('-')[1]

    for (let key in config[0]) {
        let encontrado = null
        if (config[0][key].id == estadoActivoId) if (config[0][key].estado !== datos.estadoActivo) {
            encontrado = 1
            return { msg: 'Debe escoger un estado del activo del listado' }
        }
        if (encontrado !== null) break
        if (config[0].length === key + 1) return { msg: 'Debe escoger un estado del activo del listado' }

    }

    for (let key in config[1]) {
        let encontrado = null
        if (config[1][key].id == tipoMantenimientoId) if (config[1][key].tipoMtto !== datos.tipoMantenimiento) {
            encontrado = 1
            return { msg: 'Debe escoger un tipo de mantenimiento del listado' }

        }
        if (encontrado !== null) break
        if (config[1].length === key + 1) return { msg: 'Debe escoger un tipo de mantenimiento del listado' }
    }


    for (let key in config[2]) {
        let encontrado = null
        if (config[2][key].id == estadoSolicitudId) if (config[2][key].estado !== datos.estadoSolicitud) {
            encontrado = 1
            return { msg: 'Debe escoger un estado de solicitud del listado' }

        }
        if (encontrado !== null) break
        if (config[2].length === key + 1) return { msg: 'Debe escoger un estado de solicitud del listado' }
    }


    for (let key in config[3]) {
        let encontrado = null
        if (config[3][key].id == provedorMttoId) {
            if (datos.provedorMtto.includes('--')) {
                const razonSocial = datos.provedorMtto.split('--')[0].trim()
                if (config[3][key].razon_social !== razonSocial) {
                    encontrado = 1
                    return { msg: 'Debe escoger un proveedor de mantenimiento del listado' }

                }
            } else {
                if (config[3][key].razon_social !== datos.provedorMtto) {
                    encontrado = 1
                    return { msg: 'Debe escoger proveedor de mantenimiento del listado' }

                }
            }
        }
        if (encontrado !== null) break
        if (config[3].length === key + 1) return { msg: 'Debe escoger un proveedor de mantenimiento del listado' }
    }

    for (let key in config[4]) {
        let encontrado = null
        if (config[4][key].id == recibidoConformeId) if (config[4][key].nombre !== datos.recibidoConforme) {
            encontrado = 1
            return { msg: 'Debe escoger un responsable del recibido conforme del listado' }

        }
        if (encontrado !== null) break
        if (config[4].length === key + 1) return { msg: 'Debe escoger un responsable del recibido conforme del listado' }
    }

    const timestamp = Date.now();
    const fechaActual = new Date(timestamp).toISOString().substring(0, 10)

    if (datos.fechaReporte == '') return { titulo: 'ERROR', mensaje: 'El campo fecha de reporte es obligatorio' }

    if (fechaActual < datos.fechaReporte) return { titulo: 'ERROR', mensaje: 'La fecha de reporte no puede ser mayor al dia de hoy' }

    return true

}

const validarId = (datos) => {
    if (!datos.includes('-')) return true
    const id = parseInt(datos.split('-')[1])
    if (id == NaN) return true
    return false
}

const validarVacios = dato => {
    if (dato.includes('')) {
        if (dato.trim() == '') return true
    } else {
        if (dato == '') return true
    }
    return false
}

const validarCaracteres = dato => {
    if (dato.includes('{') || dato.includes('}') || dato.includes('(') || dato.includes(')') || dato.includes('[') || dato.includes(']') || dato.includes('<') || dato.includes('>')) {
        return true
    }
    return false
}

const validarPalabras = dato => {
    if (dato.includes('select') || dato.includes('Select') || dato.includes('SELECT') || dato.includes('FROM') || dato.includes('From') || dato.includes('from') || dato.includes('insert') || dato.includes('Insert') || dato.includes('INSERT')) {
        return true
    }
    return false
}

export  {
    validarDatoReporte
}