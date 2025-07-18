import pkg from 'fs-extra';
const { copy, existsSync } = pkg;
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function migrateFiles() {
    try {
        const rootDir = resolve(__dirname, '..');

        // Copy CSS files
        if (existsSync(resolve(rootDir, 'public/css'))) {
            await copy(
                resolve(rootDir, 'public/css'),
                resolve(rootDir, 'src/styles/css')
            );
            console.log('CSS files migrated successfully');
        }

        // Copy images
        if (existsSync(resolve(rootDir, 'public/vite.svg'))) {
            await copy(
                resolve(rootDir, 'public/vite.svg'),
                resolve(rootDir, 'assets/images/vite.svg')
            );
            console.log('Images migrated successfully');
        }

        // Copy React components
        if (existsSync(resolve(rootDir, 'src/components'))) {
            await copy(
                resolve(rootDir, 'src/components'),
                resolve(rootDir, 'src/components')
            );
            console.log('Components migrated successfully');
        }

        console.log('Migration completed successfully!');
    } catch (err) {
        console.error('Error during migration:', err);
    }
}

migrateFiles();
