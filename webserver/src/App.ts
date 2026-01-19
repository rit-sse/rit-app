import 'dotenv/config'
import express, {Request, Response} from 'express';
import fs from 'node:fs';
import {resolve} from "node:path";

const PORT: number = Number(process.env.PORT);
const SOURCE_DIR: string = resolve(__dirname + '/routes');


const app: express.Express = express();

app.get('/', (req: Request, res: Response) => {
    res.send('Hello, World!');
});

// Dynamically load all route files from the routes directory
fs.readdirSync(SOURCE_DIR).forEach((file) => {
    if (file.endsWith('.js')) {
        const route = require(`${SOURCE_DIR}/${file}`);
        const routePath = `/${file.replace('.js', '')}`;

        if (route.GET) {
            app.get(routePath, route.GET);
        }
        if (route.POST) {
            app.post(routePath, route.POST);
        }
        if(route.PUT) {
            app.put(routePath, route.PUT);
        }
        if(route.DELETE) {
            app.delete(routePath, route.DELETE);
        }
        // Add other HTTP methods as needed
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});