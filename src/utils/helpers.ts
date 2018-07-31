import { Response } from 'express';
import { Socket } from 'net';
import { debuglog } from 'util';

const debug = debuglog('util');

export function resErrorHandler(res: Response, statusCode: number, message: string, err?: Error) {
    return res.status(statusCode).json({
        message,
        error: err || ''
    });
}

export function checkPortStatus(port: number, host: string = '127.0.0.1', timeout: number = 400, callback: any) {
    let connRefused: boolean = false;
    const socket: Socket = new Socket();
    let status: string | null = null;
    let error: Error | null = null;

    socket.on('connect', () => {
        debug('Socket Connect');
        status = 'open';
        socket.destroy();
    });

    socket.setTimeout(timeout);
    socket.on('timeout', () => {
        debug('Socket timeout');
        status = 'closed';
        error = new Error(`Timeout (${timeout} ms) occurred waiting for ${host}:${port} to be available`);
        socket.destroy();
    });

    socket.on('error', (err: any) => {
        debug('Socket Error: ' + err.code);
        if ( err.code === 'ECONNREFUSED' ) {
            error = err;
        } else {
            connRefused = true;
        }
        status = 'closed';
    });

    socket.on('close', (err: any) => {
        debug('Socket Close');
        if ( err && !connRefused ) {
            error = error || err;
        } else {
            error = null;
        }
        debug('CB: err: ' + err);
        debug('CB status ' + status);
        callback(error, status);
    });

    debug('Socket connecting');
    socket.connect(port, host);
}