#!/usr/bin/env python3
"""Remove comentários de arquivos de código.

Uso:
  python remove_comments.py CAMINHO            # simulação (nada é alterado)
  python remove_comments.py CAMINHO --write    # aplica as alterações
  python remove_comments.py CAMINHO --write --backup   # cria .bak antes

CAMINHO pode ser um arquivo ou uma pasta (busca recursiva).
"""
import argparse
import io
import re
import tokenize
from pathlib import Path

C_STYLE = {".js", ".jsx", ".ts", ".tsx", ".java", ".c", ".h", ".cpp", ".hpp",
           ".cs", ".go", ".kt", ".swift", ".rs", ".dart", ".scala"}
CSS_EXT = {".css", ".scss"}
IGNORE_DIRS = {".git", "node_modules", "venv", ".venv", "__pycache__", "dist",
               "build", ".idea", ".vscode", "target", "bin", "obj"}


def eol(line):
    return line[len(line.rstrip("\r\n")):]


def strip_python(src):
    """Usa o tokenizer do Python: só remove comentários reais (não strings)."""
    lines = src.splitlines(keepends=True)
    cuts = {}
    try:
        for tok in tokenize.generate_tokens(io.StringIO(src).readline):
            if tok.type == tokenize.COMMENT:
                row, col = tok.start
                if row <= 2 and (tok.string.startswith("#!") or "coding" in tok.string):
                    continue  # preserva shebang e declaração de encoding
                cuts[row - 1] = col
    except (tokenize.TokenError, IndentationError, SyntaxError):
        return None
    out = []
    for i, line in enumerate(lines):
        if i in cuts:
            kept = line[:cuts[i]].rstrip()
            if not kept:
                continue  # linha só tinha comentário
            line = kept + eol(line)
        out.append(line)
    return "".join(out)


def strip_dockerfile(src):
    """Remove linhas que são só comentário, preservando '# syntax=' e '# escape='."""
    out = []
    for line in src.splitlines(keepends=True):
        s = line.lstrip()
        if s.startswith("#") and not re.match(r"#\s*(syntax|escape)\s*=", s, re.I):
            continue
        out.append(line)
    return "".join(out)


def strip_c_style(src, line_comments=True, jsx=False):
    """Remove // e /* */ respeitando strings ("...", '...', `...`)."""
    out, i, n, state = [], 0, len(src), None
    while i < n:
        c = src[i]
        nx = src[i + 1] if i + 1 < n else ""
        if state is None:
            if line_comments and c == "/" and nx == "/":
                while i < n and src[i] not in "\r\n":
                    i += 1
                continue
            if c == "/" and nx == "*":
                end = src.find("*/", i + 2)
                end = n if end == -1 else end + 2
                newlines = "".join(ch for ch in src[i:end] if ch in "\r\n")
                out.append(newlines or " ")
                i = end
                continue
            if c in "\"'`":
                state = c
            out.append(c)
            i += 1
        else:
            if c == "\\":
                out.append(src[i:i + 2])
                i += 2
                continue
            if c == state or (c in "\r\n" and state != "`"):
                state = None
            out.append(c)
            i += 1
    new = "".join(out)

    # Remove linhas que ficaram vazias por causa de um comentário
    o, nl = src.splitlines(keepends=True), new.splitlines(keepends=True)
    if len(o) != len(nl):
        return new
    res = []
    for a, b in zip(o, nl):
        if a != b:
            kept = b.rstrip()
            if not kept or (jsx and re.sub(r"\s", "", kept) == "{}"):
                continue  # linha vazia (ou {} sobrando de {/* */} em JSX)
            b = kept + eol(b)
        res.append(b)
    return "".join(res)


def process(path):
    src = path.read_text(encoding="utf-8")
    if path.suffix == ".py":
        return src, strip_python(src)
    if path.name.lower().startswith("dockerfile"):
        return src, strip_dockerfile(src)
    if path.suffix in CSS_EXT:
        return src, strip_c_style(src, line_comments=(path.suffix == ".scss"))
    return src, strip_c_style(src, jsx=path.suffix in {".jsx", ".tsx"})


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("path")
    ap.add_argument("--write", action="store_true", help="grava as alterações")
    ap.add_argument("--backup", action="store_true", help="cria arquivo .bak")
    args = ap.parse_args()

    root = Path(args.path)
    files = [root] if root.is_file() else [
        p for p in root.rglob("*")
        if p.is_file() and (p.suffix == ".py" or p.suffix in C_STYLE or p.suffix in CSS_EXT
                            or p.name.lower().startswith("dockerfile"))
        and not (set(p.parts) & IGNORE_DIRS)
    ]

    changed = 0
    for f in files:
        try:
            old, new = process(f)
        except (UnicodeDecodeError, OSError) as e:
            print(f"[pulado] {f}: {e}")
            continue
        if new is None:
            print(f"[pulado] {f}: erro de sintaxe ao analisar")
            continue
        if new != old:
            changed += 1
            print(f"[{'alterado' if args.write else 'alteraria'}] {f}")
            if args.write:
                if args.backup:
                    f.with_name(f.name + ".bak").write_text(old, encoding="utf-8", newline="")
                f.write_text(new, encoding="utf-8", newline="")
    print(f"\n{changed} arquivo(s) {'alterado(s)' if args.write else 'seriam alterados (use --write)'}.")


if __name__ == "__main__":
    main()
