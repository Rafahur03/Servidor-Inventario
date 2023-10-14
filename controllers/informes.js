const descargaCronograma = async (req, res) => {

    const { data } = req.body


    res.json({
        msg: 'llegamos al servidor descargaCronograma'
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


    res.json({
        msg: 'llegamos al servidor informelistadoActCost'
    })

}
const descargarIfoActCosteado = async (req, res) => {

    const { data } = req.body


    res.json({
        msg: 'llegamos al servidor descargarIfoActCosteado'
    })

}
export {
    descargaCronograma,
    informelistadoAct,
    informelistadoActCost,
    descargarIfoActCosteado,
}