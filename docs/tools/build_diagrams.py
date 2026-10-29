"""
Gera os diagramas do projeto em SVG, com tipografia pensada para impressão (A4).
Executar: python docs/tools/build_diagrams.py
"""
from __future__ import annotations

from pathlib import Path
from html import escape

OUT = Path(__file__).resolve().parents[1] / "diagrams"
OUT.mkdir(parents=True, exist_ok=True)

INK = "#2a201a"
MUTED = "#5b4a40"
TERRA = "#b5451b"
TERRA_DARK = "#8e3413"
TERRA_SOFT = "#f7e3d8"
CREAM = "#fff8f0"
CREAM_DEEP = "#f6e9da"
GREEN = "#2f5d3a"
GREEN_DARK = "#23452c"
GREEN_SOFT = "#e2ede3"
MUSTARD = "#e0a03a"
MUSTARD_SOFT = "#fbefd8"
BLUE = "#2c567a"
BLUE_SOFT = "#e5eef7"
LINE = "#d9c6b2"
FONT = "Segoe UI, Arial, sans-serif"


def svg_open(w: int, h: int) -> list[str]:
    return [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" '
        f'font-family="{FONT}">',
        "<defs>",
        *[
            f'<marker id="ar-{name}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" '
            f'orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="{color}"/></marker>'
            for name, color in [
                ("ink", MUTED),
                ("terra", TERRA),
                ("green", GREEN),
                ("blue", BLUE),
                ("mut", "#9a8a7e"),
            ]
        ],
        "</defs>",
        f'<rect width="{w}" height="{h}" fill="#ffffff"/>',
    ]


def svg_close(lines: list[str]) -> str:
    return "\n".join([*lines, "</svg>"])


def text(
    x: float,
    y: float,
    content: str | list[str],
    size: int = 20,
    weight: str = "normal",
    fill: str = INK,
    anchor: str = "middle",
    line_height: float = 1.22,
) -> list[str]:
    rows = content.split("\n") if isinstance(content, str) else content
    total = len(rows)
    start = y - (total - 1) * size * line_height / 2
    out = [
        f'<text x="{x}" y="{start:.1f}" font-size="{size}" font-weight="{weight}" fill="{fill}" '
        f'text-anchor="{anchor}">'
    ]
    for i, row in enumerate(rows):
        dy = 0 if i == 0 else size * line_height
        out.append(f'<tspan x="{x}" dy="{dy:.1f}">{escape(row)}</tspan>')
    out.append("</text>")
    return out


def rect(
    x: float,
    y: float,
    w: float,
    h: float,
    fill: str = CREAM,
    stroke: str = LINE,
    rx: float = 12,
    sw: float = 1.5,
    dash: str | None = None,
) -> str:
    extra = f' stroke-dasharray="{dash}"' if dash else ""
    return (
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" '
        f'stroke="{stroke}" stroke-width="{sw}"{extra}/>'
    )


def box(
    x: float,
    y: float,
    w: float,
    h: float,
    content: str | list[str],
    sub: str | list[str] | None = None,
    fill: str = CREAM,
    stroke: str = TERRA,
    size: int = 20,
    sub_size: int = 16,
    sub_fill: str = MUTED,
    bold: bool = True,
    rx: float = 12,
) -> list[str]:
    out = [rect(x, y, w, h, fill=fill, stroke=stroke, rx=rx)]
    if sub:
        out.extend(text(x + w / 2, y + h * 0.38, content, size=size, weight="bold" if bold else "normal"))
        out.extend(text(x + w / 2, y + h * 0.72, sub, size=sub_size, fill=sub_fill))
    else:
        out.extend(text(x + w / 2, y + h / 2, content, size=size, weight="bold" if bold else "normal"))
    return out


def ellipse_uc(cx: float, cy: float, rx: float, ry: float, content: str | list[str], size: int = 21) -> list[str]:
    out = [
        f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="{CREAM}" stroke="{TERRA}" stroke-width="1.6"/>'
    ]
    out.extend(text(cx, cy, content, size=size))
    return out


