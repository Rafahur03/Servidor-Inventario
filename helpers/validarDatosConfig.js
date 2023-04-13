
const validarDatosConfigActualizar = (data) => {


    if (typeof data.estado !== 'number' || data.estado == "") {
        return { msg: 'Debe escoger un estado valido' }
    }
    if (data.dv) {
        if (typeof data.dv !== 'number' || data.dv == "") {
            return { msg: 'Debe dv ser un numero entero' }
        }
    }
    
    if (data.nombre.length == 0 || data.nombre == "") {
        return { msg: 'El campo nombre no puede estar vacio' }
    }

    const validarnombre = validarText(data.nombre)

    if (validarnombre) {
        return ({ msg: 'El campo nombre no puede contener los caracteres {} , () o <>' })
    }

    if (data.dias) {
        if (typeof data.dias !== 'number' || data.dias == "") {
            return { msg: 'debe ingresar en dias un numero entero' }
        }
    }

    if (data.proceso) {
        if (data.proceso.length == 0 || data.proceso == "") {
            return { msg: 'El campo proceso no puede estar vacio' }
        }

        const validarproceso = validarText(data.proceso)

        if (validarproceso) {
            return ({ msg: 'El campo proceso no puede contener los caracteres {} , () o <>' })
        }

    }

    if (data.sigla) {
        if (data.sigla.length == 0 || data.sigla == "") {
            return { msg: 'El campo sigla no puede estar vacio' }
        }

        const validarsigla = validarText(data.sigla)

        if (validarsigla) {
            return ({ msg: 'El campo sigla no puede contener los caracteres {} , () o <>' })
        }

    }

    if (data.nombre_comercial) {
        if (data.nombre_comercial.length == 0 || data.nombre_comercial == "") {
            return { msg: 'El campo nombre_comercial no puede estar vacio' }
        }

        const validarnombre_comercial = validarText(data.nombre_comercial)

        if (validarnombre_comercial) {
            return ({ msg: 'El campo nombre comercial no puede contener los caracteres {} , () o <>' })
        }

    }

    if (data.razon_social) {
        if (data.razon_social.length == 0 || data.razon_social == "") {
            return { msg: 'El campo razon social no puede estar vacio' }
        }

        const validarrazon_social = validarText(data.razon_social)

        if (validarrazon_social) {
            return ({ msg: 'El campo razon social no puede contener los caracteres {} , () o <>' })
        }

    }

    if (data.direccion) {
        if (data.direccion.length == 0 || data.direccion == "") {
            return { msg: 'El campo direccion no puede estar vacio' }
        }

        const validardireccion = validarText(data.direccion)

        if (validardireccion) {
            return ({ msg: 'El campo direccion no puede contener los caracteres {} , () o <>' })
        }

    }

    if (data.telefonos) {
        if (data.telefonos.length == 0 || data.telefonos == "") {
            return { msg: 'El campo telefonos no puede estar vacio' }
        }

        const validartelefonos = validarText(data.telefonos)

        if (validartelefonos) {
            return ({ msg: 'El campo telefonos no puede contener los caracteres {} , () o <>' })
        }

    }

    if (data.contacto) {
        if (data.contacto.length == 0 || data.contacto == "") {
            return { msg: 'El campo telefonos no puede estar vacio' }
        }

        const validarcontacto = validarText(data.contacto)

        if (validarcontacto) {
            return ({ msg: 'El campo contacto no puede contener los caracteres {} , () o <>' })
        }

    }

    if (data.contacto) {
        if (data.contacto.length == 0 || data.contacto == "") {
            return { msg: 'El campo telefonos no puede estar vacio' }
        }

        const validarcontacto = validarText(data.contacto)

        if (validarcontacto) {
            return ({ msg: 'El campo contacto no puede contener los caracteres {} , () o <>' })
        }

    }

    if (data.nit) {
        if (data.nit.length == 0 || data.nit == "") {
            return { msg: 'El campo nit no puede estar vacio' }
        }

        const validarnit = validarText(data.nit)

        if (validarnit) {
            return ({ msg: 'El campo nit no puede contener los caracteres {} , () o <>' })
        }

    }

    return true

}

