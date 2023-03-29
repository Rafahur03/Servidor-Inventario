import { desencriptarJson } from "../helpers/encriptarData.js";
import { consultarToken } from "../db/sqlUsuarios.js";

const checkAuth = async(req, res, next) => {

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){

        const token = req.headers.authorization.split(' ')[1];

        const tokenExisteBD = await consultarToken(token)
        if(typeof tokenExisteBD == 'undefined'){
            res.json({msg: 'Sesion Invalidad debe iniciar sesion nuevamente'})
            return
        }
    
        const dataToken =  desencriptarJson(token)
        if(dataToken.msg){
            res.json(dataToken)
            return
        }
        const hoy = new Date(Date.now())
        const fecha = hoy.toLocaleDateString()
        
        if(dataToken.fechaexpiracion < fecha){
            res.json({msg: 'Sesion expirada debe iniciar sesion nuevamente'})
            return
        }
        console.log
        if(dataToken.id !== tokenExisteBD.id){
            res.json({msg: 'Lo sentimos token ivalido inicie sesion nuevamente'})
            return
        }

        req.sessionid = tokenExisteBD.id
        req.permisos= tokenExisteBD.permisos
        return   next()  
      
    }

    const error = new Error("Token requerido, invalido o no exixtente, inicia sesion para continuar")
    return res.status(403).json({msg:error.message})
    

}

export { checkAuth  }