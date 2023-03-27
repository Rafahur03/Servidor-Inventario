import { dataConfActivo } from "../db/sqlActivos.js";


const validarDatosActivo =  async (data) => { 
    const {clasificacion_id,
    nombre,
    marca_id,
    modelo,
    serie,
    proceso_id,
    area_id,
    ubicacion,
    usuario_id,
    estado_id,
    proveedor_id,
    numero_factura,
    valor,
    fecha_compra,
    vencimiento_garantia,
    frecuencia_id,
    descripcion,
    recomendaciones_Mtto,
    obervacion,
    tipo_activo_id} = data
    

    const dataBd = await dataConfActivo()

    if(nombre.length == 0 || nombre =="" || nombre <= 5){
        return {msg:'El campo nombre no puede estar vacio y no pude tener menos de 5 caracteres'}
    }

    if(validarText(nombre)){
        return {msg:'El campo nombre no puede contener los caracteres {} o ()'}
    }

    if(modelo.length == 0 || modelo ==""){
        return {msg:'El campo modelo no puede estar vacio y no pude tener menos de 5 caracteres'}
    }

    if(validarText(modelo)){
        return {msg:'El campo modelo no puede contener los caracteres {} o ()'}
    }

    if(serie.length == 0 || serie ==""){
        return {msg:'El campo serie no puede estar vacio y no pude tener menos de 5 caracteres'}
    }

    if(validarText(serie)){
        return {msg:'El campo serie no puede contener los caracteres {} o ()'}
    }

    if(ubicacion.length == 0 || ubicacion ==""){
        return {msg:'El campo ubicacion no puede estar vacio y no pude tener menos de 5 caracteres'}
    }

    if(validarText(ubicacion)){
        return {msg:'El campo ubicacion no puede contener los caracteres {} o ()'}
    }

    if(numero_factura.length == 0 || numero_factura ==""){
        return {msg:'El campo ubicacion no puede estar vacio y no pude tener menos de 5 caracteres'}
    }

    if(validarText(numero_factura)){
        return {msg:'El campo numero factura no puede contener los caracteres {} o ()'}
    }

    if(validarText(descripcion)){
        return {msg:'El campo descripcion no puede contener los caracteres {} o ()'}
    }
    if(validarText(recomendaciones_Mtto)){
        return {msg:'El recomendaciones de Mtto no puede contener los caracteres {} o ()'}
    }
    if(validarText(obervacion)){
        return {msg:'El campo observeciones no puede contener los caracteres {} o ()'}
    }

    const regularNumber = /^[0-9]+$/

    if (!regularNumber.test(valor)) {
        return {msg: 'El campo valor solo puede contener numeros'}
    }

    if(isNaN(Date.parse(fecha_compra))){
        return {msg: 'Debe ingresar una fecha validad en el campo fecha de compra'}
    }

    if(isNaN(Date.parse(vencimiento_garantia))){
        return {msg: 'Debe ingresar una fecha validad en el campo vencimiento de garantia'}
    }
     
    if(!validarinfoId(dataBd[0], clasificacion_id)){
        return {msg:'debe seleccionar una clasificacion de activos de la lista desplegable'}
    }
    if(!validarinfoId(dataBd[1], marca_id)){
        return {msg:'debe seleccionar una marca de la lista desplegable'}
    }
    if(!validarinfoId(dataBd[2], proceso_id)){
        return {msg:'debe seleccionar un proceso de la lista desplegable'}
    }
    if(!validarinfoId(dataBd[3], area_id)){
        return {msg:'debe seleccionar una area de la lista desplegable'}
    }
    if(!validarinfoId(dataBd[4], proveedor_id)){
        return {msg:'debe seleccionar una proveedor de la lista desplegable'}
    }
    if(!validarinfoId(dataBd[5], tipo_activo_id)){
        return {msg:'debe seleccionar un tipo de activo de la lista desplegable'}
    }
    if(!validarinfoId(dataBd[6], estado_id)){
        return {msg:'debe seleccionar una estado de la lista desplegable'}
    }
    if(!validarinfoId(dataBd[7], usuario_id)){
        return {msg:'debe seleccionar un responsable de la lista desplegable'}
    }
    if(!validarinfoId(dataBd[8], frecuencia_id)){
        return {msg:'debe seleccionar una frecuencia de mtto de la lista desplegable'}
    }
    
    return true
  
}

const validarText = str =>{
    return str.includes('{') || str.includes('}') ||str.includes('()') ||str.includes(')')  ||str.includes('(')    
}

const validarinfoId = (array, igual)=>{
    const id = parseInt(igual)
    const even = (element) => element.id === id;
    return(array.some(even));
}

export{validarDatosActivo }
