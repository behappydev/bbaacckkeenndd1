// utils/fileManager.js
const fs = require("fs-extra");
const path = require("path");

class FileManager {
  constructor(fileName) {
    this.filePath = path.join(__dirname, "..", fileName);
  }

  // Leer el archivo JSON
  async readFile() {
    try {
      const data = await fs.readJson(this.filePath);
      return data;
    } catch (error) {
      // Si el archivo no existe, devolver un arreglo vacío
      if (error.code === "ENOENT") {
        return [];
      } else {
        throw error;
      }
    }
  }

  // Escribir en el archivo JSON
  async writeFile(data) {
    try {
      await fs.writeJson(this.filePath, data, { spaces: 2 });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = FileManager;