const validarDatosConfigNuevo = (data) => {

   
    if (data.dv) {
        if (typeof data.dv !== 'number' || data.dv == "") {
            return { msg: 'Debe dv ser un numero entero' }
        }
    }
    
    if (data.nombre.length == 0 || data.nombre == "") {
        return { msg: 'El campo nombre no puede estar vacio' }
    }

    const validarnombre = validarText(data.nombre)

    if (validarnombre) {
        return ({ msg: 'El campo nombre no puede contener los caracteres {} , () o <>' })
    }

    if (data.dias) {
        if (typeof data.dias !== 'number' || data.dias == "") {
            return { msg: 'debe ingresar en dias un numero entero' }
        }
    }

    if (data.proceso) {
        if (data.proceso.length == 0 || data.proceso == "") {
            return { msg: 'El campo proceso no puede estar vacio' }
        }

        const validarproceso = validarText(data.proceso)

        if (validarproceso) {
            return ({ msg: 'El campo proceso no puede contener los caracteres {} , () o <>' })
        }

    }

    if (data.sigla) {
        if (data.sigla.length == 0 || data.sigla == "") {
            return { msg: 'El campo sigla no puede estar vacio' }
        }

        const validarsigla = validarText(data.sigla)

        if (validarsigla) {
            return ({ msg: 'El campo sigla no puede contener los caracteres {} , () o <>' })
        }

    }

    if (data.nombre_comercial) {
        if (data.nombre_comercial.length == 0 || data.nombre_comercial == "") {
            return { msg: 'El campo nombre_comercial no puede estar vacio' }
        }

        const validarnombre_comercial = validarText(data.nombre_comercial)

        if (validarnombre_comercial) {
            return ({ msg: 'El campo nombre comercial no puede contener los caracteres {} , () o <>' })
        }

    }

    if (data.razon_social) {
        if (data.razon_social.length == 0 || data.razon_social == "") {
            return { msg: 'El campo razon social no puede estar vacio' }
        }

        const validarrazon_social = validarText(data.razon_social)

        if (validarrazon_social) {
            return ({ msg: 'El campo razon social no puede contener los caracteres {} , () o <>' })
        }

    }

    if (data.direccion) {
        if (data.direccion.length == 0 || data.direccion == "") {
            return { msg: 'El campo direccion no puede estar vacio' }
        }

        const validardireccion = validarText(data.direccion)

        if (validardireccion) {
            return ({ msg: 'El campo direccion no puede contener los caracteres {} , () o <>' })
        }

    }

    if (data.telefonos) {
        if (data.telefonos.length == 0 || data.telefonos == "") {
            return { msg: 'El campo telefonos no puede estar vacio' }
        }

        const validartelefonos = validarText(data.telefonos)

        if (validartelefonos) {
            return ({ msg: 'El campo telefonos no puede contener los caracteres {} , () o <>' })
        }

    }

    if (data.contacto) {
        if (data.contacto.length == 0 || data.contacto == "") {
            return { msg: 'El campo telefonos no puede estar vacio' }
        }

        const validarcontacto = validarText(data.contacto)

        if (validarcontacto) {
            return ({ msg: 'El campo contacto no puede contener los caracteres {} , () o <>' })
        }

    }

    if (data.contacto) {
        if (data.contacto.length == 0 || data.contacto == "") {
            return { msg: 'El campo telefonos no puede estar vacio' }
        }

        const validarcontacto = validarText(data.contacto)

        if (validarcontacto) {
            return ({ msg: 'El campo contacto no puede contener los caracteres {} , () o <>' })
        }

    }

    if (data.nit) {
        if (data.nit.length == 0 || data.nit == "") {
            return { msg: 'El campo nit no puede estar vacio' }
        }

        const validarnit = validarText(data.nit)

        if (validarnit) {
            return ({ msg: 'El campo nit no puede contener los caracteres {} , () o <>' })
        }

    }

    return true

}

const validarText = str => {
    return str.includes('{') || str.includes('}') || str.includes('()') || str.includes(')') || str.includes('(') || str.includes('<') || str.includes('>')
}


export { validarDatosConfigActualizar, validarDatosConfigNuevo }

