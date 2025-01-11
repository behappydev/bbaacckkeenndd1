// utils/fileManager.js

const fs = require("fs").promises;
const path = require("path");

class FileManager {
  /**
   * Crea una instancia de FileManager.
   * @param {string} filePath - Ruta al archivo JSON.
   */
  constructor(filePath) {
    this.filePath = path.resolve(filePath);
  }

  /**
   * Lee y devuelve el contenido del archivo JSON.
   * @returns {Promise<Array>} - Contenido del archivo como un arreglo.
   */
  async readFile() {
    try {
      const data = await fs.readFile(this.filePath, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      // Si el archivo no existe, devolver un arreglo vacío
      if (error.code === "ENOENT") {
        return [];
      }
      console.error(`Error al leer el archivo ${this.filePath}:`, error);
      throw new Error("No se pudo leer el archivo de datos.");
    }
  }

  /**
   * Escribe datos en el archivo JSON.
   * @param {Array} data - Datos a escribir en el archivo.
   * @returns {Promise<void>}
   */
  async writeFile(data) {
    try {
      await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), "utf-8");
    } catch (error) {
      console.error(`Error al escribir en el archivo ${this.filePath}:`, error);
      throw new Error("No se pudo escribir en el archivo de datos.");
    }
  }
}

module.exports = FileManager;
