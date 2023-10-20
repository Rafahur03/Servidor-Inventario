import { crearPdfMake } from "../helpers/crearPdfMake.js"
import { consultarCodigoInterno } from "../db/sqlActivos.js"
const descargaCronograma = async (req, res) => {

    const { data } = req.body

    if(data.tipo !='pdf' && data.tipo !='excel') return res.json({msg: 'No se pudo validar el tipo de archivo seleccionado'})

    for(var i = 0; i < data.filtros.length; i++) {
        console.log(typeof(data.filtros[i].valor))
        if (typeof data.filtros[i].valor !== 'boolean') {
            return res.json({ msg: 'No se pudo validar los filtros seleccionados' });
          }
          
          if (
            typeof data.filtros[i].id !== 'string' || data.filtros[i].id.trim().length === 0) {
            return res.json({ msg: 'No se pudo validar los filtros seleccionados' });
          }
    }    

    if(data.filtros.every(item => item.valor === false)) return res.json({msg:'Debe escoger una Clasificacion de Activo'})

    if(isNaN(parseInt(data.year))) return  res.json({msg: 'Debe escoger un año de la lista'})
  
    let cronograma = await crearPdfMake(data, 'cronogramaMtto')
    if(cronograma.msg) return res.json(cronograma)

    res.json({
        reportePDF: (data.tipo == 'pdf' ? 'data:application/pdf;base64,' + cronograma : '.xlsx'),
        nombre : 'Cronograma ' + data.year + (data.tipo == 'pdf' ? '.pdf' : '.xlsx')
    })

}
const informelistadoAct = async (req, res) => {

    const { data } = req.body


    res.json({
        msg: 'llegamos al servidor informelistadoAct'
    })

}

const informelistadoActCost = async (req, res) => {

    const { data } = req.body
    console.log(data)
    //const reporte = await crearPdfMake(data)

    res.json({
        msg: 'llegamos al servidor informelistadoActCost'
    })

}
const descargarIfoActCosteado = async (req, res) => {

    const { data } = req.body
    console.log(data)
    if(data.tipo !='pdf' && data.tipo !='excel') return res.json({msg: 'No se pudo validar el tipo de archivo seleccionado'})
    if(parseInt(data.activo.split('-')[1]) == NaN) return res.json({msg: 'Debe escoger un activo valido'})
    const activo = await consultarCodigoInterno(data.activo.split('-')[1])
    if(activo.msg) return res.json({msg: 'No se pudo validar el activo'})
    if(data.codigo != activo.codigo) return res.json({msg: 'Debe escoger un activo valido'})
    console.log(activo)
    let informe = await crearPdfMake(activo.id, 'InformActivoCosteado')
    if(informe.msg) return res.json({msg: 'No fue posible crear el informe'})

    res.json({
        reportePDF: (data.tipo == 'pdf' ? 'data:application/pdf;base64,' + informe : '.xlsx'),
        nombre : 'Informe Activo ' + activo.codigo + (data.tipo == 'pdf' ? '.pdf' : '.xlsx')
    })

}
export {
    descargaCronograma,
    informelistadoAct,
    informelistadoActCost,
    descargarIfoActCosteado,
}