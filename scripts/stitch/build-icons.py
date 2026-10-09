#!/usr/bin/env python3
"""Genera el subset autoalojado de Material Symbols Outlined (iconos usados por Stitch + extras de la app).
Uso: build-icons.py <stitch_dir> <out.woff2>
"""
import glob, re, subprocess, sys, urllib.parse

EXTRA = {"dark_mode", "desktop_windows", "menu", "logout", "manage_accounts", "account_circle", "mark_email_read",
         "visibility_off", "error", "warning", "link", "content_copy", "person_add", "password", "shield_lock",
         "devices", "lock_person", "cookie", "edit", "delete", "block", "help", "open_in_full"}
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
names = set()
for f in glob.glob(sys.argv[1] + "/w*/code.html"):
    names |= set(re.findall(r"material-symbols-outlined[^>]*>\s*([a-z_0-9]+)\s*<", open(f).read()))
names -= {"360", "brand_family"}
names |= EXTRA
q = ",".join(sorted(names))
css = subprocess.run(["curl", "-s", "-A", UA, f"https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0&icon_names={q}&display=block"], capture_output=True, text=True).stdout
url = re.search(r"url\(([^)]+)\)", css).group(1)
subprocess.run(["curl", "-s", "-A", UA, "-o", sys.argv[2], url], check=True)
print(len(names), "iconos ->", sys.argv[2])
