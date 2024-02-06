import { conectardb, cerrarConexion } from "./db.js";


const consultarListadoInsumosBodega = async () => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
        SELECT CONCAT('Ins-',ib.id) as id, TRIM(ins.insumo) AS nombre,TRIM(ar.area) AS area,TRIM(ma.marca) AS marca, ib.modelo, ib.serie, ib.cantidad
            FROM insumoBodega  ib
            INNER JOIN insumos ins
            ON ins.id = ib.id
            INNER JOIN areas ar
            ON ar.id = ib.idArea
            INNER JOIN marca_activos ma
            ON ma.id = ib.marca
        WHERE cantidad > 0
    `)
        cerrarConexion(pool)
        return (resultado.recordset)

    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar consultar los insumos' }
    }
}

const consultarInsumosBodega = async (id) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
        SELECT CONCAT('Ins-', ib.id) AS id, TRIM(ins.insumo) AS nombre,TRIM(ar.area) AS area,TRIM(ma.marca) AS marca, ib.modelo, ib.serie, ib.proveedor AS idProveedor,
	        ib.cantidad, ib.costo_Unitario, CONCAT(TRIM(pro.razon_social), ' -- ',TRIM(pro.nombre_comercial), ' -- ', TRIM(pro.nit)) AS provedor,
	        ib.idArea AS idArea, ib.marca AS idMArca, ib.fechaCompra, ib.factura
	        FROM insumoBodega  ib
            INNER JOIN insumos ins
            ON ins.id = ib.id
            INNER JOIN areas ar
            ON ar.id = ib.idArea
            INNER JOIN marca_activos ma
            ON ma.id = ib.marca
            INNER JOIN proveedores pro
            ON pro.id = ib.proveedor
        WHERE ib.id = ${id}
    `)
        cerrarConexion(pool)
        return (resultado.recordset[0])

    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar consultar los insumos' }
    }
}

export {
    consultarListadoInsumosBodega,
    consultarInsumosBodega

}