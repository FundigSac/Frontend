#!/usr/bin/env python3
"""Stitch code.html -> JSX converter (one-shot, regenerable).

Usage: convert.py <stitch_dir> <out_dir>
Reads every wNN_*/code.html, strips shared header/footer, converts the rest of <body>
into a React server component at <out_dir>/wNN.tsx and writes a JSON report.
Original Stitch files are never modified.
"""
import json
import re
import struct
import sys
from html.parser import HTMLParser
from pathlib import Path

VOID = {"img", "input", "br", "hr", "meta", "link", "source", "col", "area", "wbr"}
INLINE = {"span", "a", "strong", "em", "b", "i", "code", "small", "sup", "sub", "label", "button", "img", "select", "input"}
ATTR_MAP = {
    "class": "className", "for": "htmlFor", "tabindex": "tabIndex", "colspan": "colSpan",
    "rowspan": "rowSpan", "readonly": "readOnly", "maxlength": "maxLength", "minlength": "minLength",
    "autocomplete": "autoComplete", "autofocus": "autoFocus", "novalidate": "noValidate",
    "enctype": "encType", "srcset": "srcSet", "datetime": "dateTime", "crossorigin": "crossOrigin",
    "viewbox": "viewBox", "preserveaspectratio": "preserveAspectRatio", "inputmode": "inputMode",
    "contenteditable": "contentEditable", "spellcheck": "spellCheck",
}
SVG_TAGS = {"svg", "circle", "path", "g", "rect", "line", "polyline", "polygon", "ellipse", "defs", "stop"}
BOOL = {"required", "disabled", "multiple", "readonly", "checked", "selected"}

ROUTES = {
    "inicio": "/", "productos": "/productos", "valvulas": "/productos/valvulas",
    "tuberias-y-juntas": "/productos/tuberias", "tuberias": "/productos/tuberias",
    "marcos-y-tapas": "/productos/marcos-y-tapas", "conexiones": "/productos",
    "catalogo-completo": "/productos", "solicitar-cotizacion": "/cotizar", "contacto": "/contacto",
    "soluciones": "/soluciones", "nosotros": "/nosotros", "recursos": "/recursos",
    "libro-de-reclamaciones": "/reclamaciones", "politica-de-privacidad": "/privacidad",
    "terminos-b2b": "/terminos-b2b",
}


def camel_svg(k: str) -> str:
    if k.startswith(("aria-", "data-")):
        return k
    return re.sub(r"-([a-z])", lambda m: m.group(1).upper(), k)


class Node:
    def __init__(self, tag, attrs, parent=None):
        self.tag, self.attrs, self.parent, self.children = tag, attrs, parent, []


