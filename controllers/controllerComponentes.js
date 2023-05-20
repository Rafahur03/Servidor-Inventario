const eliminarComponente = async (req, res) => {

    const { permisos } = req
    const arrPermisos = JSON.parse(permisos)
    if (arrPermisos.indexOf(3) === -1) {
        return res.json({ msg: 'Usted no tiene permisos para Actualizar Activos' })
    }

    const idComponente = req.body.id


}