def actor(x: float, y: float, label: str | list[str], size: int = 20) -> list[str]:
    out = [
        f'<circle cx="{x}" cy="{y - 52}" r="13" fill="{GREEN}" stroke="{GREEN_DARK}" stroke-width="1.5"/>',
        f'<line x1="{x}" y1="{y - 39}" x2="{x}" y2="{y - 8}" stroke="{GREEN}" stroke-width="4" stroke-linecap="round"/>',
        f'<line x1="{x - 20}" y1="{y - 30}" x2="{x + 20}" y2="{y - 30}" stroke="{GREEN}" stroke-width="4" stroke-linecap="round"/>',
        f'<line x1="{x}" y1="{y - 8}" x2="{x - 16}" y2="{y + 18}" stroke="{GREEN}" stroke-width="4" stroke-linecap="round"/>',
        f'<line x1="{x}" y1="{y - 8}" x2="{x + 16}" y2="{y + 18}" stroke="{GREEN}" stroke-width="4" stroke-linecap="round"/>',
    ]
    out.extend(text(x, y + 44, label, size=size, weight="bold", fill=GREEN_DARK))
    return out


def label(
    x: float,
    y: float,
    content: str,
    size: int = 15,
    fill: str = MUTED,
    anchor: str = "middle",
    bg: bool = True,
) -> list[str]:
    lines = [t for t in content.split("\n")]
    width = max(len(t) for t in lines) * size * 0.52 + 10
    height = size * 1.3 * len(lines) + 6
    out: list[str] = []
    if bg:
        if anchor == "middle":
            out.append(rect(x - width / 2, y - height / 2, width, height, fill="#ffffff", stroke="none", rx=4))
        elif anchor == "start":
            out.append(rect(x - 4, y - height / 2, width, height, fill="#ffffff", stroke="none", rx=4))
        else:
            out.append(rect(x - width + 4, y - height / 2, width, height, fill="#ffffff", stroke="none", rx=4))
    out.extend(text(x, y, lines, size=size, fill=fill, anchor=anchor))
    return out


def arrow(
    x1: float,
    y1: float,
    x2: float,
    y2: float,
    color: str = MUTED,
    dashed: bool = False,
    both: bool = False,
    marker: str = "ink",
    width: float = 1.8,
) -> str:
    dash = ' stroke-dasharray="7 5"' if dashed else ""
    start = f' marker-start="url(#ar-{marker})"' if both else ""
    return (
        f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="{width}"{dash}'
        f' marker-end="url(#ar-{marker})"{start}/>'
    )


