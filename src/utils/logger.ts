import { createLogger, default as Logger } from 'bunyan';
import { resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';

const level = 'info';
const filePath = resolve(__dirname, '..', '..', 'logs', 'app.log');
const folderPath = resolve(__dirname, '..', '..', 'logs');

if ( !existsSync(folderPath) )
    mkdirSync(folderPath);

export const logger: Logger = createLogger({
    name: 'apiLogger',
    src: true,
    streams: [
        {
            level,
            stream: process.stdout
        },
        {
            type: 'rotating-file',
            period: '1d',
            count: 10,
            level,
            path: filePath
        }
    ]
});