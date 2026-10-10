"""Genera a-fondo.html a partir de fondo/ y enlaza index.html con los temas a fondo.

Uso: python tools/build_fondo.py   (desde la raíz del repo)

- fondo/temas.json: orden, títulos, taglines y qué fichas del resumen enlazan a cada tema.
- fondo/temas/NN-*.html: cuerpo de cada tema (sin <section>, sin <h2>; los pone este script).
- fondo/layout.html: plantilla con {{NAV}}, {{SELECT}}, {{SECTIONS}}.
Un tema cuyo archivo no existe todavía se omite, así la página crece batch a batch.
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FONDO = ROOT / "fondo"


def main():
    cfg = json.loads((FONDO / "temas.json").read_text(encoding="utf-8"))
    nav, select, sections, links = [], [], [], {}
    n = 0
    for g in cfg["grupos"]:
        temas = [t for t in g["temas"] if (FONDO / "temas" / t["file"]).exists()]
        if not temas:
            continue
        nav.append(f'<h3>{html.escape(g["nombre"])}</h3><ul>')
        select.append(f'<optgroup label="{html.escape(g["nombre"])}">')
        for t in temas:
            n += 1
            tid, tit = t["id"], html.escape(t["titulo"])
            nav.append(f'<li><a href="#{tid}" data-id="{tid}"><span>{tit}</span><span class="grp-n">{n:02d}</span></a></li>')
            select.append(f'<option value="{tid}">{tit}</option>')
            body = (FONDO / "temas" / t["file"]).read_text(encoding="utf-8").strip()
            back = "".join(
                f'<a class="back" href="index.html#{r}">← Ficha resumen: {html.escape(r)}</a> ' for r in t["resumen"]
            )
            sections.append(
                f'<section class="algo deep" id="{tid}">\n'
                f'<header><h2>{tit}</h2><p class="tagline">{html.escape(t["tagline"])}</p></header>\n'
                f"{body}\n{back}\n</section>"
            )
            for r in t["resumen"]:
                links[r] = tid
        nav.append("</ul>")
        select.append("</optgroup>")

    page = (FONDO / "layout.html").read_text(encoding="utf-8")
    page = page.replace("{{NAV}}", "\n".join(nav)).replace("{{SELECT}}", "".join(select))
    page = page.replace("{{SECTIONS}}", "\n".join(sections))
    (ROOT / "a-fondo.html").write_text(page, encoding="utf-8", newline="\n")

    # index.html: un enlace "A fondo →" en la fila de repaso de cada ficha con tema profundo (idempotente)
    idx_path = ROOT / "index.html"
    idx = idx_path.read_text(encoding="utf-8")
    idx = re.sub(r'<a class="see-deep"[^>]*>[^<]*</a>', "", idx)

    def add(m):
        rid = m.group(1)
        if rid not in links:
            return m.group(0)
        return m.group(0) + f'<a class="see-deep" href="a-fondo.html#{links[rid]}">A fondo →</a>'

    idx = re.sub(r'<button class="btn done-btn" type="button" data-id="([a-z]+)"[^>]*>[^<]*</button><span class="done-when"></span>', add, idx)
    idx_path.write_text(idx, encoding="utf-8", newline="\n")
    print(f"a-fondo.html: {n} temas. index.html: {len(links)} fichas enlazadas.")


if __name__ == "__main__":
    main()