def path_arrow(d: str, color: str = MUTED, dashed: bool = False, marker: str = "ink", width: float = 1.8) -> str:
    dash = ' stroke-dasharray="7 5"' if dashed else ""
    return (
        f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{width}"{dash} marker-end="url(#ar-{marker})"/>'
    )


# ---------------------------------------------------------------------------
# 1. Casos de uso
# ---------------------------------------------------------------------------
def casos_de_uso() -> str:
    W, H = 1240, 940
    g = svg_open(W, H)
    g.append(rect(290, 56, 680, 650, fill="#fdfaf6", stroke=LINE, rx=18, sw=1.5))
    g.extend(text(630, 86, "Sistema Raízes do Nordeste", size=21, weight="bold", fill=TERRA_DARK))

    cliente = [
        (140, ["Consultar cardápio", "por unidade"]),
        (225, ["Cadastrar-se e", "autenticar"]),
        (310, ["Montar pedido e", "escolher retirada"]),
        (395, ["Acompanhar status", "do pedido"]),
        (480, ["Resgatar recompensa"]),
        (565, ["Gerenciar consentimento", "e dados pessoais"]),
        (650, ["Realizar pagamento"]),
    ]
    for cy, _ in cliente:
        g.append(arrow(140, 395, 320, cy, color=MUTED, marker="ink", width=1.4))
    for cy, label_txt in cliente:
        g.extend(ellipse_uc(470, cy, 148, 35, label_txt, size=20))

    staff = [
        (195, ["Consultar fila", "da unidade"]),
        (305, ["Avançar status e", "confirmar retirada"]),
        (415, ["Cancelar pedido"]),
        (525, ["Acompanhar indicadores", "da unidade"]),
    ]
    for ax, ay, targets in [
        (1125, 195, [195, 305, 415]),
        (1125, 405, [195, 305]),
        (1125, 600, [195, 305, 415, 525]),
    ]:
        for cy in targets:
            g.append(arrow(ax, ay, 963, cy, color=MUTED, marker="ink", width=1.4))
    for cy, label_txt in staff:
        g.extend(ellipse_uc(831, cy, 134, 35, label_txt, size=18))

    g.extend(actor(105, 395, "Cliente"))
    g.append(
        f'<line x1="124" y1="770" x2="322" y2="672" stroke="{BLUE}" stroke-width="1.6" '
        'stroke-dasharray="7 5"/>'
    )
    g.extend(text(215, 730, "conceitual", size=13, fill=BLUE))
    g.extend(actor(105, 780, ["Sistemas de Pagamento", "Externos*"], size=14))
    g.extend(actor(1155, 195, "Atendente", size=19))
    g.extend(actor(1155, 405, "Cozinha", size=19))
    g.extend(actor(1155, 600, ["Gerente /", "Administrador"], size=19))

    g.extend(
        text(
            620,
            912,
            "*Ator conceitual previsto no enunciado; o protótipo usa simulador local, sem integração real.",
            size=14,
            fill="#7d6c61",
        )
    )
    return svg_close(g)


# ---------------------------------------------------------------------------
# 2. Jornada do usuário (mapa de jornada)
# ---------------------------------------------------------------------------
def jornada() -> str:
    W, H = 1632, 940
    g = svg_open(W, H)
    g.extend(text(40, 38, "Jornada do cliente — do primeiro contato à retirada", size=24, weight="bold", fill=INK, anchor="start"))

    stages = [
        ("1", "Descoberta", "Web, app ou totem"),
        ("2", "Unidade e cardápio", "Escolha e exploração"),
        ("3", "Montagem", "Produto e adicionais"),
        ("4", "Checkout", "Dados e aviso de privacidade"),
        ("5", "Pagamento", "Simulador local"),
        ("6", "Preparo e retirada", "Operação da unidade"),
    ]
    col_w, gap, x0, y0 = 232, 24, 60, 66
    xs = [x0 + i * (col_w + gap) for i in range(6)]

    for i, (num, title, sub) in enumerate(stages):
        x = xs[i]
        fill = GREEN if i == 5 else (TERRA_SOFT if i in (3, 4) else CREAM)
        stroke = GREEN if i == 5 else TERRA
        g.append(rect(x, y0, col_w, 78, fill=fill, stroke=stroke, rx=12))
        g.extend(text(x + 20, y0 + 30, num, size=22, weight="bold", fill=CREAM if i == 5 else TERRA))
        g.extend(text(x + 44, y0 + 28, title, size=19, weight="bold", fill=CREAM if i == 5 else INK, anchor="start"))
        g.extend(text(x + 44, y0 + 56, sub, size=14, fill="#d7e6d9" if i == 5 else MUTED, anchor="start"))
        if i < 5:
            g.append(arrow(x + col_w + 2, y0 + 39, x + col_w + gap - 2, y0 + 39, color=TERRA, marker="terra", width=2))

    rows = [
        (176, "AÇÕES DO CLIENTE", [
            ["Acessa o canal e", "reconhece a marca"],
            ["Seleciona a unidade", "mais próxima"],
            ["Escolhe itens e", "personaliza"],
            ["Informa dados e", "consulta a privacidade"],
            ["Escolhe Pix ou", "cartão e confirma"],
            ["Acompanha e retira", "com o código"],
        ], CREAM, TERRA),
        (356, "DECISÕES", [
            ["Qual canal usar?", "Web, app ou totem"],
            ["Unidade aberta?", "horário e endereço"],
            ["Precisa de", "adicional?"],
            ["Quais dados são", "usados no pedido?"],
            ["Pagamento", "aprovado?"],
            ["Retirada no", "prazo?"],
        ], MUSTARD_SOFT, MUSTARD),
        (536, "ESTADOS DO SISTEMA", [
            ["Sem estado de", "pedido"],
            ["Unidade", "selecionada"],
            ["CARRINHO", "em edição"],
            ["AGUARDANDO", "PAGAMENTO"],
            ["RECEBIDO →", "EM_PREPARO"],
            ["PRONTO →", "RETIRADO"],
        ], GREEN_SOFT, GREEN),
        (716, "INTEGRAÇÕES", [
            ["Nenhuma"],
            ["Catálogo mock", "por unidade"],
            ["Cálculo de", "preços e cupons"],
            ["Aviso de privacidade", "e escolhas opcionais"],
            ["Simulação local", "sem gateway real"],
            ["Fila da cozinha", "e pontos"],
        ], BLUE_SOFT, BLUE),
    ]

    for y, title, cells, fill, stroke in rows:
        g.append(rect(40, y, 1552, 150, fill="#fffdfa", stroke=LINE, rx=14))
        g.extend(text(56, y + 20, title, size=13, weight="bold", fill=stroke, anchor="start"))
        for i, cell in enumerate(cells):
            x = xs[i]
            g.append(rect(x, y + 32, col_w, 104, fill=fill, stroke=stroke, rx=10, sw=1.2))
            g.extend(text(x + col_w / 2, y + 84, cell, size=17, fill=INK))

    g.append(arrow(40, 898, 1592, 898, color=TERRA, width=2, marker="terra"))
    g.extend(text(44, 924, "Primeiro contato", size=14, fill=MUTED, anchor="start"))
    g.extend(text(1588, 924, "Pós-venda e fidelidade", size=14, fill=MUTED, anchor="end"))
    return svg_close(g)


# ---------------------------------------------------------------------------
# 3. Sequência de pagamento
# ---------------------------------------------------------------------------
def pagamento() -> str:
    W, H = 1440, 960
    g = svg_open(W, H)
    g.extend(text(40, 36, "Pagamento demonstrativo — simulação local e integração conceitual", size=24, weight="bold", anchor="start"))

    parts = [
        (170, ["Cliente"]),
        (520, ["Interface", "(Web/App/Totem)"]),
        (900, ["localStorage", "(local)"]),
        (1260, ["PaymentSimulator", "(local)"]),
    ]
    for x, name in parts:
        g.append(rect(x - 120, 70, 240, 72, fill=GREEN_SOFT, stroke=GREEN, rx=10))
        g.extend(text(x, 96, name, size=17, weight="bold", fill=GREEN_DARK))
        g.append(f'<line x1="{x}" y1="142" x2="{x}" y2="820" stroke="{LINE}" stroke-width="1.6" stroke-dasharray="6 5"/>')

    msgs = [
        (170, 520, "Confirma pedido e escolhe Pix ou cartão", 200, False),
        (520, 900, "Salva pedido AGUARDANDO_PAGAMENTO", 280, False),
        (900, 520, "Pedido salvo + código", 360, True),
        (520, 1260, "Inicia simulação local", 440, False),
        (1260, 520, "Retorna aprovação, recusa ou timeout", 520, True),
        (520, 900, "Atualiza o estado do pedido", 600, False),
        (900, 520, "Estado salvo localmente", 680, True),
        (520, 170, "Exibe resultado + código de retirada", 740, True),
    ]
    for x1, x2, txt, y, dashed in msgs:
        g.append(arrow(x1, y, x2, y, color=BLUE if dashed else MUTED, dashed=dashed, marker="blue" if dashed else "ink", width=1.8))
        g.extend(label((x1 + x2) / 2, y - 16, txt, size=14, fill=BLUE if dashed else MUTED, bg=False))

    g.append(rect(40, 790, 1360, 130, fill="#fdfaf6", stroke=LINE, rx=12))
    g.extend(text(60, 820, "Fluxos alternativos", size=16, weight="bold", fill=TERRA, anchor="start"))
    g.extend(text(60, 848, "Recusa (ex.: cartão final 0000): resultado RECUSADO → status PAGAMENTO_RECUSADO → oferta de nova tentativa.", size=14, anchor="start"))
    g.extend(text(60, 874, "Timeout: interface mantém AGUARDANDO_PAGAMENTO e permite consultar o pedido.", size=14, anchor="start"))
    g.extend(text(60, 900, "Aprovação: confirma o pedido, credita pontos (R$ 1 = 1 ponto) e libera o acompanhamento e a fila da cozinha.", size=14, anchor="start"))
    g.extend(
        text(
            60,
            916,
            "Integração conceitual futura: interface → backend → sistema externo; aprovação, recusa ou timeout retornariam ao pedido.",
            size=12,
            fill="#7d6c61",
            anchor="start",
        )
    )
    return svg_close(g)


# ---------------------------------------------------------------------------
# 4. Máquina de estados do pedido
# ---------------------------------------------------------------------------
def estados() -> str:
    W, H = 1600, 760
    g = svg_open(W, H)
    g.extend(text(40, 40, "Estados do pedido e transições permitidas", size=24, weight="bold", anchor="start"))

    top = [
        (170, 250, "AGUARDANDO\nPAGAMENTO", MUSTARD_SOFT, MUSTARD),
        (490, 230, "RECEBIDO", GREEN_SOFT, GREEN),
        (790, 230, "EM_PREPARO", GREEN_SOFT, GREEN),
        (1090, 230, "PRONTO", GREEN_SOFT, GREEN),
        (1390, 180, "RETIRADO", "#d7e6d9", GREEN_DARK),
    ]
    y1, h1 = 110, 82
    for x, w, lbl, fill, stroke in top:
        g.append(rect(x, y1, w, h1, fill=fill, stroke=stroke, rx=14, sw=1.8))
        g.extend(text(x + w / 2, y1 + h1 / 2, lbl, size=17, weight="bold"))

    # fluxo principal
    for x_from, x_to, lbl in [
        (420, 488, "aprovado"),
        (720, 788, "inicia preparo"),
        (1020, 1088, "conclui"),
        (1320, 1388, "retirada"),
    ]:
        g.append(arrow(x_from, 151, x_to, 151, color=GREEN, marker="green", width=2))
        g.extend(text((x_from + x_to) / 2, 100, lbl, size=13, fill=GREEN))

    # recusa e nova tentativa
    g.append(rect(170, 310, 250, 78, fill="#f7dfda", stroke="#a92f24", rx=14, sw=1.8))
    g.extend(text(295, 349, "PAGAMENTO\nRECUSADO", size=17, weight="bold"))
    g.append(arrow(295, 192, 295, 308, color="#a92f24", marker="ink", width=1.8))
    g.extend(label(322, 252, "recusa", size=13, fill="#a92f24", bg=False))

    g.append(path_arrow("M 380 308 C 380 270, 380 230, 380 196", color=MUSTARD, marker="ink", dashed=True))
    g.extend(label(400, 252, "nova\ntentativa", size=13, fill=MUSTARD, anchor="start", bg=False))

    # cancelamento
    g.append(rect(790, 560, 250, 80, fill="#efe7e1", stroke="#7d6c61", rx=14, sw=1.8))
    g.extend(text(915, 600, "CANCELADO", size=17, weight="bold"))

    g.append(path_arrow("M 600 192 C 640 300, 760 500, 786 556", color="#7d6c61", marker="mut", dashed=True))
    g.append(path_arrow("M 905 192 C 895 300, 890 460, 900 556", color="#7d6c61", marker="mut", dashed=True))
    g.append(path_arrow("M 1205 192 C 1140 320, 1010 500, 968 556", color="#7d6c61", marker="mut", dashed=True))
    g.append(path_arrow("M 295 388 C 400 470, 620 555, 786 585", color="#7d6c61", marker="mut", dashed=True))

    # timeout: contorna pela esquerda e entra no CANCELADO
    g.append(path_arrow("M 170 138 L 90 138 L 90 600 L 786 600", color=MUSTARD, marker="ink", dashed=True))
    g.extend(label(104, 470, "timeout", size=13, fill=MUSTARD, anchor="start", bg=False))

    g.extend(
        text(
            915,
            700,
            "Cancelamento: ação do gerente (recebido, em preparo, pronto) ou timeout na criação do pedido.",
            size=14,
            fill="#7d6c61",
        )
    )
    return svg_close(g)


# ---------------------------------------------------------------------------
# 5. Arquitetura
# ---------------------------------------------------------------------------
def arquitetura() -> str:
    W, H = 1440, 860
    g = svg_open(W, H)
    g.extend(text(40, 40, "Arquitetura da solução — SPA React com serviços simulados", size=24, weight="bold", anchor="start"))

    g.extend(text(40, 92, "CANAIS", size=13, weight="bold", fill=TERRA, anchor="start"))
    channels = [("Web responsivo", "navegador"), ("App simulado", "moldura mobile"), ("Totem", "modo quiosque")]
    for i, (name, sub) in enumerate(channels):
        x = 40 + i * 310
        g.extend(box(x, 108, 280, 82, name, sub, fill=TERRA_SOFT, stroke=TERRA, size=19, sub_size=15))
        g.append(arrow(x + 140, 192, x + 140, 250, color=TERRA, marker="terra", width=2))

    g.append(rect(40, 254, 1360, 130, fill="#fdfaf6", stroke=LINE, rx=16))
    g.extend(text(720, 292, "Aplicação React 18 + TypeScript + Vite", size=22, weight="bold", fill=TERRA_DARK))
    g.extend(text(720, 324, "React Router · componentes próprios · CSS mobile-first · build estático", size=16, fill=MUTED))
    g.extend(text(720, 352, "Sem backend: estado e persistência simulados no dispositivo", size=16, fill=MUTED))

    blocks = [
        ("React Router", ["rotas públicas,", "protegidas e quiosque"], 40, 434, TERRA_SOFT, TERRA),
        ("Páginas e componentes", ["cardápio, carrinho,", "checkout, operação, totem"], 380, 434, CREAM, TERRA),
        ("AppContext", ["carrinho, pedidos, sessão,", "pontos, LGPD e papéis"], 720, 434, GREEN_SOFT, GREEN),
        ("Regras de domínio", ["preços, cupons, pontos,", "status e permissões"], 1060, 434, MUSTARD_SOFT, MUSTARD),
    ]
    for title, sub, x, y, fill, stroke in blocks:
        g.extend(box(x, y, 300, 105, title, sub, fill=fill, stroke=stroke, size=18, sub_size=14))

    g.append(arrow(190, 384, 190, 432, color=TERRA, marker="terra", width=1.6))
    g.append(arrow(530, 384, 530, 432, color=TERRA, marker="terra", width=1.6))
    g.append(arrow(870, 384, 870, 432, color=GREEN, marker="green", width=1.6))
    g.append(arrow(1022, 486, 1058, 486, color=MUSTARD, marker="ink", width=1.6))

    g.extend(box(700, 620, 300, 85, "localStorage", ["dados mockados por", "dispositivo"], fill=GREEN_SOFT, stroke=GREEN, size=18, sub_size=14))
    g.extend(box(1080, 620, 320, 85, "Serviços simulados", ["catálogo mockado e pagamento local"], fill=BLUE_SOFT, stroke=BLUE, size=17, sub_size=14))
    g.append(arrow(850, 541, 850, 618, color=GREEN, marker="green", both=True, width=1.6))
    g.extend(label(866, 582, "estado persistido", size=12, fill=GREEN_DARK, anchor="start", bg=False))
    g.append(arrow(1210, 541, 1210, 618, color=BLUE, marker="blue", both=True, width=1.6))

    g.extend(text(720, 790, "Em produção, AppContext e as regras de domínio seriam substituídos por chamadas autenticadas a uma API,", size=15, fill="#7d6c61"))
    g.extend(text(720, 816, "com validação de permissões no servidor e persistência em banco de dados.", size=15, fill="#7d6c61"))
    return svg_close(g)


# ---------------------------------------------------------------------------
# 6. LGPD
# ---------------------------------------------------------------------------
def lgpd() -> str:
    W, H = 1440, 660
    g = svg_open(W, H)
    g.extend(text(40, 40, "Consentimento e direitos do titular na interface", size=24, weight="bold", anchor="start"))

    steps = [
        ("1", "Primeiro acesso", ["banner de", "consentimento"], CREAM, TERRA),
        ("2", "Escolha granular", ["necessários, analytics", "e marketing"], MUSTARD_SOFT, MUSTARD),
        ("3", "Registro", ["versão 2026-1,", "data e escolhas"], GREEN_SOFT, GREEN),
        ("4", "Uso transparente", ["pedido, retirada", "e suporte"], CREAM, TERRA),
        ("5", "Direitos", ["exportar, revogar", "e excluir"], BLUE_SOFT, BLUE),
    ]
    for i, (num, title, sub, fill, stroke) in enumerate(steps):
        x = 40 + i * 284
        g.append(rect(x, 96, 252, 150, fill=fill, stroke=stroke, rx=14))
        g.append(f'<circle cx="{x + 34}" cy="130" r="18" fill="{stroke}"/>')
        g.extend(text(x + 34, 130, num, size=17, weight="bold", fill="#ffffff"))
        g.extend(text(x + 62, 132, title, size=19, weight="bold", anchor="start", fill=INK))
        g.extend(text(x + 20, 186, sub, size=15, fill=MUTED, anchor="start"))
        if i < 4:
            g.append(arrow(x + 254, 171, x + 282, 171, color=TERRA, marker="terra", width=2))

    g.append(rect(40, 296, 660, 300, fill="#fdfaf6", stroke=LINE, rx=14))
    g.extend(text(64, 330, "Controles implementados", size=19, weight="bold", fill=TERRA, anchor="start"))
    controls = [
        "Banner com aceitar todos, somente essenciais e preferências.",
        "Aviso de privacidade no checkout, sem checkbox obrigatório.",
        "Preferências opcionais salvas localmente, sem envio de eventos ou ofertas.",
        "Marketing e analytics desligados por padrão nas preferências.",
        "Exportação dos dados em JSON e exclusão com confirmação.",
        "Pedidos ficam no navegador; sem API ou gateway real configurado.",
    ]
    for i, item in enumerate(controls):
        g.append(f'<circle cx="72" cy="{364 + i * 38}" r="4" fill="{TERRA}"/>')
        g.extend(text(86, 364 + i * 38, item, size=15, anchor="start"))

    g.append(rect(740, 296, 660, 300, fill="#fdfaf6", stroke=LINE, rx=14))
    g.extend(text(764, 330, "Dados e finalidades", size=19, weight="bold", fill=GREEN, anchor="start"))
    data = [
        ("Nome, telefone e e-mail", "preparar e liberar a retirada"),
        ("Unidade e itens do pedido", "produção e conferência no balcão"),
        ("Histórico e pontos", "fidelidade e atendimento"),
        ("Consentimento", "prova de autorização e auditoria"),
        ("Preferência de canal", "demonstração Web, App ou Totem"),
    ]
    for i, (what, why) in enumerate(data):
        y = 368 + i * 44
        g.extend(text(764, y, what, size=15, weight="bold", anchor="start"))
        g.extend(text(764, y + 20, why, size=14, fill=MUTED, anchor="start"))
    return svg_close(g)


# ---------------------------------------------------------------------------
# 7. Navegação
# ---------------------------------------------------------------------------
def navegacao() -> str:
    W, H = 1440, 700
    g = svg_open(W, H)
    g.extend(text(40, 40, "Mapa de navegação da aplicação", size=24, weight="bold", anchor="start"))

    g.extend(box(600, 76, 240, 68, "Início", "home por canal", fill=TERRA, stroke=TERRA_DARK, size=22, sub_size=15, sub_fill="#f7e3d8"))

    groups = [
        ("Descoberta e pedido", TERRA_SOFT, TERRA, [
            "Cardápio", "Detalhe do produto", "Carrinho", "Checkout", "Pagamento", "Acompanhamento"
        ]),
        ("Conta e fidelidade", GREEN_SOFT, GREEN, [
            "Entrar / Cadastro", "Meus pedidos", "Fidelidade", "Perfil e privacidade", "Política de privacidade"
        ]),
        ("Operação e canais", MUSTARD_SOFT, MUSTARD, [
            "Painel operacional", "Fila da unidade", "Totem", "Carrinho do totem", "Pagamento no totem"
        ]),
    ]
    for gi, (title, fill, stroke, items) in enumerate(groups):
        x = 40 + gi * 470
        g.append(rect(x, 216, 440, 400, fill="#fffdfa", stroke=LINE, rx=14))
        g.extend(text(x + 20, 250, title, size=19, weight="bold", fill=stroke, anchor="start"))
        for i, item in enumerate(items):
            y = 276 + i * 56
            g.append(rect(x + 20, y, 400, 44, fill=fill, stroke=stroke, rx=8, sw=1.2))
            g.extend(text(x + 240, y + 22, item, size=17))
        g.append(arrow(720, 144, x + 220, 214, color=stroke, marker="ink", width=1.5))

    g.extend(text(720, 668, "Rotas protegidas exigem sessão; o painel operacional simula perfis de atendente, cozinha e gerente.", size=15, fill="#7d6c61"))
    return svg_close(g)


def main() -> None:
    figures = {
        "casos-de-uso": casos_de_uso,
        "jornada": jornada,
        "pagamento-sequencia": pagamento,
        "estados-pedido": estados,
        "arquitetura": arquitetura,
        "lgpd": lgpd,
        "navegacao": navegacao,
    }
    for name, build in figures.items():
        (OUT / f"{name}.svg").write_text(build(), encoding="utf-8")
        print(f"gerado: {name}.svg")


if __name__ == "__main__":
    main()
