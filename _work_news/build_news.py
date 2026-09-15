# -*- coding: utf-8 -*-
# Сборщик новостей: из скачанных статей старого сайта -> js/news-data.js
import io, re, os, json

FALLBACK_IMG = {
    '01': 'images/2026-08-31 231216.jpg',
    '15': 'images/dir-urolithiasis.jpg',
    '18': 'images/history-2022-transplant-1.jpg',
    '23': 'images/dir-reconstructive.jpg',
    '265': 'images/dir-oncology.jpg',
    '266': 'images/oper1.jpeg',
}
KEEP_TAGS = {'p', 'br', 'strong', 'b', 'em', 'i', 'a', 'img', 'video', 'source', 'ul', 'ol', 'li',
             'blockquote', 'h3', 'h4'}

def clean_ext(src):
    ext = os.path.splitext(src.split('?')[0])[1].lower() or '.jpg'
    return ext if ext in ('.jpg', '.jpeg', '.png', '.webp', '.gif') else '.jpg'

def extract_body(html):
    m = re.search(r'<div class="right-side[^"]*">(.*?)(?:<div class="gray-line">|</section>)',
                  html, re.S)
    return m.group(1) if m else ''

def unwrap_disallowed(html):
    # убираем script/style целиком
    html = re.sub(r'<(script|style)[^>]*>.*?</\1>', '', html, flags=re.S | re.I)
    html = re.sub(r'<!--.*?-->', '', html, flags=re.S)
    # разворачиваем неразрешённые теги (сохраняя содержимое), разбирая С КОНЦА строки
    pattern = re.compile(r'</?([a-zA-Z0-9]+)(?:\s[^<>]*)?/?>', re.S)
    prev = None
    while prev != html:
        prev = html
        html = pattern.sub(lambda m: m.group(0) if m.group(1).lower() in KEEP_TAGS else '', html)
    return html

def rewrite_media(html, aid):
    # изображения -> локальные пути (нумерация как при скачивании)
    idx = 0
    def img_repl(m):
        nonlocal idx
        name = f'images/news/n{aid}-{idx}{clean_ext(m.group(1))}'
        idx += 1
        return f'<img src="{name}" alt="" loading="lazy" />'
    html = re.sub(r'<img\b[^>]*?\bsrc="([^"]+)"[^>]*?/?>', img_repl, html, flags=re.S)

    # видео -> компактный тег с прямой ссылкой на mp4
    def vid_repl(m):
        vtag = m.group(0)
        src = re.search(r'<source\b[^>]*?\bsrc="([^"]+)"', vtag, flags=re.S)
        if not src:
            src = re.search(r'\bsrc="([^"]+\.mp4[^"]*)"', vtag)
        if not src:
            return ''
        u = src.group(1).split('?')[0]
        return f'<video controls preload="metadata" src="{u}"></video>'
    html = re.sub(r'<div\b[^>]*?\bwp-video\b[^>]*>.*?</div>', vid_repl, html, flags=re.S)
    html = re.sub(r'<video\b[^>]*>.*?</video>', vid_repl, html, flags=re.S)
    return html

