const validarDatoSolicitud =   (datos) => { 
    
    if(validarVacios( datos.idActivo) && validarCaracteres( datos.idActivo) && validarPalabras( datos.idActivo)) return {msg: 'Debe seleccionar un activo valido para poder crear la solciud'}
    
    if(validarVacios( datos.descripcion )) return {msg: 'El campo descripcion es obligatorio'}

    if(validarCaracteres( datos.descripcion )) return {msg: 'El campo descripcion no puede contener caracteres como {}, () []'}
    
    if(validarPalabras( datos.descripcion )) return {msg: 'El campo descripcion no puede contener palabras como Select, From ect..'}
    
    
    return true

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



export{validarDatoSolicitud }