#!/usr/bin/env python3
"""Check that every internal reference on the site points at a file that exists.

Covers href/src/srcset/poster attributes and inline style url()s in every HTML
page, plus url()s in the stylesheets those pages load. Links to
https://edenhealthandbeautyspa.co.uk/... are checked against the local files;
links to the old www. host are reported, as that server no longer exists.

Usage: check_links.py SITE_DIR
"""
import os
import re
import sys
from urllib.parse import unquote, urlsplit

DOMAIN = 'edenhealthandbeautyspa.co.uk'
ATTR = re.compile(r'\b(href|src|srcset|poster)\s*=\s*(["\'])(.*?)\2', re.I | re.S)
CSS_URL = re.compile(r'url\(\s*(["\']?)(.*?)\1\s*\)', re.I)
COMMENT = re.compile(r'<!--.*?-->', re.S)


def resolve(site, base_dir, ref):
    """Return the site-relative path ref points at, or None if it is external."""
    ref = ref.strip()
    if not ref or ref.startswith(('#', 'data:', 'mailto:', 'tel:', 'javascript:')):
        return None
    parts = urlsplit(ref)
    if parts.scheme or ref.startswith('//'):
        if parts.netloc == 'www.' + DOMAIN:
            raise ValueError('points at the old www. server; use a relative path')
        if parts.netloc != DOMAIN:
            return None
        path = parts.path
    else:
        path = parts.path
        if not path:
            return None
    path = unquote(path)
    if path.startswith('/'):
        return os.path.normpath(path.lstrip('/')) if path != '/' else '.'
    return os.path.normpath(os.path.join(base_dir, path))


def exists(site, path):
    """Mirror GitHub Pages: /x serves x, x.html or x/index.html."""
    full = os.path.join(site, path)
    return (os.path.isfile(full) or os.path.isfile(full + '.html')
            or os.path.isfile(os.path.join(full, 'index.html')))


def refs_in_html(text):
    text = COMMENT.sub('', text)  # skips IE-only conditional comments
    for attr, _, value in ATTR.findall(text):
        if attr.lower() == 'srcset':
            for candidate in value.split(','):
                if candidate.strip():
                    yield candidate.split()[0]
        else:
            yield value.replace('&amp;', '&')
    for match in re.finditer(r'style\s*=\s*"([^"]*)"', text, re.I):
        for _, value in CSS_URL.findall(match.group(1)):
            yield value


def main(site):
    errors = []
    stylesheets = set()

    def check(source, base_dir, ref):
        try:
            path = resolve(site, base_dir, ref)
        except ValueError as e:
            errors.append(f'{source}: {ref} ({e})')
            return None
        if path is not None and not exists(site, path):
            errors.append(f'{source}: {ref} (not found: {path})')
            return None
        return path

    pages = sorted(os.path.relpath(os.path.join(d, f), site)
                   for d, _, files in os.walk(site) for f in files if f.endswith('.html'))
    for page in pages:
        with open(os.path.join(site, page), encoding='utf-8', errors='replace') as fh:
            html = fh.read()
        for ref in refs_in_html(html):
            path = check(page, os.path.dirname(page), ref)
            if path and path.endswith('.css'):
                stylesheets.add(path)

    for sheet in sorted(stylesheets):
        with open(os.path.join(site, sheet), encoding='utf-8', errors='replace') as fh:
            css = fh.read()
        for _, ref in CSS_URL.findall(css):
            check(sheet, os.path.dirname(sheet), ref)

    for error in errors:
        print(f'::error::{error}')
    print(f'Checked {len(pages)} pages and {len(stylesheets)} stylesheets: '
          f'{len(errors)} broken reference(s).')
    return 1 if errors else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else '.'))