class Tree(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node("#root", {})
        self.cur = self.root
        self.skip = 0

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style"):
            self.skip += 1
            return
        if self.skip:
            return
        n = Node(tag, dict(attrs), self.cur)
        self.cur.children.append(n)
        if tag not in VOID:
            self.cur = n

    def handle_startendtag(self, tag, attrs):
        if self.skip or tag in ("script", "style"):
            return
        self.cur.children.append(Node(tag, dict(attrs), self.cur))

    def handle_endtag(self, tag):
        if tag in ("script", "style"):
            self.skip = max(0, self.skip - 1)
            return
        if self.skip or tag in VOID:
            return
        n = self.cur
        while n and n.tag != tag:
            n = n.parent
        if n and n.parent:
            self.cur = n.parent

    def handle_data(self, data):
        if not self.skip:
            self.cur.children.append(data)

    def handle_comment(self, data):
        if not self.skip:
            self.cur.children.append(("#comment", data))


def jpeg_size(path: Path):
    b = path.read_bytes()
    i = 2
    while i < len(b):
        if b[i] != 0xFF:
            i += 1
            continue
        m = b[i + 1]
        if m in (0xC0, 0xC1, 0xC2):
            h, w = struct.unpack(">HH", b[i + 5:i + 9])
            return w, h
        i += 2 + struct.unpack(">H", b[i + 2:i + 4])[0]
    return 1408, 768


class Ctx:
    def __init__(self, img_map, img_dir):
        self.img_map, self.img_dir = img_map, img_dir
        self.uses_image = self.uses_link = False
        self.missing_links, self.ext_images = [], []


def style_obj(s: str) -> str:
    items = []
    for part in [p for p in s.split(";") if p.strip()]:
        k, _, v = part.partition(":")
        k, v = k.strip(), v.strip()
        key = k if k.startswith("--") else re.sub(r"-([a-z])", lambda m: m.group(1).upper(), k)
        items.append(f'"{key}": {json.dumps(v)}')
    return "{{" + ", ".join(items) + "}}"


def jsx_text(t: str) -> str:
    return t.replace("{", "&#123;").replace("}", "&#125;").replace("<", "&lt;").replace(">", "&gt;")


FONT_SIZE_TOKEN = re.compile(r"^text-(headline-(hero|section|card)(-mobile)?|body-(default|compact)|button-text|ui-label|xs|sm|base|lg|xl|[2-9]xl|\[\d+(\.\d+)?(px|rem)\])$")


def fix_classes(c: str) -> str:
    """Tailwind v3 (CDN de Stitch) ordena utilidades del mismo plugin alfabéticamente: gana la última.
    Tailwind v4 no; para igualar el render dejamos sólo la utilidad de tamaño ganadora por variante."""
    toks = c.split()
    groups = {}
    for t in toks:
        variant, _, base = t.rpartition(":")
        if FONT_SIZE_TOKEN.match(base):
            groups.setdefault(variant, []).append(t)
    drop = set()
    for variant, items in groups.items():
        if len(items) > 1:
            keep = max(items, key=lambda x: x.rpartition(":")[2])
            drop |= {t for t in items if t != keep}
    return " ".join(t for t in toks if t not in drop)


def attr_str(n: Node, ctx: Ctx) -> str:
    out = []
    svg = n.tag in SVG_TAGS
    for k, v in n.attrs.items():
        if k in ("data-path", "data-alt", "data-active-classes", "xmlns:xlink") or k.startswith("on"):
            continue
        if n.tag == "a" and k == "href" and n.attrs.get("data-path") in ROUTES:
            continue
        if n.tag == "img" and k in ("src", "alt", "width", "height"):
            continue
        key = ATTR_MAP.get(k, camel_svg(k) if svg else k)
        if n.tag in ("input", "textarea", "select") and k == "value":
            key = "defaultValue"
        if n.tag == "input" and k == "checked":
            key = "defaultChecked"
        if k == "class":
            v = fix_classes(v)
        if k == "style":
            out.append(f"style={style_obj(v)}")
        elif v is None or (k in BOOL and v in ("", k)):
            out.append(key)
        else:
            if any(ch in v for ch in '"\\\n{}'):
                out.append(f"{key}={{{json.dumps(v, ensure_ascii=False)}}}")
            else:
                out.append(f"{key}=\"{v}\"")
    return (" " + " ".join(out)) if out else ""


def has_layout_parent(n: Node) -> bool:
    c = (n.attrs.get("class") or "") if n else ""
    return bool(re.search(r"(^|\s)(flex|grid|inline-flex)(\s|$)", c)) or (n and n.tag in ("ul", "ol", "table", "thead", "tbody", "tr", "select", "form") and False)


def render(n, ctx: Ctx, depth=0) -> str:
    pad = "  " * depth
    if isinstance(n, tuple):
        c = n[1].strip()
        return f"{pad}{{/* {c} */}}\n" if c and "*/" not in c else ""
    if isinstance(n, str):
        return ""
    tag = n.tag
    if tag == "img":
        ctx.uses_image = True
        src = n.attrs.get("src", "")
        alt = n.attrs.get("alt") or n.attrs.get("data-alt") or ""
        local = ctx.img_map.get(src)
        if not local:
            ctx.ext_images.append(src)
            local = src
            w, h = 1408, 768
        else:
            w, h = jpeg_size(ctx.img_dir / Path(local).name)
        rest = attr_str(n, ctx)
        return f'{pad}<Image src="{local}" alt={json.dumps(alt, ensure_ascii=False)} width={{{w}}} height={{{h}}} sizes="(min-width: 1024px) 50vw, 100vw"{rest} />\n'
    if tag == "a" and n.attrs.get("data-path") in ROUTES:
        ctx.uses_link = True
        tag_out, href = "Link", f' href="{ROUTES[n.attrs["data-path"]]}"'
    else:
        tag_out, href = tag, ""
        if tag == "a" and n.attrs.get("data-path"):
            ctx.missing_links.append(n.attrs["data-path"])
    aria = ""
    if tag == "span" and "material-symbols-outlined" in (n.attrs.get("class") or "") and "aria-hidden" not in n.attrs:
        aria = ' aria-hidden="true"'
    attrs = attr_str(n, ctx)
    if tag in VOID:
        return f"{pad}<{tag_out}{href}{attrs}{aria} />\n"
    kids = []
    kids_list = n.children
    layout = has_layout_parent(n)
    for idx, ch in enumerate(kids_list):
        if isinstance(ch, str):
            txt = re.sub(r"\s+", " ", ch)
            if not txt.strip():
                prev_n = kids_list[idx - 1] if idx > 0 else None
                next_n = kids_list[idx + 1] if idx < len(kids_list) - 1 else None
                inl = lambda x: isinstance(x, Node) and x.tag in INLINE
                if txt and not layout and inl(prev_n) and inl(next_n):
                    kids.append(f'{pad}  {{" "}}\n')
                continue
            lead = txt.startswith(" ") and idx > 0 and not layout
            trail = txt.endswith(" ") and idx < len(kids_list) - 1 and not layout
            body = jsx_text(txt.strip())
            piece = ""
            if lead:
                piece += '{" "}'
            piece += body
            if trail:
                piece += '{" "}'
            kids.append(f"{pad}  {piece}\n")
        else:
            kids.append(render(ch, ctx, depth + 1))
    inner = "".join(kids)
    if not inner.strip():
        return f"{pad}<{tag_out}{href}{attrs}{aria}></{tag_out}>\n" if tag_out not in ("div", "span") else f"{pad}<{tag_out}{href}{attrs}{aria} />\n"
    return f"{pad}<{tag_out}{href}{attrs}{aria}>\n{inner}{pad}</{tag_out}>\n"


def slug_name(text: str) -> str:
    import unicodedata
    t = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    t = re.sub(r"\(.*?\)", " ", t).replace("*", " ")
    words = re.findall(r"[A-Za-z0-9]+", t)[:4]
    return "".join(w.capitalize() if i else w.lower() for i, w in enumerate(words)) or "campo"


def assign_names(root):
    """Campos de formulario sin name/id reciben un name estable derivado de su etiqueta."""
    def text_of(n):
        return "".join(c if isinstance(c, str) else text_of(c) for c in n.children if not isinstance(c, tuple))

    def walk(n, state):
        for c in n.children:
            if not isinstance(c, Node):
                continue
            if c.tag == "form":
                state = {"label": "", "used": set()}
            if c.tag == "label" and state:
                state["label"] = text_of(c).strip()
            if state is not None and c.tag in ("input", "textarea", "select") and c.attrs.get("type") not in ("submit", "button"):
                if not c.attrs.get("name"):
                    base = c.attrs.get("id") or slug_name(state["label"])
                    name, i = base, 2
                    while name in state["used"]:
                        name, i = f"{base}{i}", i + 1
                    c.attrs["name"] = name
                state["used"].add(c.attrs["name"])
            walk(c, state)
    walk(root, None)


def find(n, tag):
    for c in n.children:
        if isinstance(c, Node):
            if c.tag == tag:
                return c
            r = find(c, tag)
            if r:
                return r
    return None


def main():
    stitch, out = Path(sys.argv[1]), Path(sys.argv[2])
    out.mkdir(parents=True, exist_ok=True)
    img_dir = Path(sys.argv[3])
    import hashlib
    img_map = {}
    for tsv in (Path(sys.argv[4]).read_text().splitlines() if len(sys.argv) > 4 else []):
        h, u, _ = tsv.split("\t")
        img_map[u] = f"/images/stitch/{h}.jpg"
    report = {}
    for d in sorted(stitch.glob("w[0-9][0-9]_*")):
        wid = d.name[:3]
        t = Tree()
        t.feed((d / "code.html").read_text())
        body = find(t.root, "body")
        assign_names(body)
        ctx = Ctx(img_map, img_dir)
        parts, dropped = [], []
        for ch in body.children:
            if isinstance(ch, Node):
                if ch.tag in ("header", "footer"):
                    dropped.append(ch.tag)
                    continue
                parts.append(render(ch, ctx, 2))
        imports = []
        if ctx.uses_image:
            imports.append('import Image from "next/image";')
        if ctx.uses_link:
            imports.append('import Link from "next/link";')
        src = "\n".join(imports) + f"\n\nexport function Screen{wid.upper()}() {{\n  return (\n    <>\n{''.join(parts)}    </>\n  );\n}}\n"
        (out / f"{wid}.tsx").write_text(src)
        title = find(find(t.root, "html"), "title")
        report[wid] = {
            "dir": d.name, "dropped": dropped, "missing_links": sorted(set(ctx.missing_links)),
            "external_images": ctx.ext_images, "lines": src.count("\n"),
            "title": "".join(c for c in (title.children if title else []) if isinstance(c, str)),
        }
    (out / "_report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2))
    print(json.dumps({k: (v["dropped"], v["missing_links"], len(v["external_images"]), v["lines"]) for k, v in report.items()}, ensure_ascii=False))


if __name__ == "__main__":
    main()
