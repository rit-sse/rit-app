import express, { Request, Response } from 'express';

// TODO: Shove this into a .env file
const PORT: number = 3000;

const app: express.Express = express();

app.get('/', (req: Request, res: Response) => {
    res.send('Hello, World!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});