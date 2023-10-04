import mime from 'mime-types'

const validarImagenes = imagen =>{
    // imagenes
    const mimeType = imagen.split(',')[0].split(';')[0].split(':')[1]
    const extensiones = ['png', 'jpg', 'jpeg']
    if (!extensiones.includes(mime.extension(mimeType))) return { msg: 'Solo se aceptan imagenes en formato png, jpg o jpeg' }

    const imgBase64 = imagen.split(',')[1]
    const decodedData = Buffer.from(imgBase64, 'base64');
    const sizeInBytes = decodedData.length
    if (sizeInBytes > 6291456) return { msg: 'Solo se aceptan imagenes de tamaño hasta 6 Mb' }

    return true
}

const validarDocumentos = docuemnto =>{
    // documentos
    const mimeType = docuemnto.split(',')[0].split(';')[0].split(':')[1]
    if (mime.extension(mimeType) !== 'pdf') return { msg: 'Solo se aceptan documentos en formato pdf' }

    const imgBase64 = docuemnto.split(',')[1]
    const decodedData = Buffer.from(imgBase64, 'base64');
    const sizeInBytes = decodedData.length
    if (sizeInBytes > 15000000) return { msg: 'Solo se aceptan documentos de tamaño menor de 15Mb' }

    return true
}




export{validarImagenes, validarDocumentos}