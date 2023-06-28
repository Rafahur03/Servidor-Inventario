import { dataConfActivo } from "../db/sqlActivos.js"

const validarDatosActivo = async (datos) => {

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

    const id = datos.activo.split('-')[1]
    const areaId = datos.areaId.split('-')[1]
    const marcaId = datos.marcaId.split('-')[1]
    const procesoId = datos.procesoId.split('-')[1]
    const estadoId = datos.estadoId.split('-')[1]
    const proveedorId = datos.proveedorId.split('-')[1]
    const responsableId = datos.responsableId.split('-')[1]
    const tipoId = datos.tipoId.split('-')[1]
    const frecuecniaId = datos.frecuecniaId.split('-')[1]

    for (const key in config[1]) {
        if (config[1][key].id == marcaId) if (config[1][key].marca !== datos.marcaActivo) return { msg: 'Debe escoger una marca del listado' }
        if (config[1].length === key + 1) return { msg: 'Debe escoger una marca del listado' }
    }

    for (const key in config[2]) {
        if (config[2][key].id == procesoId) if (config[2][key].proceso !== datos.procesoActivo) return { msg: 'Debe escoger un proceso del listado' }
        if (config[2].length === key + 1) return { msg: 'Debe escoger una marca del listadoDebe escoger un proceso del listado' }
    }

    for (const key in config[3]) {
        if (config[3][key].id == areaId) if (config[3][key].area !== datos.areaActivo) return { msg: 'Debe escoger un area del listado' }
        if (config[3].length === key + 1) return { msg: 'Debe escoger un area del listado' }
    }

    for (const key in config[4]) {
        if (config[4][key].id == proveedorId) {
            if (datos.proveedorActivo.includes('--')) {
                const razonSocial = datos.proveedorActivo.split('--')[1].trim()
                if (config[4][key].razon_social !== razonSocial) return { msg: 'Debe escoger un proveedor del listado' }
            } else {
                if (config[4][key].razon_social !== datos.proveedorActivo) return { msg: 'Debe escoger un proveedor del listado' }
            }
        }
        if (config[4].length === key + 1) return { msg: 'Debe escoger un proveedor del listado' }
    }

    for (const key in config[5]) {
        if (config[5][key].id == tipoId) if (config[5][key].tipoActivo !== datos.tipoActivo) return { msg: 'Debe escoger un tipo de activo del listado' }
        if (config[5].length === key + 1) return { msg: 'Debe escoger un tipo de activo del listado' }
    }

    for (const key in config[6]) {
        if (config[6][key].id == estadoId) if (config[6][key].estado !== datos.estadoActivo) return { msg: 'Debe escoger un estado del listado' }
        if (config[6].length === key + 1) return { msg: 'Debe escoger un estado del listado' }
    }

    for (const key in config[7]) {
        if (config[7][key].id == responsableId) if (config[7][key].nombre !== datos.responsableActivo) return { msg: 'Debe escoger un responsable del listado' }
        if (config[7].length === key + 1) return { msg: 'Debe escoger un responsable del listado' }
    }

    for (const key in config[8]) {
        if (config[8][key].id == frecuecniaId) {
            if (datos.proveedorActivo.includes('--')) {
                const frecuencia = datos.frecuenciaMtto.split('--')[1].trim()
                if (config[8][key].frecuencia !== frecuencia) return { msg: 'Debe escoger una frecuencia del listado' }
            } else {
                if (config[8][key].frecuencia !== datos.frecuenciaMtto) return { msg: 'Debe escoger un frecuencia del listado' }
            }
        }
        if (config[8].length === key + 1) return { msg: 'Debe escoger un frecuencia del listado' }
    }

    return {
        id,
        nombre : datos.nombreActivo,
        marca_id : marcaId,
        modelo : datos.modeloActivo,
        serie : datos.serieActivo,
        proceso_id : procesoId,
        area_id : areaId,
        ubicacion : datos.ubicacionActivo,
        usuario_id : responsableId,
        estado_id : estadoId,
        proveedor_id : proveedorId,
        numero_factura : datos.facturaActivo,
        valor : datos.valorActivo,
        fecha_compra : datos.fechaCompra,
        vencimiento_garantia : datos.garantiaActivo,
        frecuencia_id : frecuecniaId,
        descripcion : datos.descripcionActivo,
        recomendaciones_Mtto : datos.recomendacionActivo,
        obervacion : datos.observacionActivo,
        proximoMtto: datos.proximoMtto,
        tipo_activo_id : tipoId
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