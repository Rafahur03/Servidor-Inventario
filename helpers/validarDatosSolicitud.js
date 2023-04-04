const validarDatoSolicitud =   (data) => { 
    
    const {solicitud} = data
  
    if(solicitud.length == 0 || solicitud ==""){
        return {msg:'El campo solicitud no puede estar vacio'}
    }

    const validar = validarText(solicitud)
    
    if(validar){
        return ({msg:'El campo solicitud no puede contener los caracteres {} , () o <>'})
    }

    return true
  
}

const validarText = str =>{
    return str.includes('{') || str.includes('}') ||str.includes('()') ||str.includes(')')  || str.includes('(') || str.includes('<')  || str.includes('>')  
}


export{validarDatoSolicitud }