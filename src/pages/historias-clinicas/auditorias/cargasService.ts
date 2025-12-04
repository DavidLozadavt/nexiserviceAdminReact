import axios from "axios";

class CargasService {
    cargarCIE(archivo: File) {
        const formData = new FormData();
        formData.append("archivo", archivo);

        return axios.post("/cargar-cie", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
    }

    cargarCUPS(archivo: File) {
        const formData = new FormData();
        formData.append("archivo", archivo);

        return axios.post("/cargar-cups", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
    }
}

export default new CargasService();
