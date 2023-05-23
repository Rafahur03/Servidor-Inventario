import { datosValidacionComponetes } from "../db/sqlComponentes.js"
const validarDatosComponente = async componente => {

    const dataBd = await datosValidacionComponetes()

        if(dataBd.msg){
            return dataBd
        }
 

        if (!validarinfoId(dataBd[1].indexOf(componente.idNombre) == -1)) {
      
            return {msg: 'Debe seleccionar un componente valido de la lista de compoenentes'}
        }

        if (!validarinfoId(dataBd[0].indexOf(componente.idmarca) == -1)) {
      
            return {msg: 'Debe seleccionar una marca valida de la lista de marcas'}
        }

        if (validarText(element.serie)) {
          
            return {msg: 'los datos de serie no puede llevar catacteres como [], {}, (), <>'}
        }
        if (validarText(element.modelo)) {
           
            return {msg: 'los datos de modelo no puede llevar catacteres como [], {}, (), <>'}
        }
        if (validarText(element.capacidad)) {
          
            return {msg: 'los datos de capacidad no puede llevar catacteres como [], {}, (), <>'}
        }    

        return true
}

const validarText = str => {
    return str.includes('{') || str.includes('}') || str.includes('()') || str.includes(')') || str.includes('(')
}

const validarinfoId = (array, igual) => {
    const id = parseInt(igual)
    const even = (element) => element.id === id;
    return (array.some(even));
}


export {
    validarDatosComponente
}