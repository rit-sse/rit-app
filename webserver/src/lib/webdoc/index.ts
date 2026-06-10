import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';

const DOCS_DIR = path.resolve(__dirname, '../../../docs');
const SHELL_PATH = path.resolve(__dirname, 'shells/page.html');

let _shellTemplate: string | null = null;
function loadShell(): string {
    if (!_shellTemplate) {
        _shellTemplate = fs.readFileSync(SHELL_PATH, 'utf-8');
    }
    return _shellTemplate;
}

export interface DocEntry {
    name: string;
    title: string;
}

const PAGE_ORDER: Record<string, number> = {
    'overview': 1,
    'api-reference': 2,
    'caching': 3,
    'adding-routes': 4,
};

// Returns a list of available docs, extracting the H1 title from each file.
// Ordered by PAGE_ORDER; unrecognised pages sort to the end alphabetically.
export function listDocs(): DocEntry[] {
    return fs.readdirSync(DOCS_DIR)
        .filter(f => f.endsWith('.md'))
        .map(f => {
            const name = f.replace(/\.md$/, '');
            const content = fs.readFileSync(path.join(DOCS_DIR, f), 'utf-8');
            const title = content.match(/^#\s+(.+)/m)?.[1] ?? name;
            return { name, title };
        })
        .sort((a, b) => {
            const wa = PAGE_ORDER[a.name] ?? Infinity;
            const wb = PAGE_ORDER[b.name] ?? Infinity;
            if (wa !== wb) return wa - wb;
            return a.name.localeCompare(b.name);
        });
}

// Returns the raw markdown for a doc, or null if the name is invalid / not found.
export function getDocMarkdown(name: string): string | null {
    if (!/^[a-zA-Z0-9_-]+$/.test(name)) return null;
    const filePath = path.join(DOCS_DIR, `${name}.md`);
    if (!fs.existsSync(filePath)) return null;
    return fs.readFileSync(filePath, 'utf-8');
}

// Returns the rendered HTML for a doc, wrapped in the page shell.
export function renderDoc(name: string): string | null {
    const md = getDocMarkdown(name);
    if (md === null) return null;
    const body = marked.parse(md) as string;
    const title = md.match(/^#\s+(.+)/m)?.[1] ?? name;
    return applyShell(title, body);
}

// Returns an HTML index page listing all available docs.
export function renderIndex(): string {
    const docs = listDocs();
    const items = docs
        .map(d => `<li><a href="/docs/?page=${d.name}">${d.title}</a></li>`)
        .join('\n        ');
    return applyShell('Documentation', `<h1>Documentation</h1>\n    <ul>\n        ${items}\n    </ul>`);
}

function applyShell(title: string, body: string): string {
    return loadShell()
        .replace('{{title}}', escapeHtml(title))
        .replace('{{body}}', body);
}

function escapeHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
