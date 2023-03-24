import formidable from "formidable"
import { consultarActivos } from "../db/sqlActivos.js"


const consultarActivosTodos = async (req, res) => {
    const listadoActivos = await consultarActivos()
    res.json(listadoActivos)
}

const crearActivo = async (req, res) => {
    const form = formidable({ multiples: true });
    form.parse(req, function (err, fields, files) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: err });
        }
        //const file = files.Image; // Obtener el objeto de archivo cargado
        //file.forEach(image=> {console.log(image.PersistentFile.path)})
       // const oldPath = file.path; // Obtener la ruta temporal del archivo cargado
        console.log(files.Image[0].PersistentFile.filepath); // Datos del archivo cargado
        console.log(fields); // Datos del formulario
        res.json({msg:'Archivo cargado correctamente'});
    });
}

export{     
    consultarActivosTodos,
    crearActivo
}

