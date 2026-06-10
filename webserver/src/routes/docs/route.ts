import { Request, Response } from 'express';
import { renderDoc, renderIndex } from '../../lib/webdoc';

export function GET(req: Request, res: Response) {
    const page = req.query['page']?.toString();

    if (!page) {
        res.setHeader('Content-Type', 'text/html');
        res.send(renderIndex());
        return;
    }

    const html = renderDoc(page);
    if (!html) {
        res.status(404).json({ error: 'Doc not found', page });
        return;
    }

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
}
