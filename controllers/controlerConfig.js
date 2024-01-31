
import { consultaconfi, actualizarConfigDb, guardarConfig, consultarTodasTablas, consultarConfuno } from "../db/sqlConfig.js"

const consultarconfig = async (req, res) => {

    const query = {
        1: 'SELECT id, TRIM(area) AS area, estado FROM areas WHERE estado = 1',
        2: 'SELECT id, TRIM(marca) AS marca, estado FROM marca_activos WHERE estado = 1',
        3: 'SELECT id, TRIM(tipo_activo) AS tipo_activo, estado FROM tipo_activo WHERE estado = 1',
        4: 'SELECT id, TRIM(componente) AS componente, estado FROM lista_componentes WHERE estado = 1',
        5: 'SELECT id, TRIM(frecuencia) AS frecuencia, dias, estado FROM frecuencia_Mtto WHERE estado = 1',
        6: 'SELECT id, TRIM(proceso) AS procesos, TRIM(sigla) AS sigla, estado FROM procesos WHERE estado = 1',
        7: 'SELECT id, TRIM(nombre) AS nombre, TRIM(siglas) AS siglas, estado FROM clasificacion_activos WHERE estado = 1',
        8: 'SELECT id, TRIM(nombre_comercial) AS nombre_comercial, TRIM(nit) AS nit, dv,TRIM(razon_social) AS razon_social, TRIM(telefonos) AS telefonos, TRIM(contacto) AS contacto, TRIM(direccion) AS direccion, TRIM(descripcion) AS descripcion, estado FROM proveedores  WHERE estado = 1',
        9: 'SELECT id, TRIM(insumo) AS insumo, estado FROM insumos WHERE estado <> 3'
    }
    const { config } = req.body

    if (!query[config]) {
        return res.json({ msg: 'solicitud ivalida' })
    }
    const tabla = await consultaconfi(query[config])
    res.json(tabla)
}

