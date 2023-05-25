import mime from 'mime-types'
    const validarFiles =  (files) => {
 
    if (files.Image) {
        const dimension = files.Image.length
        const tipo = typeof dimension === 'undefined'
        const extenciones = ['jpg', 'png', 'jpeg', 'JPG', 'PNG', 'JEPG']
        if (!tipo) {
            if (dimension > 6) {
                return ({ msg: 'solo se admite un maximo de 6 Imagenes' })
            }
            const validarExtencion = files.Image.map(imagen => {               
                    if(!extenciones.includes(mime.extension(imagen.mimetype))){
                        return 'si'
                    }
            });

            if(validarExtencion.some(element => element ==='si')){
                return({ msg: 'solo se admite extenciones jpg, jpeg, png para las imagenes' })
            }

        } else {
            const extencion = mime.extension(files.Image.mimetype)
            if (!extenciones.includes(extencion)) {
                return ({ msg: 'solo se admite extenciones jpg, jpeg, png para las imagenes' })
            }
        }

    }

    function validarpdfile(file, archivo) {
        
        const dimension = file.length
        const tipo = typeof dimension === 'undefined'
        if (!tipo) {
            return ({ msg: `solo se admite un maximo de 1 archivo pdf en el campo ${archivo}`})
        }
        const extenciones = ['PDF', 'pdf']
        const extencion = mime.extension(file.mimetype)
        if (!extenciones.includes(extencion)) {
            return ({ msg: ` 'El archivo cargado en ${archivo} debe estar en formato pdf'` })
        }
        return true

    }

    if (files.Factura) {
        const validarFactura = validarpdfile(files.Factura, 'Factura')
        if(validarFactura.msg) {
            return (validarFactura)
        }
    }

    if (files.Importacion) {
        const validarImportacion = validarpdfile(files.Importacion, 'Importacion')
        if (validarImportacion.msg) {
            return (validarImportacion)
        }
    }

    if (files.Invima) {
        const validarInvima = validarpdfile(files.Invima, 'Invima')
        if (validarInvima.msg) {
            return (validarInvima)
        }
    }

    if (files.ActaEntrega) {
        const validarActaEntrega = validarpdfile(files.ActaEntrega, 'Acta de entrega')
        if (validarActaEntrega.msg) {
            return (validarActaEntrega)
        }
    }

    if (files.Garantia) {
        const validarGarantia = validarpdfile(files.Garantia, 'Garantia')
        if (validarGarantia.msg) {
            return (validarGarantia)
        }
    }

    if (files.Manual) {
        const validarManual = validarpdfile(files.Manual, 'Manual')
        if (validarManual.msg) {
            return (validarManual)
        }
    }

    if (files.Otro) {
        const validarOtro = validarpdfile(files.Otro, 'Otro')
        if (validarOtro.msg) {
            return (validarOtro)
        }
    }

    if (files.ReporteExterno) {
        const validarReporteExterno = validarpdfile(files.ReporteExterno, 'Reporte Externo')
        if (ReporteExterno.msg) {
            return (ReporteExterno)
        }
    }

    return true

}

export{validarFiles}