import { datosValidacionComponetes } from "../db/sqlComponentes.js"
const validarDatosComponente = async componente => {

    const dataBd = await datosValidacionComponetes()

        if(dataBd.msg){
            return dataBd
        }
        let validarComponentesId = false
        for (const element of dataBd[1]) {
            if (element.id == componente.idNombre) {
                validarComponentesId= true
                break; // Si se encuentra la coincidencia, salir del bucle
            }
        }

        if(!validarComponentesId){
            return {msg: 'Debe seleccionar un componente valido de la lista de componentes'}
        }

        let validarmarcaId = false
        for (const element of dataBd[0]) {
            if (element.id == componente.idmarca) {
                validarmarcaId= true
                break; // Si se encuentra la coincidencia, salir del bucle
            }
        }

        if(!validarmarcaId){
            return {msg: 'Debe seleccionar una marca valida de la lista de marcas'}
        }

        if (validarText(componente.serie)) {
          
            return {msg: 'los datos de serie no puede llevar catacteres como [], {}, (), <>'}
        }
        if (validarText(componente.modelo)) {
           
            return {msg: 'los datos de modelo no puede llevar catacteres como [], {}, (), <>'}
        }
        if (validarText(componente.capacidad)) {
          
            return {msg: 'los datos de capacidad no puede llevar catacteres como [], {}, (), <>'}
        }    

        return true
}

const validarText = str => {
    return str.includes('{') || str.includes('}') || str.includes('()') || str.includes(')') || str.includes('(')
}

export {
    validarDatosComponente
}