const crearConfig = async (req, res) => {
    const { permisos } = req

    if (permisos.indexOf(8) == -1) return res.json({ msg: 'Usted no tiene permisos para crear configuraciones' })

    const { data } = req.body
    let query

    switch (data.id) {
        case 1:
            if (!data.area) return { msg: ' el campo Nombre del Area es obligatorio' }
            if (validarVacios(data.area)) return { msg: ' el campo Nombre del area es obligatorio' }
            if (validarPalabras(data.area)) return { msg: ' el campo Nombre del area no debe llevar palabras reservadas como SELECT, FROM WHERE' }
            if (validarCaracteres(data.area)) return { msg: ' el campo Nombre del area no debe llevar palabras reservadas como [], {},()' }
            query = `INSERT INTO areas (area, estado) VALUES('${data.area}', '1') 
                    SELECT IDENT_CURRENT('areas') AS id`
            break
        case 2:
            if (!data.marca) return { msg: ' el campo Nombre del Marca es obligatorio' }
            if (validarVacios(data.marca)) return { msg: ' el campo Nombre del Marca es obligatorio' }
            if (validarPalabras(data.marca)) return { msg: ' el campo Nombre del Marca no debe llevar palabras reservadas como SELECT, FROM WHERE' }
            if (validarCaracteres(data.marca)) return { msg: ' el campo Nombre del Marca no debe llevar palabras reservadas como [], {},()' }

            query = `INSERT INTO marca_activos (marca, estado) VALUES('${data.marca}', '1') 
                    SELECT IDENT_CURRENT('marca_activos') AS id`
            break
        case 3:
            if (!data.tipoActivo) return { msg: ' el campo Nombre del Tipo Activo es obligatorio' }
            if (validarVacios(data.tipoActivo)) return { msg: ' el campo Nombre del Tipo Activo es obligatorio' }
            if (validarPalabras(data.tipoActivo)) return { msg: ' el campo Nombre del Tipo Activo no debe llevar palabras reservadas como SELECT, FROM WHERE' }
            if (validarCaracteres(data.tipoActivo)) return { msg: ' el campo Nombre del Tipo Activo no debe llevar palabras reservadas como [], {},()' }

            query = `INSERT INTO tipo_activo (tipo_activo, estado) VALUES('${data.tipoActivo}', '1') 
                    SELECT IDENT_CURRENT('tipo_activo') AS id`
            break
        case 4:
            if (!data.componente) return { msg: ' el campo Nombre del componente es obligatorio' }
            if (validarVacios(data.componente)) return { msg: ' el campo Nombre del Componente es obligatorio' }
            if (validarPalabras(data.componente)) return { msg: ' el campo Nombre del Componente no debe llevar palabras reservadas como SELECT, FROM WHERE' }
            if (validarCaracteres(data.componente)) return { msg: ' el campo Nombre del Componente no debe llevar palabras reservadas como [], {},()' }

            query = `INSERT INTO lista_componentes (componente, estado) VALUES('${data.componente}', '1') 
                        SELECT IDENT_CURRENT('lista_componentes') AS id`
            break
        case 5:

            if (!data.frecuencia) return { msg: ' el campo Nombre de la frecuencia es obligatorio' }
            if (validarVacios(data.frecuencia)) return { msg: ' el campo Nombre de la Frecuencia es obligatorio' }
            if (validarPalabras(data.frecuencia)) return { msg: ' el campo Nombre de la Frecuencia no debe llevar palabras reservadas como SELECT, FROM WHERE' }
            if (validarCaracteres(data.frecuencia)) return { msg: ' el campo Nombre de la Frecuencia no debe llevar palabras reservadas como [], {},()' }
            if (!data.dias) return { msg: ' el campo dias de la Frecuencia es obligatorio' }
            if (validarVacios(data.dias)) return { msg: ' el campo dias de la Frecuencia es obligatorio' }
            if (parseInt(data.dias) == NaN) return { msg: ' el campo dias de la Frecuencia debe ser numerico' }

            query = `INSERT INTO frecuencia_Mtto (frecuencia, dias, estado) VALUES('${data.frecuencia}', '${data.dias}', '1') 
                    SELECT IDENT_CURRENT('frecuencia_Mtto') AS id`
            break
        case 6:

            if (!data.proceso) return { msg: ' el campo Nombre del Proceso es obligatorio' }
            if (validarVacios(data.proceso)) return { msg: ' el campo Nombre del Proceso es obligatorio' }
            if (validarPalabras(data.proceso)) return { msg: ' el campo Nombre del Proceso no debe llevar palabras reservadas como SELECT, FROM WHERE' }
            if (validarCaracteres(data.proceso)) return { msg: ' el campo Nombre del Proceso no debe llevar palabras reservadas como [], {},()' }
            if (!data.sigla) return { msg: ' el campo Siglas del Proceso es obligatorio' }
            if (validarVacios(data.sigla)) return { msg: ' el campo Siglas del Proceso es obligatorio' }
            if (validarPalabras(data.sigla)) return { msg: ' el campo Siglas del Proceso no debe llevar palabras reservadas como SELECT, FROM WHERE' }
            if (validarCaracteres(data.sigla)) return { msg: ' el campo Siglas del Proceso no debe llevar palabras reservadas como [], {},()' }

            data.sigla = data.sigla.toUpperCase()

            query = `INSERT INTO procesos (proceso, sigla, estado) VALUES('${data.proceso}', '${data.sigla}', '1') 
                    SELECT IDENT_CURRENT('procesos') AS id`
            break
        case 7:

            if (!data.clasificacion) return { msg: ' el campo Nombre del Clasificacion Activo es obligatorio' }
            if (validarVacios(data.clasificacion)) return { msg: ' el campo Nombre del Clasificacion Activo es obligatorio' }
            if (validarPalabras(data.clasificacion)) return { msg: ' el campo Nombre del Clasificacion Activo no debe llevar palabras reservadas como SELECT, FROM WHERE' }
            if (validarCaracteres(data.clasificacion)) return { msg: ' el campo Nombre del Clasificacion Activo no debe llevar palabras reservadas como [], {},()' }
            if (!data.sigla) return { msg: ' el campo Siglas de la Clasificacion Activo es obligatorio' }
            if (validarVacios(data.sigla)) return { msg: ' el campo Siglas de la Clasificacion Activo es obligatorio' }
            if (validarPalabras(data.sigla)) return { msg: ' el campo Siglas de la Clasificacion Activo no debe llevar palabras reservadas como SELECT, FROM WHERE' }
            if (validarCaracteres(data.sigla)) return { msg: ' el campo Siglas de la Clasificacion Activo no debe llevar palabras reservadas como [], {},()' }

            data.sigla = data.sigla.toUpperCase()

            query = `INSERT INTO clasificacion_activos (nombre, siglas, estado) VALUES('${data.clasificacion}', '${data.sigla}', '1') 
                    SELECT IDENT_CURRENT('clasificacion_activos') AS id`
            break
        case 8:
            if (!data.proveedor) return { msg: ' el campo Nombre del Proveedor es obligatorio' }
            if (validarVacios(data.proveedor)) return { msg: ' el campo Nombre del Proveedor es obligatorio' }
            if (validarPalabras(data.proveedor)) return { msg: ' el campo Nombre del Proveedor no debe llevar palabras reservadas como SELECT, FROM WHERE' }
            if (validarCaracteres(data.proveedor)) return { msg: ' el campo Nombre del Proveedor no debe llevar palabras reservadas como [], {},()' }
            if (!data.razonProveedor) return { msg: ' el campo Razon Social del Proveedor es obligatorio' }
            if (validarVacios(data.razonProveedor)) return { msg: ' el campo Razon Social del Proveedor es obligatorio' }
            if (validarPalabras(data.razonProveedor)) return { msg: ' el campo Razon Social del Proveedor no debe llevar palabras reservadas como SELECT, FROM WHERE' }
            if (validarCaracteres(data.razonProveedor)) return { msg: ' el campo Razon Social del Proveedor no debe llevar palabras reservadas como [], {},()' }
            if (!data.nitProveedor) return { msg: ' el campo Nit O CC del Proveedor es obligatorio' }
            if (validarVacios(data.nitProveedor)) return { msg: ' el campo Nit O CC del Proveedor es obligatorio' }
            if (validarPalabras(data.nitProveedor)) return { msg: ' el campo Nit O CC del Proveedor no debe llevar palabras reservadas como SELECT, FROM WHERE' }
            if (validarCaracteres(data.nitProveedor)) return { msg: ' el campo Nit O CC del Proveedor no debe llevar palabras reservadas como [], {},()' }
            if (!data.dvProveedor) return { msg: ' el campo Digito de verificacion del Proveedor es obligatorio' }
            if (validarVacios(data.dvProveedor)) return { msg: ' el campo Digito de verificacion del Proveedor es obligatorio' }
            if (parseInt(data.dvProveedor) == NaN) return { msg: ' el campo Digito de verificacion del Proveedor debe ser un numero' }
            if (!data.contactoProveedor) return { msg: ' el campo Contacto del Proveedor es obligatorio' }
            if (validarVacios(data.contactoProveedor)) return { msg: ' el campo Contacto del Proveedor es obligatorio' }
            if (validarPalabras(data.contactoProveedor)) return { msg: ' el campo Contacto del Proveedor no debe llevar palabras reservadas como SELECT, FROM WHERE' }
            if (validarCaracteres(data.contactoProveedor)) return { msg: ' el campo Contacto del Proveedor no debe llevar palabras reservadas como [], {},()' }
            if (!data.telefonosProveedor) return { msg: ' el campo telefono del Proveedor es obligatorio' }
            if (validarVacios(data.telefonosProveedor)) return { msg: ' el campo telefono del Proveedor es obligatorio' }
            if (validarPalabras(data.telefonosProveedor)) return { msg: ' el campo telefono del Proveedor no debe llevar palabras reservadas como SELECT, FROM WHERE' }
            if (validarCaracteres(data.telefonosProveedor)) return { msg: ' el campo telefono del Proveedor no debe llevar palabras reservadas como [], {},()' }
            if (!data.direccionProveedor) return { msg: ' el campo Dirrecion del Proveedor es obligatorio' }
            if (validarVacios(data.direccionProveedor)) return { msg: ' el campo Dirrecion del Proveedor es obligatorio' }
            if (validarPalabras(data.direccionProveedor)) return { msg: ' el campo Dirrecion del Proveedor no debe llevar palabras reservadas como SELECT, FROM WHERE' }
            if (validarCaracteres(data.direccionProveedor)) return { msg: ' el campo Dirrecion del Proveedor no debe llevar palabras reservadas como [], {},()' }
            if (!data.descripcionProveedor) return { msg: ' el campo Descripcion del Proveedor es obligatorio' }
            if (validarVacios(data.descripcionProveedor)) return { msg: ' el campo Descripcion del Proveedor es obligatorio' }
            if (validarPalabras(data.descripcionProveedor)) return { msg: ' el campo Descripcion del Proveedor no debe llevar palabras reservadas como SELECT, FROM WHERE' }
            if (validarCaracteres(data.descripcionProveedor)) return { msg: ' el campo Descripcion del Proveedor no debe llevar palabras reservadas como [], {},()' }

            query = `INSERT INTO proveedores (nombre_comercial, razon_social, nit, dv, telefonos, contacto, direccion, descripcion ,estado) VALUES('${data.proveedor}', '${data.razonProveedor}', '${data.nitProveedor}', '${data.dvProveedor}', '${data.telefonosProveedor}', '${data.contactoProveedor}', '${data.direccionProveedor}', '${data.descripcionProveedor}', '1') 
                    SELECT IDENT_CURRENT('proveedores') AS id`
            break
        case 9:
            if (!data.insumo) return { msg: ' el campo Nombre del insumo es obligatorio' }
            if (validarVacios(data.insumo)) return { msg: ' el campo Nombre del insumo es obligatorio' }
            if (validarPalabras(data.insumo)) return { msg: ' el campo Nombre del insumo no debe llevar palabras reservadas como SELECT, FROM WHERE' }
            if (validarCaracteres(data.insumo)) return { msg: ' el campo Nombre del insumo no debe llevar palabras reservadas como [], {},()' }
            query = `INSERT INTO insumos (insumo, estado) VALUES('${data.insumo}', '1') 
                    SELECT IDENT_CURRENT('insumos') AS id`
            break
        default:
            return res.json({ msg: 'Solicitud invalida' })
    }

    const actualizar = await guardarConfig(query)

    if (actualizar.msg) {
        return res.json(actualizar)
    }

    return res.json({
        exito: 'creado exitosamente',
        id: actualizar,
    })
}

