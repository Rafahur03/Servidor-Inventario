function validarFecha(fecha) {
    // Define una expresión regular para el formato "yyyy-mm-dd"
    const patron = /^\d{4}-\d{2}-\d{2}$/;
  
    // Comprueba si la fecha coincide con el formato deseado
    if (patron.test(fecha)) {
      // Intenta crear un objeto Date a partir de la fecha
      const partesFecha = fecha.split('-');
      const año = parseInt(partesFecha[0], 10);
      const mes = parseInt(partesFecha[1], 10) - 1; // Restamos 1 porque los meses en JavaScript van de 0 a 11
      const dia = parseInt(partesFecha[2], 10);
      const fechaObj = new Date(año, mes, dia);
  
      // Comprueba si la fecha es válida en términos de calendario
      if (
        fechaObj.getFullYear() === año &&
        fechaObj.getMonth() === mes &&
        fechaObj.getDate() === dia
      ) {
        return true; // La fecha es válida
      }
    }
  
    return false; // La fecha no cumple con el formato deseado o no es válida en términos de calendario
  }
  
  export{validarFecha}