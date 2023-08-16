import { dataConfActivo } from "../db/sqlActivos.js"

const validarDatosActivo = async (datos, crear = null) => {

    for (const key in datos) {

        if (key === 'areaId' || key === 'marcaId' || key === 'procesoId' || key === 'estadoId' || key === 'proveedorId' || key === 'responsableId' || key === 'tipoId' || key === 'frecuecniaId' || key === 'activo') {
            if (validarVacios(datos[key])) return { msg: 'El campo ' + key.replace('Id', '') + ' no puede estar vacio escoja un elemento de la lista o primero' }

            if (validarCaracteres(datos[key])) return { msg: 'El campo ' + key.replace('Id', '') + ' no puede contener caracteres como <>, {} o [] este' }

            if (validarPalabras(datos[key])) return { msg: 'El campo ' + key.replace('Id', '') + ' no puede contener palabras reservadas como Select, from, insert ect. o este' }

            if (validarId(datos[key])) return { msg: 'este Debe escoger un elemento de la lista en el campo ' + key.replace('Id', '') }

        } else {

            if (key !== 'descripcionActivo' && key !== 'recomendacionActivo' && key !== 'observacionActivo') {

                if (validarVacios(datos[key])) return { msg: 'El campo ' + key.replace('Activo', '') + ' no puede estar vacio' }

                if (validarCaracteres(datos[key])) return { msg: 'El campo ' + key.replace('Activo', '') + ' no puede contener caracteres como <>, {} o []' }

                if (validarPalabras(datos[key])) return { msg: 'El campo ' + key.replace('Activo', '') + ' no puede contener palabras reservadas como Select, from, insert ect.' }

            } else {
                if (validarCaracteres(datos[key])) return { msg: 'El campo ' + key.replace('Activo', '') + ' no puede contener caracteres como <>, {} o []' }

                if (validarPalabras(datos[key])) return { msg: 'El campo ' + key.replace('Activo', '') + ' no puede contener palabras reservadas como Select, from, insert ect.' }
            }

        }
    }

    const config = await dataConfActivo()
    if (config.msg) return { msg: 'no se pudieron validar correctamente los datos intentalo más tarde' }
    let id = null
    if (crear === null) id = datos.activo.split('-')[1]
    const areaId = datos.areaId.split('-')[1]
    const marcaId = datos.marcaId.split('-')[1]
    const procesoId = datos.procesoId.split('-')[1]
    const proveedorId = datos.proveedorId.split('-')[1]
    const responsableId = datos.responsableId.split('-')[1]
    const tipoId = datos.tipoId.split('-')[1]
    const frecuecniaId = datos.frecuecniaId.split('-')[1]
    let estado_id
    let clasificacion_id = null

    if (crear !== null){
        clasificacion_id = datos.clasificacionId.split('-')[1]
        for (let key in config[0]) {
            let encontrado = null
            if (config[0][key].id == clasificacion_id) {
                if (datos.clasificacionActivo.includes('--')) {
                    const clasificacionActivo = datos.clasificacionActivo.split('--')[1].trim()
                    if (config[0][key].nombre !== clasificacionActivo) {
                        encontrado = 1
                        return { msg: ' Debe escoger una clasificacion del listado' }

                    }
                } else {
                    if (config[0][key].nombre !== datos.clasificacionActivo) {
                        encontrado = 1
                        return { msg: ' Debe escoger una clasificacion del listado' }

                    }
                }
            }
            if (encontrado !== null) break
            if (config[0].length === key + 1) return { msg: 'Debe escoger una clasificacion del listado' }
        }
    }


    for (let key in config[1]) {
        let encontrado = null
        if (config[1][key].id == marcaId) if (config[1][key].marca !== datos.marcaActivo) {
            encontrado = 1
            return { msg: 'Debe escoger una marca del listado' }
        }
        if (encontrado !== null) break
        if (config[1].length === key + 1) return { msg: 'Debe escoger una marca del listado' }
    }

    for (let key in config[2]) {
        let encontrado = null
        if (config[2][key].id == procesoId) {
            if (datos.procesoActivo.includes('--')) {
                const procesoActivo = datos.procesoActivo.split('--')[1].trim()
                if (config[2][key].proceso !== procesoActivo) {
                    encontrado = 1
                    return { msg: ' Debe escoger un proceso del listado' }

                }
            } else {
                if (config[2][key].proceso !== datos.procesoActivo) {
                    encontrado = 1
                    return { msg: ' Debe escoger un proceso del listado' }

                }
            }
        }
        if (encontrado !== null) break
        if (config[2].length === key + 1) return { msg: ' Debe escoger un proceso del listado' }
    }

    for (let key in config[3]) {
        let encontrado = null
        if (config[3][key].id == areaId) if (config[3][key].area !== datos.areaActivo) {
            encontrado = 1
            return { msg: 'Debe escoger un area del listado' }

        }
        if (encontrado !== null) break
        if (config[3].length === key + 1) return { msg: 'Debe escoger un area del listado' }
    }

    for (let key in config[4]) {
        let encontrado = null
        if (config[4][key].id == proveedorId) {
            if (datos.proveedorActivo.includes('--')) {
                const razonSocial = datos.proveedorActivo.split('--')[1].trim()
                if (config[4][key].razon_social !== razonSocial) {
                    encontrado = 1
                    return { msg: 'Debe escoger un proveedor del listado' }

                }
            } else {
                if (config[4][key].razon_social !== datos.proveedorActivo) {
                    encontrado = 1
                    return { msg: 'Debe escoger un proveedor del listado' }

                }
            }
        }
        if (encontrado !== null) break
        if (config[4].length === key + 1) return { msg: 'Debe escoger un proveedor del listado' }
    }

    for (let key in config[5]) {
        let encontrado = null
        if (config[5][key].id == tipoId) if (config[5][key].tipoActivo !== datos.tipoActivo) {
            encontrado = 1
            return { msg: 'Debe escoger un tipo de activo del listado' }

        }
        if (encontrado !== null) break
        if (config[5].length === key + 1) return { msg: 'Debe escoger un tipo de activo del listado' }
    }

    if (crear == null) {
        const estado_id = datos.estadoId.split('-')[1]
        for (let key in config[6]) {
            let encontrado = null
            if (config[6][key].id == estado_id) if (config[6][key].estado !== datos.estadoActivo) {
                encontrado = 1
                return { msg: 'Debe escoger un estado del listado' }

            }
            if (encontrado !== null) break
            if (config[6].length === key + 1) return { msg: 'Debe escoger un estado del listado' }
        }
    } else {
        estado_id = 1
    }

    for (let key in config[7]) {
        let encontrado = null
        if (config[7][key].id == responsableId) if (config[7][key].nombre !== datos.responsableActivo) {
            encontrado = 1
            return { msg: 'Debe escoger un responsable del listado' }

        }
        if (encontrado !== null) break
        if (config[7].length === key + 1) return { msg: 'Debe escoger un responsable del listado' }
    }

    for (let key in config[8]) {
        let encontrado = null
        if (config[8][key].id == frecuecniaId) {
            if (datos.proveedorActivo.includes('--')) {
                const frecuencia = datos.frecuenciaMtto.split('--')[1].trim()
                if (config[8][key].frecuencia !== frecuencia) {
                    encontrado = 1
                    return { msg: 'Debe escoger una frecuencia del listado' }

                }
            } else {
                if (config[8][key].frecuencia !== datos.frecuenciaMtto) {
                    encontrado = 1
                    return { msg: 'Debe escoger un frecuencia del listado' }

                }
            }
        }
        if (encontrado !== null) break
        if (config[8].length === key + 1) return { msg: 'Debe escoger un frecuencia del listado' }
    }

    const timestamp = Date.now();
    const fechaActual = new Date(timestamp).toISOString().substring(0, 10)

    if (datos.ingresoActivo == '') return modalMensaje({ titulo: 'ERROR', mensaje: 'El campo fecha de ingreso es obligatorio' })
    if (datos.fechaCompra == '') return modalMensaje({ titulo: 'ERROR', mensaje: 'El campo fecha de compra es obligatorio' })
    if (datos.garantiaActivo == '') return modalMensaje({ titulo: 'ERROR', mensaje: 'El campo fecha de vencimiento de la garantia es obligatorio' })
    if (datos.proximoMtto == '') return modalMensaje({ titulo: 'ERROR', mensaje: 'El campo fecha de proximo mantenimiento es obligatorio' })

    if (datos.ingresoActivo !== fechaActual) return modalMensaje({ titulo: 'ERROR', mensaje: 'La fecha de ingreso no puede ser diferente del dia de hoy' })
    if (datos.fechaCompra > fechaActual) return modalMensaje({ titulo: 'ERROR', mensaje: 'La fecha de compra no puede ser superior al dia de hoy' })
    if (datos.garantiaActivo < datos.fechaCompra) return modalMensaje({ titulo: 'ERROR', mensaje: 'la fecha de vencimiento de la garantia no puede ser menor a la fecha de compra' })
    if (datos.proximoMtto < fechaActual) return modalMensaje({ titulo: 'ERROR', mensaje: 'la fecha del proximo mantenimeinto no puede ser inferior a el dia de hoy' })

    return {
        id,
        clasificacion_id,
        nombre: datos.nombreActivo,
        marca_id: marcaId,
        modelo: datos.modeloActivo,
        serie: datos.serieActivo,
        proceso_id: procesoId,
        area_id: areaId,
        ubicacion: datos.ubicacionActivo,
        usuario_id: responsableId,
        estado_id,
        proveedor_id: proveedorId,
        numero_factura: datos.facturaActivo,
        valor: datos.valorActivo,
        fecha_compra: datos.fechaCompra,
        vencimiento_garantia: datos.garantiaActivo,
        frecuencia_id: frecuecniaId,
        descripcion: datos.descripcionActivo,
        recomendaciones_Mtto: datos.recomendacionActivo,
        obervacion: datos.observacionActivo,
        proximoMtto: datos.proximoMtto,
        tipo_activo_id: tipoId,
        fecha_creacion: crear = null ? null : fechaActual
    }



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

export {
    validarDatosActivo
}