const validarDatoReporte =   (data) => { 
   

    const {
    tipoMtoo_id,
    fechareporte,
    costo_mo,
    costo_mp,
    proveedor_id,
    usuario_idaprovado,
    hallazgos,
    reporte,
    recomendaciones} = data
    
  
    if(typeof tipoMtoo_id !=='number' || tipoMtoo_id == ""){
        return {msg:'debe seleccionar un tipo de mantenimeinto valido'}  
    }

    if(typeof proveedor_id !=='number' || proveedor_id == "" ){
        return {msg:'debe seleccionar un proveedor de mantenimeinto valido'}  
    }

    if(typeof usuario_idaprovado !=='number' || usuario_idaprovado == ""){
        return {msg:'debe seleccionar el usuario que recibio el reporte verbal del mantenimiento'}  
    }

    if(typeof costo_mo !=='number' || typeof costo_mo !=='number' ){
        return {msg:'debe ingresar un numero valido en costo de mano de obra '}  
    }

    if(typeof costo_mp !=='number' || typeof costo_mp !=='number' ){
        return {msg:'debe ingresar un numero valido en costo de mano de materia prima '}  
    }

    const fecha = new Date(fechareporte)
    
    if(isNaN(fecha)){
        return {msg:'debe escoger una fecha valida'}  
    }
    const hoy = new Date().toLocaleDateString()
    const fechastring = fecha.toLocaleDateString()

    if(new Date(fechastring).getTime() > new Date(hoy).getTime()){
        return {msg:'La fecha del realizacion del mantenimiento no puede ser mayor al dia de hoy'}
    }

    if(hallazgos.length == 0 || hallazgos ==""){
        return {msg:'El campo solicitud no puede estar vacio'}
    }

    const validarHallazgos = validarText(hallazgos)
    
    if(validarHallazgos){
        return ({msg:'El campo solicitud no puede contener los caracteres {} , () o <>'})
    }

    if(reporte.length == 0 || reporte ==""){
        return {msg:'El campo solicitud no puede estar vacio'}
    }

    const validarreporte = validarText(reporte)
    
    if(validarreporte){
        return ({msg:'El campo solicitud no puede contener los caracteres {} , () o <>'})
    }

    if(recomendaciones.length == 0 || recomendaciones ==""){
        return {msg:'El campo solicitud no puede estar vacio'}
    }

    const validarRecomendaciones = validarText(recomendaciones)
    
    if(validarRecomendaciones){
        return ({msg:'El campo solicitud no puede contener los caracteres {} , () o <>'})
    }

    return true
  
}

const validarText = str =>{
    return str.includes('{') || str.includes('}') ||str.includes('()') ||str.includes(')')  || str.includes('(') || str.includes('<')  || str.includes('>')  
}


export{
    validarDatoReporte
}