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

const recursiveLoadRoutes = (dir: string) => {
    fs.readdirSync(dir).forEach((file) => {
        if(file.toString() == "route.js") {
            const route = require(`${dir}/${file}`);
            const routePath = `${dir.split("/webserver/dist/routes")[1]}/`;
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
            console.log(`Loaded route: [${routePath}] from file: ${file}`);
            return;
        }
        if (file.endsWith('.js')) {
            const route = require(`${dir}/${file}`);
            const routePath = `${dir.split("/webserver/dist/routes")[1]}/${file.replace('.js', '')}`;

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
            console.log(`Loaded route: [${routePath}] from file: ${file}`);
        }
        else if(fs.lstatSync(`${dir}/${file}`).isDirectory()) {
            recursiveLoadRoutes(`${dir}/${file}`);
        }
    });
}

recursiveLoadRoutes(SOURCE_DIR);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});