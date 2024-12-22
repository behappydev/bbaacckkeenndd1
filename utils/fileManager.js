// utils/fileManager.js
const fs = require('fs-extra');
const path = require('path');

class FileManager {
    constructor(filename) {
        this.filePath = path.join(__dirname, '..', 'data', filename);
    }

    async readFile() {
        try {
            const exists = await fs.pathExists(this.filePath);
            if (!exists) {
                await fs.writeJson(this.filePath, []);
            }
            const data = await fs.readJson(this.filePath);
            return data;
        } catch (error) {
            throw new Error(`Error leyendo el archivo ${this.filePath}: ${error}`);
        }
    }

    async writeFile(data) {
        try {
            await fs.writeJson(this.filePath, data, { spaces: 2 });
        } catch (error) {
            throw new Error(`Error escribiendo en el archivo ${this.filePath}: ${error}`);
        }
    }
}

module.exports = FileManager;
