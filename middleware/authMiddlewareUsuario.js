import { desencriptarJson } from "../helpers/encriptarData.js";
const checkAuth = (req, res, next) => {

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){

        const token = req.headers.authorization.split(' ')[1];
        const dataUsuarioSesion =  desencriptarJson(token)
        if(dataUsuarioSesion.msg){
            res.json(dataUsuarioSesion)
            return
        }

        res.json(dataUsuarioSesion)
        return 
    }

    const error = new Error("Token requerido, invalido o no exixtente, inicia sesion para continuar")
    res.status(403).json({msg:error.message})
    next()
}

const checkAuthImage = (req, res, next) => {

    next()
}


export { checkAuth, checkAuthImage  }