import { WebSocketServer } from 'ws';
import fs from 'fs/promises';

const STORAGE_PATH = './notebooks.json';
const HEARTBEAT_INTERVAL = 30000;
let notebookContent = '';

async function loadContent() {
    try {
        const data = await fs.readFile(STORAGE_PATH, 'utf8');
        notebookContent = JSON.parse(data).content || '';
        console.log('Loaded content:', notebookContent);
    } catch (err) {
        notebookContent = '';
    }
}

async function saveContent(content) {
    try {
        notebookContent = content;
        await fs.writeFile(STORAGE_PATH, JSON.stringify({ content }));
        console.log('Content saved:', content);
    } catch (err) {
        console.error('Save error:', err);
    }
}

const wss = new WebSocketServer({ port: 8080, host: 'localhost' });

wss.on('connection', function connection(ws) {
    console.log('Client connected');

    ws.send(JSON.stringify({ type: 'init', content: notebookContent }));

    ws.on('message', async function(data) {
        try {
            console.log('Received:', data.toString());
            const parsed = JSON.parse(data);
            
            if (parsed.type === 'update') {
                await saveContent(parsed.content);
                
                wss.clients.forEach(client => {
                    if (client !== ws && client.readyState === 1) {
                        client.send(JSON.stringify({
                            type: 'update',
                            content: notebookContent
                        }));
                    }
                });
            }
        } catch (err) { 
            console.error('Message error:', err);
        }
    });

    ws.on('close', () => console.log('Client disconnected'));
});

loadContent().then(() => {
    console.log('Running server');
});