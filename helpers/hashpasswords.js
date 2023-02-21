import bcrypt from 'bcrypt';
import{consultarPassword} from '../db/sqlUsuarios.js'

const encryptPassword = async (password) =>{
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
}

const validarPassword = async function (password, id){
    const passwordBD = await consultarPassword(id)
    if (passwordBD.msg){
        return passwordBD
    }
    return await bcrypt.compare(password, passwordBD.password);
}

export{
    encryptPassword,
    validarPassword,
}