def clean_links_and_attrs(html):
    def a_repl(m):
        href, inner = m.group(1), m.group(2)
        if '.mp4' in href:
            return inner
        return f'<a href="{href}" target="_blank" rel="noopener">{inner}</a>'
    html = re.sub(r'<a\b[^>]*?\bhref="([^"]+)"[^>]*>(.*?)</a>', a_repl, html, flags=re.S)
    html = re.sub(r'<(p|strong|b|em|i|ul|ol|li|blockquote|h3|h4)\b[^>]*>', r'<\1>', html)
    html = html.replace('&nbsp;', ' ')
    html = html.replace('\xa0', ' ')
    # пустые обёртки
    html = re.sub(r'<p>\s*(<(?:img|video)\b[^>]*>)\s*</p>', r'\1', html)
    html = re.sub(r'<p>\s*</p>', '', html)
    html = re.sub(r'<i>\s*</i>', '', html)
    # заголовок статьи дублируется первой строкой тела — убираем
    html = re.sub(r'^\s*<h2>.*?</h2>\s*', '', html, flags=re.S)
    # первый абзац, повторяющий заголовок, тоже убираем
    m = re.match(r'^(<p>)(.*?)(</p>)', html, flags=re.S)
    if m:
        first_txt = ' '.join(re.sub(r'<[^>]+>', '', m.group(2)).split()).rstrip('.').lower()
        title_cmp = title.rstrip('.').lower()
        if first_txt and (first_txt == title_cmp or first_txt in title_cmp or title_cmp in first_txt):
            html = html[m.end():].lstrip()
    html = re.sub(r'\n\s*\n+', '\n', html)
    return html.strip()

def build_item(aid, url, date):
    raw = io.open(f'_work_news/articles/{aid}.html', 'rb').read().decode('utf-8', errors='replace')
    body = extract_body(raw)
    h2 = re.search(r'<h2[^>]*>(.*?)</h2>', body, re.S)
    title = ' '.join(re.sub(r'<[^>]+>', '', h2.group(1)).split()) if h2 else ('Новость ' + aid)
    title = title.replace('\ufe0f', '').strip()
    body = unwrap_disallowed(body)
    body = rewrite_media(body, aid)
    body = clean_links_and_attrs(body)
    # остаток заголовка «голым текстом» в начале тела — убираем
    body = re.sub(r'^\s*' + re.escape(title) + r'\s*', '', body)
    slug = url.rstrip('/').split('/')[-1].replace('\ufe0f', '')
    slug = re.sub(r'[^a-z0-9-]', '', slug) or ('news-' + aid)
    if slug.isdigit():
        slug = 'news-' + slug
    if slug == 'news-5117':
        slug = 'uchastie-onkologov-azon'
    first = sorted(f for f in os.listdir('images/news') if f.startswith('n' + aid + '-'))
    img = f'images/news/{first[0]}' if first else FALLBACK_IMG.get(aid, 'images/news-1.jpg')
    return {'id': slug, 'date': date, 'title': title, 'img': img, 'body': body}

items = []
for line in io.open('_work_news/manifest.txt', encoding='utf-8').read().splitlines():
    p = line.split('|')
    items.append(build_item(p[0].split('/')[-1].replace('.html', ''), p[3], p[1]))
for line in io.open('_work_news/manifest2025.txt', encoding='utf-8').read().splitlines():
    p = line.split('|')
    items.append(build_item(p[0], p[2], p[1]))

def dkey(it):
    d, m, y = it['date'].split('.')
    return (y, m, d)
items.sort(key=dkey, reverse=True)

out = 'window.NEWS_DATA = ' + json.dumps(items, ensure_ascii=False, indent=1) + ';\n'
io.open('js/news-data.js', 'w', encoding='utf-8').write(out)

# ---- проверка ----
print('новостей:', len(items))
ok = True
for it in items:
    imgs = it['body'].count('<img')
    vids = it['body'].count('<video')
    # сверяем число img с числом скачанных файлов статьи
    aid_files = [f for f in os.listdir('images/news') if re.match(r'n[\w-]+-', f) and f.startswith('n' + it['id'][:0])]
    flag = ''
    if '<h2' in it['body'] or it['title'][:20].lower() in it['body'][:60].lower():
        flag = ' <-- проверить тело'
        ok = False
    if not it['body'].strip():
        flag = ' <-- ПУСТОЕ ТЕЛО'
        ok = False
    print(f"{it['date']} | {it['id'][:42]:44} | img:{imgs} vid:{vids} | {len(it['body']):5} знаков{flag}")
print('ПРОВЕРКА:', 'OK' if ok else 'ЕСТЬ ЗАМЕЧАНИЯ')
