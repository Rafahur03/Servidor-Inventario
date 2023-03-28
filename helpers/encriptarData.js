import CryptoJS from "crypto-js";
import { json } from "express";

const encriptarJson = data => {
    return CryptoJS.AES.encrypt(JSON.stringify(data), process.env.ENCRIPTEKEY).toString();
}

const desencriptarJson = data => {
     const bytes = CryptoJS.AES.decrypt(data, process.env.ENCRIPTEKEY);
     try {
        if (bytes.sigBytes < 0){
            return({msg: 'token invalido debe iniciar sesion nuevamente.'})
        }
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
     } catch (error) {
        return({msg: 'token invalido debe iniciar sesion nuevamente.'})
     }
    
  
}

export{
    encriptarJson,
    desencriptarJson
}