const actualizarConfig = async (req, res) => {
    const { permisos } = req

    if (permisos.indexOf(8) === -1) return res.json({ msg: 'Usted no tiene permisos para consultar esta información' })

    const { data } = req.body
    // validar datos.
    let query

    switch (data.id) {
        case 1:

            if (!data.idArea) return { msg: 'Solicitud no valida, actualice la pagina e intente de nuevo' }
            if (validarId(data.idArea)) return { msg: 'Solicitud no valida, actualice la pagina e intente de nuevo' }
            if (!data.area) return { msg: ' El campo Nombre del Area es obligatorio' }
            if (validarVacios(data.area)) return { msg: ' El campo Nombre del area es obligatorio' }
            if (validarPalabras(data.area)) return { msg: ' El campo Nombre del area no debe llevar palabras reservadas como SELECT, FROM WHERE' }
            if (validarCaracteres(data.area)) return { msg: ' El campo Nombre del area no debe llevar palabras reservadas como [], {},()' }
            if (!data.estado) return { msg: 'El Campo estado del Area no es valido, Escoja un estado de la lista' }
            if (validarId(data.estado)) return { msg: 'El Campo estado del Area no es valido, Escoja un estado de la lista' }
            const estadoArea = parseInt(data.estado.split('-')[1])
            if (estadoArea !== 1 && estadoArea !== 2) return { msg: 'El Campo estado del Area no es valido, Escoja un estado de la lista' }
            const dataIdArea = parseInt(data.idArea.split('-')[1])
            const idArea = await consultarConfuno('SELECT id FROM areas WHERE id =' + dataIdArea)
            if (idArea === undefined) return res.json({ msg: 'El Area que intenta modificar no existe' })
            if (idArea.msg) return res.json({ msg: 'No fue Posible validar la existencia del Area revise los datos e intente de nuevo' })
            if (idArea.id !== dataIdArea) return res.json({ msg: 'El Area que intenta modificar no existe' })
            query = `UPDATE areas SET area = '${data.area}', estado = '${estadoArea}' WHERE id = '${dataIdArea}'`

            break
        case 2:
            if (!data.idMarca) return { msg: 'Solicitud no valida, actualice la pagina e intente de nuevo' }
            if (validarId(data.idMarca)) return { msg: 'Solicitud no valida, actualice la pagina e intente de nuevo' }
            if (!data.marca) return { msg: ' el campo Nombre del Marca es obligatorio' }
            if (validarVacios(data.marca)) return { msg: ' el campo Nombre del Marca es obligatorio' }
            if (validarPalabras(data.marca)) return { msg: ' el campo Nombre del Marca no debe llevar palabras reservadas como SELECT, FROM WHERE' }
            if (validarCaracteres(data.marca)) return { msg: ' el campo Nombre del Marca no debe llevar palabras reservadas como [], {},()' }
            if (!data.estado) return { msg: 'El Campo estado de la Marca no es valido, Escoja un estado de la lista' }
            if (validarId(data.estado)) return { msg: 'El Campo estado de la Marca no es valido, Escoja un estado de la lista' }
            const estadoMarca = parseInt(data.estado.split('-')[1])
            if (estadoMarca !== 1 && estadoMarca !== 2) return { msg: 'El Campo estado del Marca no es valido, Escoja un estado de la lista' }
            const dataIdMarca = parseInt(data.idMarca.split('-')[1])
            const idMarca = await consultarConfuno('SELECT id FROM marca_activos WHERE id =' + dataIdMarca)
            if (idMarca === undefined) return res.json({ msg: 'La Marca que intenta modificar no existe' })
            if (idMarca.msg) return res.json({ msg: 'No fue Posible validar la existencia de la Marca revise los datos e intente de nuevo' })
            if (idMarca.id !== dataIdMarca) return res.json({ msg: 'La Marca que intenta modificar no existe' })

            query = `UPDATE marca_activos SET marca = '${data.marca}', estado = '${estadoMarca}' WHERE id = '${dataIdMarca}'`

            break
        case 3:
            if (!data.idTipoActivo) return { msg: 'Solicitud no valida, actualice la pagina e intente de nuevo' }
            if (validarId(data.idTipoActivo)) return { msg: 'Solicitud no valida, actualice la pagina e intente de nuevo' }
            if (!data.tipoActivo) return { msg: ' el campo Nombre del Tipo Activo es obligatorio' }
            if (validarVacios(data.tipoActivo)) return { msg: ' el campo Nombre del Tipo Activo es obligatorio' }
            if (validarPalabras(data.tipoActivo)) return { msg: ' el campo Nombre del Tipo Activo no debe llevar palabras reservadas como SELECT, FROM WHERE' }
            if (validarCaracteres(data.tipoActivo)) return { msg: ' el campo Nombre del Tipo Activo no debe llevar palabras reservadas como [], {},()' }
            if (!data.estado) return { msg: 'El Campo estado del Tipo de Activo no es valido, Escoja un estado de la lista' }
            if (validarId(data.estado)) return { msg: 'El Campo estado del Tipo de Activo no es valido, Escoja un estado de la lista' }

            const estadoTipoActivo = parseInt(data.estado.split('-')[1])
            if (estadoTipoActivo !== 1 && estadoTipoActivo !== 2) return { msg: 'El Campo estado del Tipo Activo no es valido, Escoja un estado de la lista' }
            const dataIdTipoActivo = parseInt(data.idTipoActivo.split('-')[1])
            const idTipoActivo = await consultarConfuno('SELECT id FROM tipo_activo WHERE id =' + dataIdTipoActivo)
            if (idTipoActivo === undefined) return res.json({ msg: 'El Tipo Activo que intenta modificar no existe' })
            if (idTipoActivo.msg) return res.json({ msg: 'No fue Posible validar la existencia del  Tipo Activo revise los datos e intente de nuevo' })
            if (idTipoActivo.id !== dataIdTipoActivo) return res.json({ msg: 'El  Tipo Activo que intenta modificar no existe' })

            query = `UPDATE tipo_activo SET tipo_activo = '${data.tipoActivo}', estado = '${estadoTipoActivo}' WHERE id = '${dataIdTipoActivo}'`

            break
        case 4:
            if (!data.idComponente) return { msg: 'Solicitud no valida, actualice la pagina e intente de nuevo' }
            if (validarId(data.idComponente)) return { msg: 'Solicitud no valida, actualice la pagina e intente de nuevo' }
            if (!data.componente) return { msg: ' el campo Nombre del componente es obligatorio' }
            if (validarVacios(data.componente)) return { msg: ' el campo Nombre del Componente es obligatorio' }
            if (validarPalabras(data.componente)) return { msg: ' el campo Nombre del Componente no debe llevar palabras reservadas como SELECT, FROM WHERE' }
            if (validarCaracteres(data.componente)) return { msg: ' el campo Nombre del Componente no debe llevar palabras reservadas como [], {},()' }
            if (!data.estado) return { msg: 'El Campo estado del Componente no es valido, Escoja un estado de la lista' }
            if (validarId(data.estado)) return { msg: 'El Campo estado del Componente no es valido, Escoja un estado de la lista' }

            const estadoComponente = parseInt(data.estado.split('-')[1])
            if (estadoComponente !== 1 && estadoComponente !== 2) return { msg: 'El Campo estado del Componente no es valido, Escoja un estado de la lista' }
            const dataIdComponente = parseInt(data.idComponente.split('-')[1])
            const idComponente = await consultarConfuno('SELECT id FROM lista_componentes WHERE id =' + dataIdComponente)
            if (idComponente === undefined) return res.json({ msg: 'EL Componente que intenta modificar no existe' })
            if (idComponente.msg) return res.json({ msg: 'No fue Posible validar la existencia del Componente revise los datos e intente de nuevo' })
            if (idComponente.id !== dataIdComponente) return res.json({ msg: 'El componente que intenta modificar no existe' })

            query = `UPDATE lista_componentes SET componente = '${data.componente}', estado = '${estadoComponente}' WHERE id = '${dataIdComponente}'`

            break
        case 5:
            if (!data.idFrecuencia) return { msg: 'Solicitud no valida, actualice la pagina e intente de nuevo' }
            if (validarId(data.idFrecuencia)) return { msg: 'Solicitud no valida, actualice la pagina e intente de nuevo' }
            if (!data.frecuencia) return { msg: ' el campo Nombre de la frecuencia es obligatorio' }
            if (validarVacios(data.frecuencia)) return { msg: ' el campo Nombre de la Frecuencia es obligatorio' }
            if (validarPalabras(data.frecuencia)) return { msg: ' el campo Nombre de la Frecuencia no debe llevar palabras reservadas como SELECT, FROM WHERE' }
            if (validarCaracteres(data.frecuencia)) return { msg: ' el campo Nombre de la Frecuencia no debe llevar palabras reservadas como [], {},()' }
            if (!data.dias) return { msg: ' el campo dias de la Frecuencia es obligatorio' }
            if (validarVacios(data.dias)) return { msg: ' el campo dias de la Frecuencia es obligatorio' }
            if (parseInt(data.dias) == NaN) return { msg: ' el campo dias de la Frecuencia debe ser numerico' }
            if (!data.estado) return { msg: 'El Campo estado de la Frecuencia no es valido, Escoja un estado de la lista' }
            if (validarId(data.estado)) return { msg: 'El Campo estado de la Frecuencia no es valido, Escoja un estado de la lista' }

            const estadoFrecuencia = parseInt(data.estado.split('-')[1])
            if (estadoFrecuencia !== 1 && estadoFrecuencia !== 2) return { msg: 'El Campo estado de la Frecuencia no es valido, Escoja un estado de la lista' }
            const dataIdFrecuencia = parseInt(data.idFrecuencia.split('-')[1])
            const idFrecuencia = await consultarConfuno('SELECT id FROM frecuencia_Mtto WHERE id =' + dataIdFrecuencia)
            if (idFrecuencia === undefined) return res.json({ msg: 'La Frecuencia que intenta modificar no existe' })
            if (idFrecuencia.msg) return res.json({ msg: 'No fue Posible validar la existencia de la Frecuencia revise los datos e intente de nuevo' })
            if (idFrecuencia.id !== dataIdFrecuencia) return res.json({ msg: 'La Frecuencia que intenta modificar no existe' })


            query = `UPDATE frecuencia_Mtto SET frecuencia = '${data.frecuencia}', dias = '${data.dias}',  estado = '${estadoFrecuencia}' WHERE id = '${dataIdFrecuencia}'`

            break
        case 6:


            if (!data.idProceso) return { msg: 'Solicitud no valida, actualice la pagina e intente de nuevo' }
            if (validarId(data.idProceso)) return { msg: 'Solicitud no valida, actualice la pagina e intente de nuevo' }
            if (!data.proceso) return { msg: ' el campo Nombre del Proceso es obligatorio' }
            if (validarVacios(data.proceso)) return { msg: ' el campo Nombre del Proceso es obligatorio' }
            if (validarPalabras(data.proceso)) return { msg: ' el campo Nombre del Proceso no debe llevar palabras reservadas como SELECT, FROM WHERE' }
            if (validarCaracteres(data.proceso)) return { msg: ' el campo Nombre del Proceso no debe llevar palabras reservadas como [], {},()' }
            if (!data.sigla) return { msg: ' el campo Siglas del Proceso es obligatorio' }
            if (validarVacios(data.sigla)) return { msg: ' el campo Siglas del Proceso es obligatorio' }
            if (validarPalabras(data.sigla)) return { msg: ' el campo Siglas del Proceso no debe llevar palabras reservadas como SELECT, FROM WHERE' }
            if (validarCaracteres(data.sigla)) return { msg: ' el campo Siglas del Proceso no debe llevar palabras reservadas como [], {},()' }
            if (!data.estado) return { msg: 'El Campo estado del Proceso no es valido, Escoja un estado de la lista' }
            if (validarId(data.estado)) return { msg: 'El Campo estado del Proceso no es valido, Escoja un estado de la lista' }
            data.sigla = data.sigla.toUpperCase()

            const estadoProceso = parseInt(data.estado.split('-')[1])
            if (estadoProceso !== 1 && estadoProceso !== 2) return { msg: 'El Campo estado del Proceso no es valido, Escoja un estado de la lista' }
            const dataIdProceso = parseInt(data.idProceso.split('-')[1])
            const idProceso = await consultarConfuno('SELECT id FROM procesos WHERE id =' + dataIdProceso)
            if (idProceso === undefined) return res.json({ msg: 'EL Proceso que intenta modificar no existe' })
            if (idProceso.msg) return res.json({ msg: 'No fue Posible validar la existencia del Proceso revise los datos e intente de nuevo' })
            if (idProceso.id !== dataIdProceso) return res.json({ msg: 'El Proceso que intenta modificar no existe' })


            query = `UPDATE procesos SET proceso = '${data.proceso}', sigla = '${data.sigla}',  estado = '${estadoProceso}' WHERE id = '${dataIdProceso}'`

            break
        case 7:
            if (!data.idClasificacionActivo) return { msg: 'Solicitud no valida, actualice la pagina e intente de nuevo' }
            if (validarId(data.idClasificacionActivo)) return { msg: 'Solicitud no valida, actualice la pagina e intente de nuevo' }
            if (!data.clasificacion) return { msg: ' el campo Nombre del Clasificacion Activo es obligatorio' }
            if (validarVacios(data.clasificacion)) return { msg: ' el campo Nombre del Clasificacion Activo es obligatorio' }
            if (validarPalabras(data.clasificacion)) return { msg: ' el campo Nombre del Clasificacion Activo no debe llevar palabras reservadas como SELECT, FROM WHERE' }
            if (validarCaracteres(data.clasificacion)) return { msg: ' el campo Nombre del Clasificacion Activo no debe llevar palabras reservadas como [], {},()' }
            if (!data.sigla) return { msg: ' el campo Siglas de la Clasificacion Activo es obligatorio' }
            if (validarVacios(data.sigla)) return { msg: ' el campo Siglas de la Clasificacion Activo es obligatorio' }
            if (validarPalabras(data.sigla)) return { msg: ' el campo Siglas de la Clasificacion Activo no debe llevar palabras reservadas como SELECT, FROM WHERE' }
            if (validarCaracteres(data.sigla)) return { msg: ' el campo Siglas de la Clasificacion Activo no debe llevar palabras reservadas como [], {},()' }
            if (!data.estado) return { msg: 'El Campo estado del Clasificacion Activo no es valido, Escoja un estado de la lista' }
            if (validarId(data.estado)) return { msg: 'El Campo estado del Clasificacion Activo no es valido, Escoja un estado de la lista' }
            data.sigla = data.sigla.toUpperCase()

            const estadoClasificacionActivo = parseInt(data.estado.split('-')[1])
            if (estadoClasificacionActivo !== 1 && estadoClasificacionActivo !== 2) return { msg: 'El Campo estado de la Clasificacion Activo no es valido, Escoja un estado de la lista' }
            const dataIdClasificacionActivo = parseInt(data.idClasificacionActivo.split('-')[1])
            const idClasificacionActivo = await consultarConfuno('SELECT id FROM clasificacion_activos WHERE id =' + dataIdClasificacionActivo)
            if (idClasificacionActivo === undefined) return res.json({ msg: 'La Clasificacion Activo que intenta modificar no existe' })
            if (idClasificacionActivo.msg) return res.json({ msg: 'No fue Posible validar la existencia de la ClasificacionA ctivo revise los datos e intente de nuevo' })
            if (idClasificacionActivo.id !== dataIdClasificacionActivo) return res.json({ msg: 'La Clasificacion Activo que intenta modificar no existe' })

            query = `UPDATE clasificacion_activos SET nombre = '${data.clasificacion}', siglas = '${data.sigla}',  estado = '${estadoClasificacionActivo}' WHERE id = '${dataIdClasificacionActivo}'`
            break
        case 8:

            if (!data.idProveedor) return { msg: 'Solicitud no valida, actualice la pagina e intente de nuevo' }
            if (validarId(data.idProveedor)) return { msg: 'Solicitud no valida, actualice la pagina e intente de nuevo' }
            if (!data.proveedor) return { msg: ' el campo Nombre del Proveedor es obligatorio' }
            if (validarVacios(data.proveedor)) return { msg: ' el campo Nombre del Proveedor es obligatorio' }
            if (validarPalabras(data.proveedor)) return { msg: ' el campo Nombre del Proveedor no debe llevar palabras reservadas como SELECT, FROM WHERE' }
            if (validarCaracteres(data.proveedor)) return { msg: ' el campo Nombre del Proveedor no debe llevar palabras reservadas como [], {},()' }
            if (!data.razonProveedor) return { msg: ' el campo Razon Social del Proveedor es obligatorio' }
            if (validarVacios(data.razonProveedor)) return { msg: ' el campo Razon Social del Proveedor es obligatorio' }
            if (validarPalabras(data.razonProveedor)) return { msg: ' el campo Razon Social del Proveedor no debe llevar palabras reservadas como SELECT, FROM WHERE' }
            if (validarCaracteres(data.razonProveedor)) return { msg: ' el campo Razon Social del Proveedor no debe llevar palabras reservadas como [], {},()' }
            if (!data.nitProveedor) return { msg: ' el campo Nit O CC del Proveedor es obligatorio' }
            if (validarVacios(data.nitProveedor)) return { msg: ' el campo Nit O CC del Proveedor es obligatorio' }
            if (validarPalabras(data.nitProveedor)) return { msg: ' el campo Nit O CC del Proveedor no debe llevar palabras reservadas como SELECT, FROM WHERE' }
            if (validarCaracteres(data.nitProveedor)) return { msg: ' el campo Nit O CC del Proveedor no debe llevar palabras reservadas como [], {},()' }
            if (!data.dvProveedor) return { msg: ' el campo Digito de verificacion del Proveedor es obligatorio' }
            if (validarVacios(data.dvProveedor)) return { msg: ' el campo Digito de verificacion del Proveedor es obligatorio' }
            if (parseInt(data.dvProveedor) == NaN) return { msg: ' el campo Digito de verificacion del Proveedor debe ser un numero' }
            if (!data.contactoProveedor) return { msg: ' el campo Contacto del Proveedor es obligatorio' }
            if (validarVacios(data.contactoProveedor)) return { msg: ' el campo Contacto del Proveedor es obligatorio' }
            if (validarPalabras(data.contactoProveedor)) return { msg: ' el campo Contacto del Proveedor no debe llevar palabras reservadas como SELECT, FROM WHERE' }
            if (validarCaracteres(data.contactoProveedor)) return { msg: ' el campo Contacto del Proveedor no debe llevar palabras reservadas como [], {},()' }
            if (!data.telefonosProveedor) return { msg: ' el campo telefono del Proveedor es obligatorio' }
            if (validarVacios(data.telefonosProveedor)) return { msg: ' el campo telefono del Proveedor es obligatorio' }
            if (validarPalabras(data.telefonosProveedor)) return { msg: ' el campo telefono del Proveedor no debe llevar palabras reservadas como SELECT, FROM WHERE' }
            if (validarCaracteres(data.telefonosProveedor)) return { msg: ' el campo telefono del Proveedor no debe llevar palabras reservadas como [], {},()' }
            if (!data.direccionProveedor) return { msg: ' el campo Dirrecion del Proveedor es obligatorio' }
            if (validarVacios(data.direccionProveedor)) return { msg: ' el campo Dirrecion del Proveedor es obligatorio' }
            if (validarPalabras(data.direccionProveedor)) return { msg: ' el campo Dirrecion del Proveedor no debe llevar palabras reservadas como SELECT, FROM WHERE' }
            if (validarCaracteres(data.direccionProveedor)) return { msg: ' el campo Dirrecion del Proveedor no debe llevar palabras reservadas como [], {},()' }
            if (!data.descripcionProveedor) return { msg: ' el campo Descripcion del Proveedor es obligatorio' }
            if (validarVacios(data.descripcionProveedor)) return { msg: ' el campo Descripcion del Proveedor es obligatorio' }
            if (validarPalabras(data.descripcionProveedor)) return { msg: ' el campo Descripcion del Proveedor no debe llevar palabras reservadas como SELECT, FROM WHERE' }
            if (validarCaracteres(data.descripcionProveedor)) return { msg: ' el campo Descripcion del Proveedor no debe llevar palabras reservadas como [], {},()' }
            if (!data.estado) return { msg: 'El Campo estado del Proveedor no es valido, Escoja un estado de la lista' }
            if (validarId(data.estado)) return { msg: 'El Campo estado del Proveedor no es valido, Escoja un estado de la lista' }

            const estadoProveedor = parseInt(data.estado.split('-')[1])
            if (estadoProveedor !== 1 && estadoProveedor !== 2) return { msg: 'El Campo estado del Proveedor no es valido, Escoja un estado de la lista' }
            const dataIdProveedor = parseInt(data.idProveedor.split('-')[1])
            const idProveedor = await consultarConfuno('SELECT id FROM proveedores WHERE id =' + dataIdProveedor)
            if (idProveedor === undefined) return res.json({ msg: 'EL Proveedor que intenta modificar no existe' })
            if (idProveedor.msg) return res.json({ msg: 'No fue Posible validar la existencia del Proveedor revise los datos e intente de nuevo' })
            if (idProveedor.id !== dataIdProveedor) return res.json({ msg: 'El Proveedor que intenta modificar no existe' })

            query = `UPDATE proveedores SET nombre_comercial = '${data.proveedor}', razon_social = '${data.razonProveedor}', nit = '${data.nitProveedor}', dv = '${data.dvProveedor}', telefonos = '${data.telefonosProveedor}', contacto = '${data.contactoProveedor}', direccion = '${data.direccionProveedor}', estado = '${estadoProveedor}', descripcion = '${data.descripcionProveedor}'  WHERE id = '${dataIdProveedor}'`
        case 9:

            if (!data.idInsumo) return { msg: 'Solicitud no valida, actualice la pagina e intente de nuevo' }
            if (validarId(data.idInsumo)) return { msg: 'Solicitud no valida, actualice la pagina e intente de nuevo' }
            if (!data.insumo) return { msg: ' El campo Nombre del insumo es obligatorio' }
            if (validarVacios(data.insumo)) return { msg: ' El campo Nombre del insumo es obligatorio' }
            if (validarPalabras(data.insumo)) return { msg: ' El campo Nombre del insumo no debe llevar palabras reservadas como SELECT, FROM WHERE' }
            if (validarCaracteres(data.insumo)) return { msg: ' El campo Nombre del insumo no debe llevar palabras reservadas como [], {},()' }
            if (!data.estado) return { msg: 'El Campo estado del insumo no es valido, Escoja un estado de la lista' }
            if (validarId(data.estado)) return { msg: 'El Campo estado del insumo no es valido, Escoja un estado de la lista' }
            const estadoInsumo = parseInt(data.estado.split('-')[1])
            if (estadoInsumo !== 1 && estadoInsumo !== 2) return { msg: 'El Campo estado del insumo no es valido, Escoja un estado de la lista' }
            const dataIdInsumo = parseInt(data.idInsumo.split('-')[1])
            const idInsumo = await consultarConfuno('SELECT id FROM insumos WHERE id =' + dataIdInsumo)
            if (idInsumo === undefined) return res.json({ msg: 'El insumo que intenta modificar no existe' })
            if (idInsumo.msg) return res.json({ msg: 'No fue Posible validar la existencia del insumo revise los datos e intente de nuevo' })
            if (idInsumo.id !== dataIdInsumo) return res.json({ msg: 'El insumo que intenta modificar no existe' })
            query = `UPDATE insumos SET insumo = '${data.insumo}', estado = '${estadoInsumo}' WHERE id = '${dataIdInsumo}'`

            break
        default:
            return res.json({ msg: 'Solicitud invalida' })
    }

    const actualizar = await actualizarConfigDb(query)

    if (actualizar.msg) {
        return res.json(actualizar)
    }

    return res.json({
        exito: 'La actualizacion ha sido exitosa',
    })

}

const consultarTodasTablasConfig = async (req, res) => {
    const { permisos } = req
    if (permisos.indexOf(8) === -1) { }

    const listado = await consultarTodasTablas()
    if (listado.length === 0) return res.json({ msg: 'No fue posible consultar las tablas de configuracion' })
    if (listado.msg) return res.json(listado)
    const configuraciones = {
        areas: listado[0],
        marcas: listado[1],
        tipoActivos: listado[2],
        componentes: listado[3],
        frecuencia: listado[4],
        procesos: listado[5],
        clasificacionActivos: listado[6],
        proveedores: listado[7],
        estado: listado[8],
        insumos: listado[9]
    }

    if (permisos.indexOf(8) !== -1) {
        configuraciones.editar = true
        configuraciones.proveedores = configuraciones.proveedores.map(elemet => {
            return {
                id: elemet.id,
                nombre: elemet.nombre + '--' + elemet.estadoId
            }
        })
    }

    res.json(configuraciones)
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
    consultarconfig,
    actualizarConfig,
    crearConfig,
    consultarTodasTablasConfig
}