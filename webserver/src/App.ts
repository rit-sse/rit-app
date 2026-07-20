import 'dotenv/config'
import express, {Request, Response} from 'express';
import fs from 'node:fs';
import {extname, resolve, join, relative, sep} from "node:path";
import { scheduler } from './lib/cache-scheduler/scheduler';

const PORT: number = Number(process.env.PORT) || 3000; // I didn't make a .env file D:
const SOURCE_DIR: string = resolve(__dirname, 'routes');

// Turns an absolute directory into a POSIX-style route path relative to SOURCE_DIR,
// so routing works the same regardless of the OS path separator.
const toRelativeRoutePath = (dir: string) => relative(SOURCE_DIR, dir).split(sep).join('/');


const app: express.Express = express();
app.use(express.json()); // Middleware to parse JSON bodies

app.get('/', (req: Request, res: Response) => {
    res.send('Hello, World!');
});

// This replicates Next.js's file-based routing system. Chosen since the website uses Next.js
// Oh god why
const isRouteModuleFile = (file: string) => {
    const extension = extname(file);
    return (extension === ".js" || extension === ".ts") && !file.endsWith(".d.ts");
}

const registerRouteModule = (modulePath: string, routePath: string, file: string) => {
    const route = require(modulePath);
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
    if (route.CACHEJOB) {
        const { key, intervalMs, fetcher } = route.CACHEJOB;
        scheduler.registerLoop(key, intervalMs, fetcher);
        console.log(`Registered cache job: [${key}] from file: ${file}`);
    }
    console.log(`Loaded route: [${routePath}] from file: ${file}`);
}

const normalizeRoutePath = (routePath: string) => {
    if (!routePath || routePath === "//") {
        return "/";
    }
    const withLeadingSlash = routePath.startsWith("/") ? routePath : `/${routePath}`;
    return withLeadingSlash.replace(/\/{2,}/g, "/");
}

const recursiveLoadRoutes = (dir: string) => {
    fs.readdirSync(dir).forEach((file) => {
        if(file.toString() == "route.js") {
            const route = require(join(dir, file));
            const routePath = normalizeRoutePath(`${toRelativeRoutePath(dir)}/`);
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
            if (route.CACHEJOB) {
                const { key, intervalMs, fetcher } = route.CACHEJOB;
                scheduler.registerLoop(key, intervalMs, fetcher);
                console.log(`Registered cache job: [${key}] from file: ${file}`);
            }
            // Add other HTTP methods as needed
            console.log(`Loaded route: [${routePath}] from file: ${file}`);
            return;
        }
        if (isRouteModuleFile(file)) {
            const routePath = normalizeRoutePath(
                `${toRelativeRoutePath(dir)}/${file.replace(/\.(js|ts)$/, '')}`,
            );
            registerRouteModule(join(dir, file), routePath, file);
        }
        else if(fs.lstatSync(join(dir, file)).isDirectory()) {
            recursiveLoadRoutes(join(dir, file));
        }
    });
}

recursiveLoadRoutes(SOURCE_DIR);

const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    scheduler.start();
});

const shutdown = () => {
    scheduler.stop();
    server.close(() => process.exit(0));
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
