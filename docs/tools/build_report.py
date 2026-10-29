# -*- coding: utf-8 -*-
"""
Gera o documento final do Projeto Multidisciplinar em DOCX (ABNT) e exporta em PDF.

Uso:
    python docs/tools/build_report.py

Requisitos: python-docx, pywin32 e Microsoft Word instalado (apenas para o PDF).
"""
from __future__ import annotations

import sys
from pathlib import Path

from docx import Document
from docx.enum.section import WD_ORIENT, WD_SECTION
from docx.enum.table import WD_ALIGN_VERTICAL, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

ROOT = Path(__file__).resolve().parents[2]
DIAG = ROOT / "docs" / "diagrams" / "png"
WIRE = ROOT / "docs" / "wireframes"

# ---------------------------------------------------------------------------
# Dados da entrega — edite somente este bloco antes de gerar o documento.
# O nome do arquivo segue o padrão pedido no enunciado: <RU>_Projeto_Front_End.pdf
# ---------------------------------------------------------------------------
ALUNO = "Erasmo Carlos Gonçalves de Oliveira"
RU = "4772692"
INSTITUICAO = "Centro Universitário Internacional (UNINTER)"
CIDADE = "Carapicuíba"
DATA_ENTREGA = "30 de outubro de 2026"
DEPLOY_URL = "https://raizes-do-nordeste-self.vercel.app/"
REPO_URL = "https://github.com/Dev-Erasmo-Oliveira/raizes-do-nordeste"

FILE_STEM = f"{RU}_Projeto_Front_End"
OUT_DOCX = ROOT / f"{FILE_STEM}.docx"
OUT_PDF = ROOT / f"{FILE_STEM}.pdf"

FONT = "Arial"
INK = RGBColor(0x00, 0x00, 0x00)
HEADER_FILL = "E9DFD3"
SOFT_FILL = "F7F2EC"
SOURCE = "Fonte: elaborado pelo autor (2026)."

doc = Document()
FIG = 0
QUADRO = 0
PORTRAIT = True

# ---------------------------------------------------------------------------
# Estilos e utilidades
# ---------------------------------------------------------------------------
def _set_run_font(run, size=12, bold=None, italic=None, color=None):
    run.font.name = FONT
    run.font.size = Pt(size)
    if bold is not None:
        run.font.bold = bold
    if italic is not None:
        run.font.italic = italic
    if color is not None:
        run.font.color.rgb = color
    rpr = run._element.get_or_add_rPr()
    rfonts = rpr.find(qn("w:rFonts"))
    if rfonts is None:
        rfonts = OxmlElement("w:rFonts")
        rpr.append(rfonts)
    for attr in ("w:ascii", "w:hAnsi", "w:cs", "w:eastAsia"):
        rfonts.set(qn(attr), FONT)


def add_runs(paragraph, text, size=12, bold=False, italic=False):
    """Adiciona texto com marcação **negrito**."""
    parts = text.split("**")
    for index, part in enumerate(parts):
        if not part:
            continue
        run = paragraph.add_run(part)
        _set_run_font(run, size=size, bold=(bold or index % 2 == 1), italic=italic)


def configure_styles():
    normal = doc.styles["Normal"]
    normal.font.name = FONT
    normal.font.size = Pt(12)
    rpr = normal.element.get_or_add_rPr()
    rfonts = rpr.find(qn("w:rFonts"))
    if rfonts is None:
        rfonts = OxmlElement("w:rFonts")
        rpr.append(rfonts)
    for attr in ("w:ascii", "w:hAnsi", "w:cs", "w:eastAsia"):
        rfonts.set(qn(attr), FONT)
    lang = OxmlElement("w:lang")
    lang.set(qn("w:val"), "pt-BR")
    lang.set(qn("w:eastAsia"), "pt-BR")
    lang.set(qn("w:bidi"), "ar-SA")
    rpr.append(lang)

    pf = normal.paragraph_format
    pf.space_before = Pt(0)
    pf.space_after = Pt(0)
    pf.line_spacing = 1.5

    for name, before, after in (("Heading 1", 18, 12), ("Heading 2", 14, 6)):
        style = doc.styles[name]
        style.font.name = FONT
        style.font.size = Pt(12)
        style.font.bold = True
        style.font.italic = False
        style.font.color.rgb = INK
        style.paragraph_format.space_before = Pt(before)
        style.paragraph_format.space_after = Pt(after)
        style.paragraph_format.line_spacing = 1.5
        style.paragraph_format.keep_with_next = True
        style.paragraph_format.first_line_indent = Cm(0)
        # remove herança de cor azul do template
        rpr = style.element.get_or_add_rPr()
        color = rpr.find(qn("w:color"))
        if color is not None:
            color.set(qn("w:val"), "000000")


def set_margins(section, landscape=False):
    section.top_margin = Cm(3)
    section.bottom_margin = Cm(2)
    section.left_margin = Cm(3)
    section.right_margin = Cm(2)
    section.header_distance = Cm(1.5)
    section.footer_distance = Cm(1.2)
    if landscape:
        section.page_width = Cm(29.7)
        section.page_height = Cm(21)
    else:
        section.page_width = Cm(21)
        section.page_height = Cm(29.7)


def text_width_cm() -> float:
    return 24.7 if not PORTRAIT else 16.0


def new_section(landscape: bool):
    global PORTRAIT
    section = doc.add_section(WD_SECTION.NEW_PAGE)
    section.orientation = WD_ORIENT.LANDSCAPE if landscape else WD_ORIENT.PORTRAIT
    set_margins(section, landscape)
    PORTRAIT = not landscape
    return section


def ensure(landscape: bool):
    if landscape == (not PORTRAIT):
        return
    new_section(landscape)


def p(text="", indent=True, align="justify", size=12, space_after=0, space_before=0,
      line=1.5, italic=False, bold=False, keep_next=False, left=0.0):
    paragraph = doc.add_paragraph()
    add_runs(paragraph, text, size=size, bold=bold, italic=italic)
    pf = paragraph.paragraph_format
    pf.alignment = {"justify": WD_ALIGN_PARAGRAPH.JUSTIFY,
                    "center": WD_ALIGN_PARAGRAPH.CENTER,
                    "left": WD_ALIGN_PARAGRAPH.LEFT,
                    "right": WD_ALIGN_PARAGRAPH.RIGHT}[align]
    pf.first_line_indent = Cm(1.25) if indent else Cm(0)
    pf.left_indent = Cm(left)
    pf.space_before = Pt(space_before)
    pf.space_after = Pt(space_after)
    pf.line_spacing = line
    pf.keep_with_next = keep_next
    pf.widow_control = True
    return paragraph


def h1(text):
    paragraph = doc.add_paragraph(style="Heading 1")
    add_runs(paragraph, text, size=12, bold=True)
    paragraph.paragraph_format.first_line_indent = Cm(0)
    return paragraph


def h2(text, landscape=None):
    if landscape is not None:
        ensure(landscape)
    paragraph = doc.add_paragraph(style="Heading 2")
    add_runs(paragraph, text, size=12, bold=True)
    paragraph.paragraph_format.first_line_indent = Cm(0)
    paragraph.paragraph_format.keep_with_next = True
    return paragraph


def bullet(text, size=12):
    paragraph = doc.add_paragraph(style="List Bullet")
    add_runs(paragraph, text, size=size)
    pf = paragraph.paragraph_format
    pf.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    pf.left_indent = Cm(1.25)
    pf.first_line_indent = Cm(-0.5)
    pf.space_before = Pt(0)
    pf.space_after = Pt(3)
    pf.line_spacing = 1.5
    return paragraph


def numbered(items, size=12):
    for index, item in enumerate(items, start=1):
        paragraph = doc.add_paragraph()
        add_runs(paragraph, f"{index}.\t{item}", size=size)
        pf = paragraph.paragraph_format
        pf.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        pf.left_indent = Cm(1.9)
        pf.first_line_indent = Cm(-0.65)
        pf.space_before = Pt(0)
        pf.space_after = Pt(2)
        pf.line_spacing = 1.5
        pf.tab_stops.add_tab_stop(Cm(1.25))


def quote(text):
    paragraph = p(text, indent=False, size=10, line=1.0, space_before=6, space_after=6)
    pf = paragraph.paragraph_format
    pf.left_indent = Cm(4)
    pf.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    return paragraph


def caption(kind, number, title, above=True):
    paragraph = doc.add_paragraph()
    add_runs(paragraph, f"{kind} {number} – {title}", size=10)
    pf = paragraph.paragraph_format
    pf.alignment = WD_ALIGN_PARAGRAPH.CENTER
    pf.first_line_indent = Cm(0)
    pf.space_before = Pt(6 if above else 2)
    pf.space_after = Pt(2)
    pf.line_spacing = 1.0
    pf.keep_with_next = above
    return paragraph


def source_line(text=SOURCE):
    paragraph = doc.add_paragraph()
    add_runs(paragraph, text, size=10)
    pf = paragraph.paragraph_format
    pf.alignment = WD_ALIGN_PARAGRAPH.CENTER
    pf.first_line_indent = Cm(0)
    pf.space_before = Pt(2)
    pf.space_after = Pt(10)
    pf.line_spacing = 1.0
    return paragraph


def add_picture(path, width_cm, paragraph=None):
    if not Path(path).exists():
        raise FileNotFoundError(path)
    target = paragraph or doc.add_paragraph()
    target.alignment = WD_ALIGN_PARAGRAPH.CENTER
    target.paragraph_format.first_line_indent = Cm(0)
    target.paragraph_format.space_before = Pt(0)
    target.paragraph_format.space_after = Pt(0)
    target.paragraph_format.line_spacing = 1.0
    target.add_run().add_picture(str(path), width=Cm(width_cm))


def figure(path, title, width_cm, landscape=False, note=None):
    global FIG
    ensure(landscape)
    FIG += 1
    caption("Figura", FIG, title)
    add_picture(path, width_cm)
    source_line()
    if note:
        p(note, indent=False, size=10, line=1.15)


def _insert_ordered(tbl_pr, element, successors):
    """Insere o elemento antes do primeiro sucessor previsto no schema."""
    for tag in successors:
        found = tbl_pr.find(qn(f"w:{tag}"))
        if found is not None:
            found.addprevious(element)
            return
    tbl_pr.append(element)


def _no_borders(table):
    tbl_pr = table._tbl.tblPr
    borders = OxmlElement("w:tblBorders")
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        element = OxmlElement(f"w:{edge}")
        element.set(qn("w:val"), "nil")
        borders.append(element)
    _insert_ordered(tbl_pr, borders, ("shd", "tblLayout", "tblCellMar", "tblLook"))


def _shade(cell, color):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), color)
    tc_pr.append(shd)


def _cell_margins(table, left=0.12, right=0.12, top=0.05, bottom=0.05):
    tbl_pr = table._tbl.tblPr
    mar = OxmlElement("w:tblCellMar")
    for name, value in (("top", top), ("left", left), ("bottom", bottom), ("right", right)):
        element = OxmlElement(f"w:{name}")
        element.set(qn("w:w"), str(int(value * 567)))
        element.set(qn("w:type"), "dxa")
        mar.append(element)
    _insert_ordered(tbl_pr, mar, ("tblLook",))


def _apply_widths(table, widths):
    """Fixa a largura da tabela e das colunas, em centímetros."""
    tbl = table._tbl
    tbl_pr = tbl.tblPr

    tbl_w = tbl_pr.find(qn("w:tblW"))
    if tbl_w is None:
        tbl_w = OxmlElement("w:tblW")
        _insert_ordered(tbl_pr, tbl_w, ("jc", "tblCellSpacing", "tblInd", "tblBorders"))
    tbl_w.set(qn("w:type"), "dxa")
    tbl_w.set(qn("w:w"), str(int(sum(widths) * 567)))

    layout = tbl_pr.find(qn("w:tblLayout"))
    if layout is None:
        layout = OxmlElement("w:tblLayout")
        _insert_ordered(tbl_pr, layout, ("tblCellMar", "tblLook"))
    layout.set(qn("w:type"), "fixed")

    grid = tbl.find(qn("w:tblGrid"))
    if grid is not None:
        for grid_col, width in zip(grid.findall(qn("w:gridCol")), widths):
            grid_col.set(qn("w:w"), str(int(width * 567)))

    for row in table.rows:
        for index, width in enumerate(widths):
            row.cells[index].width = Cm(width)
    for index, width in enumerate(widths):
        table.columns[index].width = Cm(width)


def _cell(cell, text, size=9, bold=False, align="left", fill=None):
    cell.text = ""
    paragraph = cell.paragraphs[0]
    add_runs(paragraph, text, size=size, bold=bold)
    pf = paragraph.paragraph_format
    pf.alignment = {"left": WD_ALIGN_PARAGRAPH.LEFT,
                    "center": WD_ALIGN_PARAGRAPH.CENTER,
                    "justify": WD_ALIGN_PARAGRAPH.JUSTIFY,
                    "right": WD_ALIGN_PARAGRAPH.RIGHT}[align]
    pf.space_before = Pt(0.5)
    pf.space_after = Pt(0.5)
    pf.line_spacing = 1.0
    pf.first_line_indent = Cm(0)
    cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
    if fill:
        _shade(cell, fill)


def quadro(title, headers, rows, widths, font_size=9, landscape=None, align=None,
           source=SOURCE, fill=HEADER_FILL, size_note=None, keep=None, pad=0.05):
    global QUADRO
    if landscape is not None:
        ensure(landscape)
    QUADRO += 1
    caption("Quadro", QUADRO, title)
    table = doc.add_table(rows=1, cols=len(headers))
    table.style = "Table Grid"
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    _cell_margins(table, top=pad, bottom=pad)

    header = table.rows[0]
    tr_pr = header._tr.get_or_add_trPr()
    repeated = OxmlElement("w:tblHeader")
    repeated.set(qn("w:val"), "true")
    tr_pr.append(repeated)
    for index, label in enumerate(headers):
        _cell(header.cells[index], label, size=font_size, bold=True, align="center", fill=fill)

    for row_data in rows:
        row = table.add_row()
        row._tr.get_or_add_trPr().append(OxmlElement("w:cantSplit"))
        for index, value in enumerate(row_data):
            cell_align = "left"
            if align and index < len(align):
                cell_align = align[index]
            _cell(row.cells[index], str(value), size=font_size, align=cell_align)

    _apply_widths(table, widths)

    # Mantém quadros curtos inteiros na mesma página.
    keep_together = len(rows) <= 10 if keep is None else keep
    if keep_together:
        for row in table.rows[:-1]:
            for cell in row.cells:
                for paragraph in cell.paragraphs:
                    paragraph.paragraph_format.keep_with_next = True

    source_line(source)
    return table


def pair_figure(paths, titles, title, width_cm, landscape=False):
    """Duas imagens lado a lado, com legendas (a) e (b)."""
    global FIG
    ensure(landscape)
    FIG += 1
    caption("Figura", FIG, title)
    table = doc.add_table(rows=2, cols=len(paths))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    _no_borders(table)
    _cell_margins(table, 0.1, 0.1, 0.0, 0.0)
    for index, path in enumerate(paths):
        cell = table.rows[0].cells[index]
        paragraph = cell.paragraphs[0]
        paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
        paragraph.paragraph_format.space_after = Pt(2)
        paragraph.add_run().add_picture(str(path), width=Cm(width_cm))
        label = cell.paragraphs[0]
    for index, item in enumerate(titles):
        cell = table.rows[1].cells[index]
        _cell(cell, f"({chr(97 + index)}) {item}", size=9, align="center")
    for index in range(len(paths)):
        table.columns[index].width = Cm(width_cm + 0.4)
    source_line()


def code_block(lines):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    _no_borders(table)
    _cell_margins(table, 0.2, 0.2, 0.1, 0.1)
    _apply_widths(table, [16.0])
    row = table.rows[0]
    row._tr.get_or_add_trPr().append(OxmlElement("w:cantSplit"))
    cell = row.cells[0]
    cell.text = ""
    for index, line in enumerate(lines):
        paragraph = cell.paragraphs[0] if index == 0 else cell.add_paragraph()
        run = paragraph.add_run(line)
        _set_run_font(run, size=9)
        run.font.name = "Consolas"
        pf = paragraph.paragraph_format
        pf.alignment = WD_ALIGN_PARAGRAPH.LEFT
        pf.space_before = Pt(0)
        pf.space_after = Pt(0)
        pf.line_spacing = Pt(10.5)
    p("", indent=False, space_after=6)


def add_toc():
    paragraph = doc.add_paragraph()
    paragraph.paragraph_format.first_line_indent = Cm(0)
    run = paragraph.add_run()
    begin = OxmlElement("w:fldChar")
    begin.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = r'TOC \o "1-2" \h \z \u'
    separate = OxmlElement("w:fldChar")
    separate.set(qn("w:fldCharType"), "separate")
    placeholder = OxmlElement("w:t")
    placeholder.text = "Sumário em atualização. Use Ctrl+A e F9 para atualizar."
    end = OxmlElement("w:fldChar")
    end.set(qn("w:fldCharType"), "end")
    run._r.append(begin)
    run._r.append(instr)
    run._r.append(separate)
    run._r.append(placeholder)
    run._r.append(end)

    # Pede ao Word que atualize todos os campos ao abrir o arquivo. Sem isso,
    # o sumário fica com o texto provisório até alguém usar Ctrl+A e F9.
    settings = doc.settings.element
    if settings.find(qn("w:updateFields")) is None:
        update = OxmlElement("w:updateFields")
        update.set(qn("w:val"), "true")
        settings.append(update)


def page_number_footer(section):
    footer = section.footer
    footer.is_linked_to_previous = False
    paragraph = footer.paragraphs[0]
    paragraph.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    paragraph.paragraph_format.first_line_indent = Cm(0)
    run = paragraph.add_run()
    _set_run_font(run, size=10)
    begin = OxmlElement("w:fldChar")
    begin.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = "PAGE"
    separate = OxmlElement("w:fldChar")
    separate.set(qn("w:fldCharType"), "separate")
    text = OxmlElement("w:t")
    text.text = "1"
    end = OxmlElement("w:fldChar")
    end.set(qn("w:fldCharType"), "end")
    for element in (begin, instr, separate, text, end):
        run._r.append(element)


def section_title(text):
    paragraph = doc.add_paragraph()
    add_runs(paragraph, text, size=12, bold=True)
    pf = paragraph.paragraph_format
    pf.alignment = WD_ALIGN_PARAGRAPH.CENTER
    pf.first_line_indent = Cm(0)
    pf.space_before = Pt(0)
    pf.space_after = Pt(18)
    pf.line_spacing = 1.5
    return paragraph


def blank(lines=1, size=12):
    for _ in range(lines):
        paragraph = doc.add_paragraph()
        paragraph.paragraph_format.first_line_indent = Cm(0)
        paragraph.paragraph_format.space_after = Pt(0)
        paragraph.paragraph_format.line_spacing = 1.5
        run = paragraph.add_run("")
        _set_run_font(run, size=size)


# ---------------------------------------------------------------------------
# Dados de apoio
# ---------------------------------------------------------------------------
RF = [
    ("RF-01", "Selecionar a unidade de retirada entre Recife, Fortaleza e Natal, com endereço, horário e situação de abertura.", "Essencial"),
    ("RF-02", "Exibir cardápio apenas com os produtos disponíveis na unidade selecionada, com preço, descrição e selos.", "Essencial"),
    ("RF-03", "Buscar por nome ou descrição e filtrar por categoria.", "Importante"),
    ("RF-04", "Personalizar o item com adicionais limitados pelo produto e observação livre.", "Essencial"),
    ("RF-05", "Somar itens idênticos, alterar quantidade, remover itens e exibir subtotal.", "Essencial"),
    ("RF-06", "Informar nome, telefone, e-mail e horário de retirada, com validação por campo.", "Essencial"),
    ("RF-07", "Informar como os dados do pedido são usados e oferecer acesso à política, sem exigir consentimento obrigatório para criar o pedido.", "Essencial"),
    ("RF-08", "Aplicar cupom com mensagens específicas para inexistente, expirado, já usado e abaixo do mínimo.", "Essencial"),
    ("RF-09", "Usar pontos no pedido autenticado, respeitando o limite de 50% do subtotal.", "Essencial"),
    ("RF-10", "Representar solicitação de pagamento externo por Pix ou cartão, com retorno de aprovação, recusa ou timeout; no protótipo, simular localmente sem cobrança nem integração real.", "Essencial"),
    ("RF-11", "Acompanhar o pedido em sete estados, incluindo recusa e cancelamento.", "Essencial"),
    ("RF-12", "Consultar o histórico e reabrir o acompanhamento de pedidos anteriores.", "Importante"),
    ("RF-13", "Visualizar saldo, extrato e recompensas, resgatando pontos em cupom.", "Essencial"),
    ("RF-14", "Cadastrar-se e autenticar com e-mail e senha, com sessão persistida no dispositivo.", "Essencial"),
    ("RF-15", "Editar nome e telefone no perfil.", "Importante"),
    ("RF-16", "Alternar consentimentos de analytics e marketing a qualquer momento.", "Essencial"),
    ("RF-17", "Exportar os dados pessoais em JSON.", "Essencial"),
    ("RF-18", "Excluir a conta e os dados, com confirmação por palavra-chave.", "Essencial"),
    ("RF-19", "Consultar promoções e cupons ativos.", "Desejável"),
    ("RF-20", "Consultar a política de privacidade em página própria.", "Essencial"),
    ("RF-21", "Listar pedidos da unidade com código, cliente, horário, itens, total e status.", "Essencial"),
    ("RF-22", "Filtrar a fila por status e por unidade.", "Importante"),
    ("RF-23", "Atendente confirma retirada de pedidos prontos e cancela pedidos sem pagamento.", "Essencial"),
    ("RF-24", "Cozinha avança pedidos recebidos e em preparo.", "Essencial"),
    ("RF-25", "Gerente avança qualquer status ativo, cancela pedidos e restaura a demonstração.", "Essencial"),
    ("RF-26", "Indicar visualmente quando uma ação não é permitida ao perfil ativo.", "Importante"),
    ("RF-27", "Totem em rota própria, sem menu de navegação e com alvos ampliados.", "Essencial"),
    ("RF-28", "Totem solicita o primeiro nome, apresenta aviso de privacidade e permite continuar sem consentimento obrigatório.", "Essencial"),
    ("RF-29", "Totem monta, paga, exibe o código de retirada e retorna ao início após 20 s.", "Essencial"),
    ("RF-30", "Alternar entre Web, App e Totem sem perder o estado da aplicação.", "Importante"),
]

RNF = [
    ("RNF-01", "Responsividade", "Layout mobile-first, funcional de 320 px a 1440 px sem rolagem horizontal."),
    ("RNF-02", "Desempenho", "Primeira renderização rápida e navegação sem recarregar a página."),
    ("RNF-03", "Acessibilidade", "Navegação por teclado, foco visível e contraste a validar."),
    ("RNF-04", "Usabilidade", "Pedido concluível sem instrução prévia, com uma ação primária por tela."),
    ("RNF-05", "Consistência", "Mesmas regras e componentes em Web, App e Totem."),
    ("RNF-06", "Privacidade", "Dados de pedido não são enviados a uma API ou gateway de pagamento."),
    ("RNF-07", "Transparência", "Finalidades e escolhas opcionais de privacidade claras na interface."),
    ("RNF-08", "Manutenibilidade", "Regras de negócio isoladas da camada de apresentação."),
    ("RNF-09", "Tipagem", "Sem any implícito; o build falha em caso de erro de tipo."),
    ("RNF-10", "Compatibilidade", "Navegadores modernos (Chromium, Firefox e Safari)."),
    ("RNF-11", "Resiliência", "Falha de pagamento não deixa o pedido em estado ambíguo."),
    ("RNF-12", "Publicação", "Build estático com fallback de SPA para rotas profundas."),
]

RN = [
    ("RN-01", "Cada ponto vale R$ 0,10 no resgate; 100 pontos equivalem a R$ 10,00."),
    ("RN-02", "O cliente ganha 1 ponto por R$ 1 do total efetivamente pago."),
    ("RN-03", "Pontos cobrem no máximo 50% do subtotal, em múltiplos de R$ 0,10."),
    ("RN-04", "Cupom é único por cliente/dispositivo e exige valor mínimo."),
    ("RN-05", "Cupom e pontos são cumulativos: o cupom incide primeiro."),
    ("RN-06", "Retirada exige antecedência mínima de 20 min, em intervalos de 15 min."),
    ("RN-07", "O mesmo produto aceita no máximo 20 unidades por item."),
    ("RN-08", "Pontos só são creditados após a aprovação do pagamento."),
    ("RN-09", "Cancelamento devolve pontos usados e remove os pontos ganhos."),
    ("RN-10", "Unidade fechada bloqueia novos pedidos, mas mantém o histórico."),
    ("RN-11", "Item indisponível na unidade aparece desabilitado, não oculto."),
    ("RN-12", "O código do pedido é único no dispositivo, no formato RZ-####."),
    ("RN-13", "As escolhas opcionais de analytics e marketing não condicionam a criação do pedido."),
    ("RN-14", "Marketing é opcional, desligado por padrão e revogável."),
    ("RN-15", "Exclusão de conta remove cadastro, pedidos, pontos e consentimentos."),
]

UC = [
    ("UC-01", "Consultar cardápio por unidade", "Cliente"),
    ("UC-02", "Cadastrar-se e autenticar", "Cliente"),
    ("UC-03", "Montar pedido e escolher retirada", "Cliente"),
    ("UC-04", "Aplicar cupom ou pontos", "Cliente"),
    ("UC-05", "Realizar pagamento", "Cliente; Sistemas de Pagamento Externos (conceitual)"),
    ("UC-06", "Acompanhar status do pedido", "Cliente"),
    ("UC-07", "Consultar histórico", "Cliente"),
    ("UC-08", "Resgatar recompensa", "Cliente"),
    ("UC-09", "Gerenciar consentimento e dados pessoais", "Cliente"),
    ("UC-10", "Consultar fila da unidade", "Atendente, Cozinha, Gerente"),
    ("UC-11", "Avançar status e confirmar retirada", "Atendente, Cozinha, Gerente"),
    ("UC-12", "Cancelar pedido", "Atendente, Gerente"),
    ("UC-13", "Preparar pedido", "Cozinha"),
    ("UC-14", "Acompanhar indicadores da unidade", "Gerente"),
]

TRANSICOES = [
    ("AGUARDANDO_PAGAMENTO", "pagamento aprovado", "RECEBIDO", "Simulador local / sistema"),
    ("AGUARDANDO_PAGAMENTO", "pagamento recusado", "PAGAMENTO_RECUSADO", "Simulador local / sistema"),
    ("AGUARDANDO_PAGAMENTO", "timeout (pagamento EXPIRADO)", "AGUARDANDO_PAGAMENTO", "Simulador local / sistema"),
    ("AGUARDANDO_PAGAMENTO", "cancelamento", "CANCELADO", "Sistema / gerente"),
    ("PAGAMENTO_RECUSADO", "nova tentativa", "AGUARDANDO_PAGAMENTO", "Cliente"),
    ("RECEBIDO", "cozinha assume", "EM_PREPARO", "Cozinha"),
    ("EM_PREPARO", "preparo concluído", "PRONTO", "Cozinha"),
    ("PRONTO", "retirada confirmada", "RETIRADO", "Atendente"),
    ("RECEBIDO a PRONTO", "cancelamento", "CANCELADO", "Gerente"),
    ("AGUARDANDO_PAGAMENTO", "cancelamento", "CANCELADO", "Atendente / gerente"),
]

ROTAS = [
    ("/", "Início", "Público"),
    ("/unidades", "Unidades e horários", "Público"),
    ("/cardapio", "Cardápio por unidade", "Público"),
    ("/produto/:id", "Detalhe do produto", "Público"),
    ("/carrinho", "Carrinho", "Público"),
    ("/checkout", "Checkout e aviso de privacidade", "Público"),
    ("/pagamento/:codigo", "Pagamento simulado", "Público por código"),
    ("/pedido/:codigo", "Acompanhamento", "Público por código"),
    ("/promocoes", "Cupons e campanhas", "Público"),
    ("/privacidade", "Política de privacidade", "Público"),
    ("/entrar", "Login", "Público"),
    ("/cadastro", "Cadastro", "Público"),
    ("/operacao", "Painel operacional", "Perfil simulado"),
    ("/pedidos", "Meus pedidos", "Sessão"),
    ("/fidelidade", "Fidelidade", "Sessão"),
    ("/perfil", "Perfil e privacidade", "Sessão"),
    ("/totem", "Totem (quiosque)", "Público, layout próprio"),
]

JORNADA = [
    ("1. Descoberta", "Acessa o canal, reconhece a marca e entende que a retirada é no balcão.", "Curiosidade", "Muitas opções genéricas; difícil confiar.", "Identidade regional clara e proposta de retirada explícita."),
    ("2. Unidade e cardápio", "Escolhe a loja mais próxima e explora o cardápio.", "Expectativa", "Preço ou item que não existe naquela loja.", "Unidade sempre visível; item indisponível marcado, não escondido."),
    ("3. Montagem e carrinho", "Personaliza o item, revisa quantidade, cupom e total.", "Controle e conferência", "Adicionais sem preço claro; cupom recusado sem explicação.", "Preço do botão já somado; erro de cupom por motivo."),
    ("4. Checkout", "Informa dados e horário; consulta o aviso de privacidade.", "Desconfiança", "Formulário longo e pedido de dados sem justificativa.", "Finalidade clara e escolhas opcionais separadas."),
    ("5. Pagamento", "Escolhe Pix ou cartão e confirma.", "Ansiedade", "Ausência de retorno ou tela travada.", "Estado de processamento com três desfechos claros."),
    ("6. Preparo e retirada", "Acompanha o status e apresenta o código no balcão.", "Impaciência e alívio", "Status parado; comanda perdida na fila.", "Linha do tempo com previsão; código curto e fila por status."),
    ("Pós-venda", "Confere pontos, extrato e histórico.", "Recompensa", "Pontos que não aparecem.", "Crédito na aprovação, extrato e recompensas alcançáveis."),
]

TESTES = [
    ("T-01", "Cadastro e autenticação, com credenciais inválidas", "cliente@raizes.com / senha errada; depois cadastro válido", "Recusa com mensagem e, no cadastro válido, sessão iniciada e toast de boas-vindas", "Aprovado"),
    ("T-02", "Unidade fechada bloqueia o pedido", "Natal (fechada) + produto tapioca", "Aviso de unidade fechada; item não entra no carrinho", "Aprovado"),
    ("T-03", "Cardápio filtrado e item indisponível", "Unidade Fortaleza; buscar tapioca; filtrar Bebidas; limpar filtros; abrir Empada de Frango", "Busca e categoria combinadas; Empada de Frango indisponível com ação desabilitada", "Aprovado"),
    ("T-04", "Adicionais, observação e preço do botão", "tap-carne + queijo + carne; terceiro adicional; obs. sem cebola", "Botão R$ 27,90; terceiro adicional bloqueado", "Aprovado"),
    ("T-05", "Carrinho: agrupamento, limite e remoção", "Duas configurações iguais; quantidade 25; remover item", "Itens somam; máximo 20; subtotal observado R$ 62,70; remoção recalcula", "Aprovado"),
    ("T-06", "Checkout com campos inválidos", "Nome vazio; telefone 8 dígitos; e-mail ana@", "Envio bloqueado; resumo e erro em cada campo inválido", "Aprovado"),
    ("T-07", "Pedido com preferências opcionais desativadas", "Escolher somente essenciais; preencher checkout válido", "Pedido criado sem checkbox obrigatório; analytics e marketing desligados", "Aprovado"),
    ("T-08", "Cupom: aplicação válida e quatro erros distintos", "Subtotal R$ 36,70: RAIZES10; NAOEXISTE; EXPIRADO2024; subtotal R$ 20: RAIZES10; aprovar pedido com RAIZES10 e tentar reutilizar em novo subtotal R$ 36,70", "Desconto R$ 3,67 e total R$ 33,03; erros de inexistente, expirado, mínimo R$ 30 e já utilizado", "Aprovado"),
    ("T-09", "Pontos limitados a 50% do subtotal", "Saldo 120; subtotal R$ 14,90; informar 120 pontos", "Máximo 74 pontos (R$ 7,40); total R$ 7,50", "Aprovado"),
    ("T-10", "Pagamento Pix aprovado", "Pedido R$ 33,03; copiar código Pix; confirmar pagamento", "Código copiado; processamento e aprovação; pedido RECEBIDO e 33 pontos creditados", "Aprovado"),
    ("T-11", "Cartão recusado (final 0000)", "4111 1111 1111 0000; validade 12/30; CVV 123", "Recusa, PAGAMENTO_RECUSADO, uma tentativa e formulário de nova tentativa", "Aprovado"),
    ("T-12", "Timeout do simulador", "Botão Simular timeout", "Pagamento não confirmado; pagamento EXPIRADO e pedido AGUARDANDO_PAGAMENTO", "Aprovado"),
    ("T-13", "Acompanhamento do pedido", "Avançar status no painel e abrir novamente o acompanhamento", "Status PRONTO e texto de retirada com o código", "Aprovado"),
    ("T-14", "Histórico e reabertura", "Conta demo com pedido retirado, recusado e cancelado", "Lista ordenada; cancelado abre detalhes sem linha do tempo ou avanço de status", "Aprovado"),
    ("T-15", "Fidelidade: resgate e saldo insuficiente", "120 pontos; recompensa de 100 e de 150", "Saldo 20; cupom RESG-XXXX; recompensa acima do saldo bloqueada", "Aprovado"),
    ("T-16", "Perfil: edição e validação", "Nome A; telefone 9 dígitos; depois dados válidos", "Nome e telefone inválidos bloqueados; alteração válida persiste após recarga", "Aprovado"),
    ("T-17", "Banner e preferências opcionais", "Primeiro acesso; abrir preferências; somente essenciais", "Analytics e marketing desligados; escolha persistida após recarga", "Aprovado"),
    ("T-18", "Exportar e excluir dados", "Exportar JSON; confirmação apagar e EXCLUIR", "JSON válido com usuário, preferências e pedidos; exclusão bloqueada até EXCLUIR e efetivada", "Aprovado"),
    ("T-19", "Permissões de atendente e cozinha", "Pedido aguardando; pedido pago percorrendo RECEBIDO, EM_PREPARO e PRONTO", "Ações permitidas habilitadas; ações restritas desabilitadas", "Aprovado"),
    ("T-20", "Gerente: transições, cancelamento e restauração", "Avançar até RETIRADO; cancelar pedido pago; restaurar demo", "Transições permitidas; pontos devolvidos; saldo e fila retornam ao estado inicial", "Aprovado"),
    ("T-21", "Totem: fluxo completo sem gate de consentimento", "Nome João; 2 itens; Pix; aguardar 20 s; repetir e tocar Novo atendimento", "Avança sem checkbox; confirmação com código; retorno automático e imediato", "Aprovado"),
    ("T-22", "Canais e responsividade", "Seis rotas; 320, 390, 768 e 1440 px; Web/App/Totem; pedido com teclado", "Sem rolagem horizontal; carrinho preservado; foco visível e pedido concluído com Tab/Enter", "Aprovado"),
]

RESULTADOS_TESTES = [
    ("T-01", "Login inválido recusado; cadastro válido criou sessão e exibiu boas-vindas."),
    ("T-02", "Natal fechada exibiu aviso e bloqueou a adição ao carrinho."),
    ("T-03", "Busca retornou 4 itens; busca + Bebidas retornou 0; Empada indisponível e botão desabilitado."),
    ("T-04", "Dois adicionais aceitos; terceiro bloqueado; R$ 27,90 e observação preservados no carrinho."),
    ("T-05", "Configurações iguais agrupadas; distintas separadas; limite 20 e remoção; subtotal R$ 62,70."),
    ("T-06", "Nome, telefone e e-mail inválidos bloquearam o envio e exibiram mensagens."),
    ("T-07", "Com **Somente essenciais**, o pedido foi criado sem checkbox; analytics e marketing permaneceram desligados e o novo pedido não registrou consentimento artificial."),
    ("T-08", "RAIZES10: desconto R$ 3,67 e total R$ 33,03; inexistente, expirado, mínimo e reutilização recusados."),
    ("T-09", "120 pontos limitados a 74; desconto R$ 7,40 e total R$ 7,50."),
    ("T-10", "Código Pix copiado; processamento e aprovação observados; pedido RECEBIDO e saldo +33 pontos."),
    ("T-11", "Cartão final 0000 recusado; tentativa 1 registrada; nova tentativa reabriu o formulário."),
    ("T-12", "Timeout exibiu pagamento não confirmado; pagamento EXPIRADO e pedido AGUARDANDO_PAGAMENTO."),
    ("T-13", "Painel avançou pedido até PRONTO; acompanhamento mostrou aviso de retirada e código."),
    ("T-14", "Histórico incluiu retirado, recusado e cancelado; detalhes do cancelado sem linha do tempo ou avanço."),
    ("T-15", "Saldo 120 → 20 após resgate de 100; cupom RESG-XXXX gerado; recompensa de 150 bloqueada."),
    ("T-16", "Nome e telefone inválidos bloqueados; dados válidos persistiram após recarga."),
    ("T-17", "Essenciais ativos; analytics e marketing desligados e escolha persistida após recarga."),
    ("T-18", "JSON application/json com usuário, preferências e 3 pedidos; EXCLUIR removeu dados associados e encerrou sessão."),
    ("T-19", "Atendente e cozinha tiveram ações conforme permissões; ações não permitidas ficaram desabilitadas."),
    ("T-20", "Gerente avançou pedido até RETIRADO; cancelamento devolveu pontos (16 → 24); restauração retornou a 120 pontos e fila vazia."),
    ("T-21", "Nome avançou sem checkbox; Pix aprovado com 2 itens e código exibido; **Novo atendimento** reiniciou imediatamente e outro atendimento retornou ao início após 20 s."),
    ("T-22", "Seis rotas nas quatro larguras sem overflow; canais preservaram carrinho; Tab/Enter concluíram pedido com foco visível."),
]

MENSAGENS = [
    ("Login", "E-mail ou senha incorretos. Confira os dados e tente novamente.", "Credenciais inválidas"),
    ("Cadastro", "A senha deve ter pelo menos 8 caracteres.", "Senha curta"),
    ("Cadastro", "As senhas não conferem.", "Confirmação divergente"),
    ("Unidade", "Esta unidade está fechada. Escolha outra unidade para pedir.", "Unidade com aberta = false"),
    ("Produto", "Escolha no máximo 2 adicionais.", "Limite do produto excedido"),
    ("Checkout", "Informe um telefone com DDD (10 ou 11 dígitos).", "Telefone inválido"),
    ("Cupom", "Este cupom exige um valor mínimo de R$ 30,00.", "Subtotal abaixo do mínimo do cupom RAIZES10"),
    ("Cupom", "Este cupom está expirado.", "Validade anterior à data atual"),
    ("Pagamento", "Informe um número de cartão com pelo menos 13 dígitos.", "Cartão inválido"),
    ("Pagamento", "A validade deve estar no formato MM/AA.", "Validade inválida"),
    ("Perfil", "Botão de exclusão permanece desabilitado até digitar EXCLUIR.", "Confirmação incorreta"),
]

HEURISTICAS = [
  ("H-01", "Visibilidade do estado", "Toasts ativos dispensados; resumo inline preservado no checkout", "Corrigido e retestado"),
  ("H-02", "Reconhecimento", "Unidade visível no cardápio, carrinho e checkout", "Verificado"),
  ("H-03", "Consistência", "\"Comanda\" aparece na confirmação; considerar padronizar com \"pedido\"", "Verificado com ressalva"),
  ("H-04", "Prevenção de erros", "Pagamento aprovado não pode ser processado novamente após recarga", "Verificado"),
  ("H-05", "Controle do usuário", "Nova tentativa após recusa ou timeout (T-11 e T-12)", "Verificado"),
  ("H-06", "Ajuda e documentação", "Login e limite de 50% dos pontos informados no checkout", "Verificado"),
  ("H-07", "Mundo real", "Avisos de simulação claros; controles de teste visíveis", "Verificado com ressalva"),
  ("H-08", "Estética e minimalismo", "Seletor de canal separado da navegação principal", "Verificado"),
  ("H-09", "Acessibilidade", "Foco visível com contorno de 2 px", "Verificado"),
  ("H-10", "Mensagens de erro", "Resumo geral e mensagens junto aos campos inválidos", "Verificado"),
]

RESPONSIVIDADE = [
    ("Rolagem horizontal", "scrollWidth <= window.innerWidth em seis rotas e quatro larguras", "Verificado: sem overflow horizontal"),
    ("Sobreposição", "Reteste com carrinho e checkout inválido a 390 × 844 px", "Verificado: sem toast sobre campos ou navegação; resumo inline visível; ver H-01"),
    ("Alvos de toque", "Altura dos botões principais", "Pendente de verificação"),
    ("Teclado", "Checkout e pagamento com Tab, Enter e Space", "Verificado: pedido aprovado"),
    ("Foco visível", "Inspeção do contorno do elemento focado", "Verificado: contorno visível"),
    ("Estrutura semântica", "Árvore de acessibilidade no navegador", "Pendente de verificação"),
    ("Contraste", "Auditoria automatizada (Lighthouse/axe)", "Pendente de verificação"),
    ("Movimento", "prefers-reduced-motion", "Pendente de verificação"),
]

RISCOS = [
    ("Dados por dispositivo", "Pedido não aparece em outro navegador", "Declarado no README e na tela de demonstração"),
    ("Permissões no cliente", "Podem ser contornadas por ferramentas de desenvolvedor", "Aceito como simulação; produção valida no servidor"),
    ("Pagamento determinístico", "Não cobre todos os códigos reais de recusa", "Três desfechos representados e validação de formulário"),
    ("Sem testes automatizados", "Regressões dependem de roteiro manual", "Plano detalhado e funções puras isoladas"),
    ("Texto jurídico", "Política é modelo acadêmico", "Aviso explícito na página de privacidade"),
]


# ---------------------------------------------------------------------------
# Elementos pré-textuais
# ---------------------------------------------------------------------------
def pre_textual():
    set_margins(doc.sections[0])

    blank(2)
    p(INSTITUICAO, indent=False, align="center", bold=True)
    blank(1)
    p("PROJETO MULTIDISCIPLINAR", indent=False, align="center", bold=True)
    p("TRILHA FRONT-END", indent=False, align="center", bold=True)
    blank(4)
    p("REDE RAÍZES DO NORDESTE", indent=False, align="center", bold=True, size=18)
    blank(1)
    p("Projeto de interface multicanal para pedidos com retirada no balcão",
      indent=False, align="center")
    blank(8)
    p(ALUNO, indent=False, align="center", bold=True)
    p(f"RU {RU}", indent=False, align="center")
    blank(5)
    p(CIDADE, indent=False, align="center")
    p("2026", indent=False, align="center")

    doc.add_page_break()

    p(ALUNO, indent=False, align="center")
    blank(8)
    p("REDE RAÍZES DO NORDESTE: projeto de interface multicanal para pedidos com retirada no balcão",
      indent=False, align="center")
    blank(5)
    p("Trabalho apresentado à disciplina de Projeto Multidisciplinar — Trilha Front-End, "
      "como requisito parcial para composição da nota da atividade.",
      indent=False, align="justify", line=1.0, left=8.0)
    blank(1)
    p("Professor: Prof. Esp. Giuliano Lanes de Almeida.",
      indent=False, align="justify", line=1.0, left=8.0)
    blank(6)
    p(CIDADE, indent=False, align="center")
    p("2026", indent=False, align="center")

    doc.add_page_break()

    section_title("RESUMO")
    p("Este trabalho apresenta o projeto e a implementação de uma interface front-end multicanal "
      "para a Rede Raízes do Nordeste, rede fictícia de lanchonetes regionais com três unidades e "
      "operação exclusivamente de retirada no balcão. O problema tratado é a ausência de um canal "
      "digital único que permita ao cliente consultar o cardápio da loja escolhida, montar o pedido, "
      "simular o pagamento, acompanhar o preparo e retirar sem depender do atendimento "
      "telefônico. A solução foi especificada com 30 requisitos funcionais e 12 não funcionais, "
      "modelada em diagramas de casos de uso, de jornada e de estados, prototipada em wireframes de "
      "baixa fidelidade para mobile e desktop e implementada como aplicação React com TypeScript e "
      "Vite, com dados mockados e persistência local. O pagamento é simulado de forma determinística, "
      "com retorno visual de aprovação, recusa e timeout. A privacidade é tratada dentro do fluxo, com "
      "preferências opcionais, informação sobre o uso dos dados, exportação e exclusão. O plano de testes "
      "reúne 22 cenários, todos executados e aprovados na interface local. A aplicação "
      "compartilha as regras de pedido entre Web, App e Totem; pagamento e persistência são simulados.",
      indent=False, align="justify")
    blank(1)
    p("**Palavras-chave:** interface; multicanalidade; experiência do usuário; LGPD; pagamento; React.",
      indent=False, align="left")

    doc.add_page_break()

    section_title("ABSTRACT")
    p("This work presents the design and implementation of a multi-channel front-end interface for "
      "Rede Raízes do Nordeste, a fictional regional snack chain with three units and in-store "
      "pickup only. The problem addressed is the lack of a single digital channel that allows "
      "customers to check the menu of a chosen store, build an order, simulate a local payment, "
      "follow preparation and collect the order without relying on phone support. The "
      "solution was specified with 30 functional and 12 non-functional requirements, modelled with "
      "use case, journey and order-state diagrams, prototyped as low-fidelity wireframes for mobile "
      "and desktop, and implemented as a React application with TypeScript and Vite, using mock data "
      "and local persistence. Payment is deterministically simulated, with visual feedback for "
      "approval, decline and timeout, with no real payment gateway. Privacy is handled inside the "
      "flow, with optional preferences, clear notices, data export and deletion. Validation included "
      "22 test scenarios, a heuristic "
      "evaluation and responsiveness checks from 320 to 1440 pixels, with no blocking failures. The "
      "conclusion is that sustainable multi-channel experience depends less on screens and more on "
      "consistent rules and shared state across channels.",
      indent=False, align="justify")
    blank(1)
    p("**Keywords:** interface; multi-channel; user experience; data privacy; payment; React.",
      indent=False, align="left")

    doc.add_page_break()

    section_title("SUMÁRIO")
    add_toc()


# ---------------------------------------------------------------------------
# 1 Introdução
# ---------------------------------------------------------------------------
def introducao():
    section = doc.add_section(WD_SECTION.NEW_PAGE)
    section.orientation = WD_ORIENT.PORTRAIT
    set_margins(section)
    page_number_footer(section)

    h1("1 INTRODUÇÃO")

    h2("1.1 Contexto e problema")
    p("A Rede Raízes do Nordeste é uma rede de lanchonetes regionais com três unidades — Recife, "
      "Fortaleza e Natal — cujo modelo de operação é a retirada no balcão. Não há entrega, não há "
      "estoque central e cada loja tem horário, equipe e disponibilidade de produtos próprios. Esse "
      "formato reduz custo logístico, mas concentra a experiência no atendimento presencial: o "
      "cliente descobre o cardápio no balcão, faz o pedido em voz alta, paga na maquininha e espera "
      "em pé ao lado da fila.")
    p("O crescimento da rede expõe três limites desse modelo. O primeiro é a **capacidade de "
      "atendimento**: nos horários de pico, o mesmo atendente anota o pedido, recebe o pagamento e "
      "confere a retirada, o que alonga a fila e aumenta o risco de erro na comanda. O segundo é a "
      "**previsibilidade**: sem um pedido registrado antes da chegada, a cozinha não consegue "
      "organizar a produção por horário de retirada. O terceiro é a **relação com o cliente**: sem "
      "histórico digital, o programa de fidelidade não é transparente e o cliente não sabe quantos "
      "pontos tem nem o que pode resgatar.")
    p("A resposta proposta é uma interface multicanal — Web, aplicativo e totem — que permita montar "
      "o pedido antes de chegar à loja, simular o pagamento e acompanhar o preparo. O recorte "
      "deste trabalho é o front-end: a camada que o cliente e a equipe efetivamente veem e operam. "
      "Backend, banco de dados e integração real com adquirente são simulados, conforme permite o "
      "enunciado, mas a criação do pedido e o retorno da simulação são representados por completo.")

    h2("1.2 Objetivos")
    p("O objetivo geral é projetar, justificar e implementar uma interface front-end multicanal para "
      "a Rede Raízes do Nordeste, cobrindo o pedido com retirada no balcão, a simulação local do "
      "pagamento, o acompanhamento do preparo, a fidelidade e a privacidade.")
    p("Os objetivos específicos são:", space_after=3)
    bullet("levantar requisitos funcionais e não funcionais a partir do estudo de caso, com atenção "
           "à multicanalidade e às restrições de operação;")
    bullet("modelar os casos de uso, a jornada do cliente e os estados do pedido, evidenciando atores, "
           "decisões e integrações;")
    bullet("produzir wireframes de baixa fidelidade para mobile e desktop, com anotações de fluxo e "
           "de decisão de interface;")
    bullet("implementar a solução como aplicação React com TypeScript, dados mockados e persistência "
           "local, sem dependência de backend;")
    bullet("demonstrar o tratamento de LGPD na interface e validar a qualidade com um plano de testes "
           "de pelo menos dez cenários, incluindo erros e mensagens.")

    h2("1.3 Justificativa")
    p("Em uma lanchonete, o tempo entre o pedido e a retirada é o principal indicador percebido pelo "
      "cliente. Cada erro de anotação custa uma refeição, uma fila parada e uma avaliação negativa. "
      "Digitalizar o pedido antes da chegada não elimina a fila, mas transfere para o cliente a parte "
      "que ele faz melhor — escolher com calma, comparar preço e pagar no próprio celular — e libera "
      "o balcão para a tarefa que exige presença: conferir e entregar.")
    p("Do ponto de vista acadêmico, o caso permite exercitar o que diferencia um front-end profissional "
      "de uma tela bonita: coerência entre requisitos, modelo, wireframe e código; clareza de estados; "
      "tratamento de erro; e respeito ao usuário na coleta de dados. A multicanalidade acrescenta uma "
      "restrição real de projeto, porque o mesmo pedido precisa fazer sentido em um navegador, em um "
      "aplicativo de uma mão e em um totem usado em pé.")

    h2("1.4 Metodologia")
    p("A pesquisa é aplicada, de abordagem qualitativa e natureza exploratória, organizada como um "
      "processo de design science: compreender o problema, especificar requisitos, modelar, prototipar, "
      "implementar e avaliar (GIL, 2017; SOMMERVILLE, 2019). O trabalho foi conduzido em seis etapas:")
    numbered([
        "**imersão no estudo de caso**, com identificação de atores, restrições e momentos críticos;",
        "**especificação de requisitos**, separando requisitos funcionais, não funcionais e regras de "
        "negócio, com priorização MoSCoW;",
        "**modelagem**, com diagrama de casos de uso, descrição detalhada da funcionalidade de "
        "pagamento, mapa de jornada, máquina de estados, arquitetura e mapa de navegação;",
        "**prototipação de baixa fidelidade**, em frames de 390 × 844 e 1440 × 900, com anotações de "
        "decisão;",
        "**implementação**, em React 18, TypeScript e Vite, com dados mockados, persistência em "
        "localStorage e pagamento simulado;",
        "**avaliação**, com 22 cenários de teste, inspeção heurística (NIELSEN, 1994) e verificação de "
        "responsividade e acessibilidade.",
    ])
    p("Os diagramas foram gerados por script em Python, em SVG, e convertidos para PNG em duas vezes "
      "a resolução para impressão. Os wireframes foram desenhados em HTML e CSS e exportados como "
      "imagem. Essa escolha mantém os artefatos versionáveis e reproduzíveis, em vez de depender de "
      "arquivos binários editáveis apenas manualmente.")

    h2("1.5 Organização do documento")
    p("A seção 2 apresenta a análise do negócio, as personas, os requisitos e as regras. A seção 3 "
      "reúne os diagramas e a descrição da funcionalidade de pagamento. A seção 4 documenta os "
      "wireframes e as decisões de interface. A seção 5 trata da LGPD. A seção 6 descreve a entrega "
      "técnica, as rotas e a publicação. A seção 7 apresenta o plano de testes e os resultados. A "
      "seção 8 conclui, seguida das referências e do apêndice com a declaração de uso de inteligência "
      "artificial.")


# ---------------------------------------------------------------------------
# 2 Análise e requisitos
# ---------------------------------------------------------------------------
def requisitos():
    h1("2 ANÁLISE E REQUISITOS")

    h2("2.1 O cenário de negócio")
    p("A rede opera com três lojas de bairro, todas com retirada no balcão e sem entrega. O cardápio "
      "tem base comum — tapiocas, cuscuz, salgados, doces, bebidas e combos — mas a disponibilidade "
      "varia por loja, seja por produção local, seja por equipamento. O cliente precisa saber, antes "
      "de sair de casa, se o item existe naquela unidade e se a loja está aberta.")
    p("A operação é dividida em três papéis. O **atendente** recebe o cliente, confere o código e "
      "entrega o pedido; a **cozinha** assume a comanda e informa quando o pedido está pronto; o "
      "**gerente** responde pela fila, por cancelamentos e pela consistência da loja. O sistema "
      "precisa refletir essa separação, mesmo quando ela é simulada no cliente, porque o desenho das "
      "permissões é o que evita que qualquer pessoa faça qualquer coisa.")
    p("A fidelidade é parte do modelo de negócio, não um enfeite: o cliente ganha 1 ponto por real "
      "pago, cada ponto vale R$ 0,10 no resgate e o resgate é limitado a 50% do subtotal. O limite "
      "protege a margem e obriga o cliente a pagar parte do pedido, o que mantém a fidelidade "
      "conectada à compra. Cupons e pontos são cumulativos, com o cupom aplicado primeiro.")

    quadro("Unidades, horários e situação de funcionamento",
           ["Unidade", "Cidade", "Horário", "Situação na demonstração"],
           [("Raízes — Boa Viagem", "Recife — PE", "Todos os dias, 7h às 22h", "Aberta"),
            ("Raízes — Meireles", "Fortaleza — CE", "Todos os dias, 8h às 21h", "Aberta"),
            ("Raízes — Ponta Negra", "Natal — RN", "Todos os dias, 8h às 20h", "Fechada (teste da RN-10)")],
           [4.4, 3.0, 5.0, 3.6],
           align=["left", "left", "left", "left"])
    p("A unidade de Natal permanece fechada de propósito na demonstração. Isso permite verificar, sem "
      "alterar dados, que o sistema bloqueia o pedido e explica o motivo em vez de esconder a loja — "
      "comportamento definido na RN-10 e testado no cenário T-02.")

    h2("2.2 Personas e decisão de compra")
    p("Duas personas orientaram as decisões de interface. A primeira representa quem pede; a segunda, "
      "quem entrega. Nenhuma delas foi construída com dados estatísticos: são sínteses do estudo de "
      "caso, usadas para justificar prioridades e não para afirmar comportamento de mercado.")
    p("**Marina, 29 anos, analista administrativa.** Sai do trabalho às 18h e passa pela loja antes "
      "da academia. Decide no celular, em pé, com uma mão. Quer resolver em poucos minutos, não quer "
      "baixar aplicativo para uma compra única e tem duas desconfianças: pagar duas vezes e chegar "
      "sem o pedido pronto. Sucesso, para ela, é ver o código e o horário antes de sair.")
    p("**Carlos, 34 anos, atendente.** Trabalha no balcão no horário de pico. Precisa localizar a "
      "comanda pelo código, confirmar a retirada e resolver exceções sem sair da fila. Teme pedido "
      "errado, cliente sem pagamento e cancelamento indevido. Sucesso, para ele, é enxergar a fila "
      "por status e ter apenas as ações que seu perfil permite.")

    quadro("Personas, objetivos e critérios de sucesso",
           ["Persona", "Objetivo", "Dores", "Critério de sucesso"],
           [("Marina (cliente)", "Pedir e retirar no trajeto, sem fila",
             "pagar duas vezes; chegar antes do pedido", "código e horário visíveis antes de sair"),
            ("Carlos (atendente)", "Localizar e entregar a comanda com segurança",
             "pedido errado; cancelamento indevido", "fila por status e ações do seu perfil")],
           [3.0, 4.4, 4.4, 4.2])

    h2("2.3 Multicanalidade")
    p("O mesmo pedido precisa funcionar em três contextos. Em vez de duplicar telas, a solução usa uma "
      "única base de componentes e regras, e muda apenas a densidade da informação e o tamanho dos "
      "alvos. Web e aplicativo compartilham o layout responsivo; o totem é uma rota própria, sem menu "
      "de navegação, porque um quiosque não deve permitir que o cliente “saia” para outra tela no "
      "meio do pedido.")
    p("O estado fica no navegador em que o pedido foi criado. A demonstração não sincroniza pedidos "
      "entre dispositivos; os canais compartilham as mesmas regras e telas.")

    quadro("Canais, contexto de uso e decisões de interface",
           ["Canal", "Contexto", "Características", "Restrição principal"],
           [("Web", "Desktop, planejamento da refeição", "duas colunas, carrinho fixo, navegação completa",
             "não pode depender de hover"),
            ("App", "Celular, em deslocamento, uma mão", "largura de aplicativo, barra inferior, alvos maiores",
             "pouca altura útil e interrupções"),
            ("Totem", "Na loja, em pé, toque rápido", "tela cheia, sem menu; novo atendimento reinicia o fluxo",
             "sem teclado físico e com fila atrás")],
           [2.0, 4.4, 5.6, 4.0])

    h2("2.4 Requisitos funcionais")
    p("Foram especificados 30 requisitos funcionais, priorizados em essencial, importante e desejável. "
      "Após o pagamento aprovado, o totem retorna automaticamente ao início depois de 20 segundos; "
      "o botão Novo atendimento permite antecipar esse retorno. A numeração é usada na rastreabilidade "
      "com telas e testes.")
    quadro("Requisitos funcionais",
           ["ID", "Requisito", "Prioridade"],
           RF,
           [1.6, 12.4, 2.0],
           font_size=8.5,
           align=["center", "left", "center"])

    h2("2.5 Requisitos não funcionais")
    p("Os requisitos não funcionais concentram as restrições de qualidade. Mobile-first e "
      "responsividade são obrigatórios no enunciado; desempenho, acessibilidade e privacidade foram "
      "tratados como critérios verificáveis, não como intenção.")
    quadro("Requisitos não funcionais",
           ["ID", "Categoria", "Requisito"],
           RNF,
           [1.8, 2.8, 11.4],
           font_size=8.5,
           align=["center", "left", "left"])

    h2("2.6 Regras de negócio")
    p("As regras ficam isoladas da interface, em um arquivo de configuração e em funções puras de "
      "cálculo. Isso evita que duas telas cheguem a resultados diferentes para o mesmo pedido — "
      "especialmente em pontos, cupom e arredondamento.")
    quadro("Regras de negócio",
           ["ID", "Regra"],
           RN,
           [1.8, 14.2],
           font_size=9,
           align=["center", "left"])

    h2("2.7 Rastreabilidade")
    p("Cada grupo de requisitos está associado a telas e a cenários de teste. A rastreabilidade "
      "completa, requisito por requisito, está no documento de requisitos do repositório; o quadro "
      "abaixo resume a ligação usada na avaliação.")
    quadro("Rastreabilidade entre requisitos, telas e testes",
           ["Requisitos", "Telas e componentes", "Cenários"],
           [("RF-01 a RF-05", "Unidades, cardápio, produto e carrinho", "T-02 a T-05"),
            ("RF-06 a RF-10", "Checkout, cupom, pontos e pagamento", "T-06 a T-12"),
            ("RF-11 e RF-12", "Acompanhamento e histórico", "T-13 e T-14"),
            ("RF-13 a RF-15", "Fidelidade, login e perfil", "T-01, T-15 e T-16"),
            ("RF-16 a RF-20", "Privacidade e campanhas", "T-17 e T-18"),
            ("RF-21 a RF-26", "Painel operacional", "T-19 e T-20"),
            ("RF-27 a RF-29", "Totem", "T-21"),
            ("RF-30, RNF-01, RNF-03", "Canais e responsividade", "T-22")],
           [4.4, 7.2, 4.4])


# ---------------------------------------------------------------------------
# 3 Diagramas
# ---------------------------------------------------------------------------
def diagramas():
    h1("3 DIAGRAMAS")

    p("Os diagramas usam notação inspirada na UML, simplificada para leitura em impressão. A "
      "preocupação central não foi a formalidade da notação, mas a coerência entre atores, fluxos, "
      "estados e telas — ou seja, se o diagrama explica a aplicação que foi construída.")

    h2("3.1 Diagrama de casos de uso")
    p("O diagrama delimita a fronteira do sistema e posiciona os atores. O **Cliente** é o ator "
      "principal da jornada de pedido; **Atendente**, **Cozinha** e **Gerente/Administrador** operam "
      "a retirada e a produção. O **Sistema de Pagamento Externo** aparece como ator conceitual, "
      "conforme o enunciado, para representar a integração prevista; no protótipo, esse papel é "
      "simulado localmente e não existe comunicação real com um provedor.")
    p("O totem não aparece como ator: ele é um canal operado pelo próprio cliente. Essa distinção "
      "evita o erro comum de tratar dispositivos como usuários e mantém o foco em quem executa a "
      "ação. As relações de inclusão e extensão foram descritas em texto, e não desenhadas, para "
      "preservar a legibilidade em tamanho A4.")

    figure(DIAG / "casos-de-uso.png", "Diagrama de casos de uso da Rede Raízes do Nordeste", 15.6)

    quadro("Atores do sistema",
           ["Ator", "Tipo", "Responsabilidade"],
           [("Cliente", "Primário", "Consulta o cardápio, monta o pedido, paga, acompanha e retira."),
            ("Sistemas de Pagamento Externos", "Secundário (conceitual)", "Representam a autorização e o retorno do pagamento; no protótipo, esses resultados são produzidos pelo simulador local, sem integração real."),
            ("Atendente", "Primário", "Organiza a fila do balcão, confirma retiradas e cancela pedidos sem pagamento."),
            ("Cozinha", "Primário", "Assume e conclui o preparo dos pedidos recebidos."),
            ("Gerente / Administrador", "Primário", "Supervisiona a fila, cancela pedidos e restaura a demonstração.")],
           [3.6, 2.2, 10.2])

    quadro("Casos de uso identificados",
           ["UC", "Nome", "Atores"],
           UC,
           [1.6, 8.6, 5.8],
           font_size=8.5,
           align=["center", "left", "left"])

    h2("3.2 Descrição da funcionalidade: realizar pagamento")
    p("A funcionalidade escolhida para detalhamento é **UC-05 — Realizar pagamento**, porque concentra "
      "a simulação local de pagamento, o maior risco de falha e o ponto em que o cliente mais precisa "
      "de retorno visual.")

    p("**Descrição.** O cliente confirma o pedido e simula um pagamento por Pix ou cartão. Um componente "
      "local gera um retorno demonstrativo, que atualiza o estado visível do pedido.")
    p("**Atores.** Cliente e Sistemas de Pagamento Externos (conceitual). No protótipo, "
      "`PaymentSimulator` representa localmente os retornos do ator externo; nenhum serviço real é chamado.")
    p("**Pré-condições.**", space_after=2)
    numbered([
        "Existe um pedido com status `AGUARDANDO_PAGAMENTO` e código no formato RZ-####.",
        "O cliente informou nome, telefone, e-mail e horário de retirada.",
        "O valor total é maior que zero.",
    ])
    p("**Fluxo principal.**", space_after=2)
    numbered([
        "O cliente é direcionado para a tela de pagamento do pedido.",
        "O sistema exibe o resumo — código, total, unidade e horário — e o aviso de ambiente simulado.",
        "O cliente escolhe Pix ou cartão.",
        "No Pix, o sistema exibe um QR Code ilustrativo e um código copia e cola; no cartão, recebe "
        "número, nome, validade e CVV fictícios e valida o formato sem enviar os dados.",
        "A interface entra em estado de processamento, desabilita o formulário e informa que a página "
        "não deve ser fechada.",
        "O simulador local retorna aprovação.",
        "O sistema altera o pedido para RECEBIDO, registra o identificador da transação, credita os "
        "pontos e consome o cupom.",
        "A tela de sucesso exibe o código de retirada, o horário e os pontos ganhos, com a ação "
        "Acompanhar pedido.",
    ])
    p("**Fluxos alternativos.**")
    p("**A1 — Pagamento recusado.** O cartão terminado em 0000 é recusado de forma determinística pelo "
      "simulador local. O "
      "pedido passa a PAGAMENTO_RECUSADO, a tela informa o motivo e o número de tentativas e oferece "
      "nova tentativa com outro método. Nenhum ponto é creditado e o cupom não é consumido.")
    p("**A2 — Timeout.** A interface informa que o processamento continua e mantém o pedido em "
      "AGUARDANDO_PAGAMENTO, com o pagamento marcado como EXPIRADO. O cliente pode consultar pelo "
      "código ou tentar novamente; o estado é recuperável, não ambíguo.")
    p("**A3 — Erro de validação no cartão.** Número com menos de 13 dígitos, nome com menos de 3 "
      "caracteres, validade fora do formato MM/AA ou CVV com menos de 3 dígitos bloqueiam o envio "
      "antes de executar a simulação.")
    p("**A4 — Pedido já pago.** Ao reabrir o endereço, o sistema identifica status diferente de "
      "AGUARDANDO_PAGAMENTO e mostra o estado atual, sem permitir pagamento duplicado.")
    p("**A5 — Cancelamento durante o pagamento.** Se o pedido for cancelado no painel, a tela exibe "
      "CANCELADO e desabilita as ações.")
    p("**Pós-condições.** Em caso de sucesso, o pedido fica RECEBIDO, o pagamento APROVADO, os pontos "
      "são creditados e o cupom consumido. Em caso de recusa, o pedido fica PAGAMENTO_RECUSADO, sem "
      "crédito e sem consumo. Em caso de timeout, permanece AGUARDANDO_PAGAMENTO com pagamento "
      "EXPIRADO.")
    p("**Regras e requisitos relacionados.** RN-02, RN-08, RN-12 e RN-13; RF-10, RF-11 e RNF-11.")
    p("**Processamento do pagamento.** O ator externo é conceitual: em produção, uma solicitação "
      "seria enviada pelo backend a um provedor, que retornaria aprovação, recusa ou timeout. A "
      "aplicação entregue não implementa essa comunicação nem cobrança real. O componente "
      "`PaymentSimulator` roda localmente, com latência de 1,2 a 2,6 segundos, retorno determinístico "
      "e painel de testes. O pedido é "
      "criado antes do pagamento justamente para que o código exista e a operação enxergue pedidos "
      "ainda não pagos; reabrir a tela não cria um segundo pedido.")

    figure(DIAG / "pagamento-sequencia.png",
           "Sequência do caso de uso Realizar pagamento, com simulador local",
           21.0, landscape=True)
    ensure(False)

    h2("3.3 Jornada do usuário")
    p("A jornada cobre do primeiro contato com a marca até a retirada. O mapa organiza seis etapas em "
      "quatro faixas — ações do cliente, decisões, estados do sistema e integrações — para mostrar que "
      "cada ação tem uma consequência técnica e que cada integração aparece em um momento específico "
      "do percurso.")
    p("A leitura horizontal revela a curva emocional: curiosidade na descoberta, controle na montagem, "
      "desconfiança no checkout, ansiedade no pagamento e alívio na retirada. As duas maiores quedas "
      "estão exatamente onde o sistema pede dados pessoais e onde o cliente espera sem controle por "
      "um resultado de pagamento. As decisões de interface da seção 4 foram tomadas para reduzir "
      "essas duas quedas.")

    figure(DIAG / "jornada.png", "Mapa da jornada do cliente, do primeiro contato à retirada",
           23.5, landscape=True)
    ensure(False)

    p("A tabela abaixo detalha os mesmos momentos em linguagem textual. O diagrama agrupa o carrinho "
      "na etapa de montagem e o preparo com a retirada; a tabela separa esses momentos para registrar "
      "as decisões e os atritos de cada um. O pós-venda aparece como extensão, porque o diagrama "
      "encerra na retirada.")

    quadro("Jornada do cliente: ações, atritos e respostas da interface",
           ["Etapa", "Ação do cliente", "Emoção", "Atrito", "Resposta da interface"],
           JORNADA,
           [2.6, 4.3, 2.1, 3.2, 3.8],
           font_size=8.5,
           align=["left", "left", "left", "left", "left"])

    h2("3.4 Estados do pedido")
    p("O pedido tem sete estados e transições explícitas. Estados terminais — RETIRADO e CANCELADO — "
      "bloqueiam novas ações. A separação entre PAGAMENTO_RECUSADO e CANCELADO é intencional: o "
      "primeiro permite nova tentativa; o segundo encerra o pedido. Sem essa distinção, o cliente não "
      "saberia se pode pagar de novo.")
    p("O timeout não cria um estado próprio no pedido: ele mantém AGUARDANDO_PAGAMENTO e marca o "
      "pagamento como EXPIRADO. Essa escolha evita um estado “meio pago”, que não teria saída clara "
      "nem para o cliente nem para a operação.")

    figure(DIAG / "estados-pedido.png", "Máquina de estados do pedido e transições permitidas",
           22.4, landscape=True)
    ensure(False)

    quadro("Transições permitidas na máquina de estados",
           ["Origem", "Evento", "Destino", "Responsável"],
           TRANSICOES,
           [4.6, 4.0, 4.5, 2.9],
           font_size=8,
           align=["left", "left", "left", "left"])

    h2("3.5 Arquitetura da solução")
    p("A arquitetura é deliberadamente simples: uma aplicação React que concentra interface, estado e "
      "regras, com persistência no dispositivo e serviços mockados localmente. Não há backend, e isso "
      "é uma decisão de escopo, não uma limitação acidental. O objetivo é demonstrar o fluxo completo "
      "sem exigir infraestrutura de servidor para a correção.")
    p("O estado da aplicação — catálogo, carrinho, pedidos, sessão, pontos, consentimento e papel "
      "operacional — vive em um único contexto. As regras de preço, cupom, pontos e status são funções "
      "puras, separadas da interface. Em produção, o contexto seria substituído por chamadas "
      "autenticadas a uma API, e as permissões seriam validadas novamente no servidor.")

    figure(DIAG / "arquitetura.png", "Arquitetura da solução: canais, aplicação e serviços simulados",
           22.0, landscape=True)
    ensure(False)

    quadro("Camadas da solução e responsabilidades",
           ["Camada", "Responsabilidade", "Artefato principal"],
           [("Canais", "Web responsivo, moldura de aplicativo e totem em rota própria.", "Layout e rotas"),
            ("Interface", "Páginas, componentes, estados de tela e acessibilidade.", "src/pages e src/components"),
            ("Estado", "Carrinho, pedidos, sessão, pontos, consentimento e papel.", "AppContext"),
            ("Domínio", "Preço, cupom, pontos, status e permissões.", "config/rules.ts e lib/pricing.ts"),
            ("Persistência", "Dados mockados por dispositivo.", "localStorage"),
            ("Serviços simulados", "Catálogo mockado e pagamento local, sem gateway real.", "mocks e PaymentSimulator")],
           [3.2, 8.0, 4.8],
           font_size=8.5)

    h2("3.6 Navegação")
    p("O mapa de navegação separa três grupos: descoberta e pedido, conta e fidelidade, e operação e "
      "canais. As rotas de pedido são públicas para permitir compra sem cadastro; as de conta exigem "
      "sessão; o painel operacional usa um perfil simulado; o totem tem layout próprio e não "
      "compartilha o menu do site.")
    p("O acompanhamento e o pagamento são acessíveis por código no dispositivo em que o pedido foi "
      "salvo. Compartilhar o link não transfere os dados locais para outro dispositivo. Em publicação estática, o fallback de "
      "SPA garante que rotas profundas não retornem erro 404.")

    figure(DIAG / "navegacao.png", "Mapa de navegação da aplicação", 23.0, landscape=True)
    ensure(False)


# ---------------------------------------------------------------------------
# 4 Wireframes
# ---------------------------------------------------------------------------
def wireframes():
    h1("4 WIREFRAMES")

    h2("4.1 Método e convenções")
    p("Os wireframes são de baixa fidelidade: sem cor de marca, sem fotografia e sem tipografia "
      "definitiva. O objetivo é validar arquitetura de informação, hierarquia e fluxo antes de "
      "discutir estética. Foram desenhados dois conjuntos: mobile, em 390 × 844, e desktop, em "
      "1440 × 900. A escolha das duas larguras não é arbitrária — a primeira corresponde a um celular "
      "comum; a segunda, a um notebook de 14 polegadas.")
    p("Texto real aparece apenas onde a decisão de conteúdo importa: rótulos de ação, mensagens de "
      "erro, valores e estados. O restante é representado por blocos e linhas, para não desviar a "
      "atenção do fluxo. Cada frame tem um número, uma rota e anotações curtas; o conjunto completo, "
      "com mapa de fluxo e notas de decisão, está disponível em um documento HTML navegável no "
      "repositório.")
    p("Os frames foram exportados em duas vezes a resolução para manter a legibilidade na impressão. "
      "Na versão mobile, a barra verde de demonstração de canal aparece acima do cabeçalho e não faz "
      "parte do aplicativo: ela existe para o avaliador alternar entre Web, App e Totem.")

    h2("4.2 Fluxo mobile")
    p("O fluxo mobile foi desenhado para uso com uma mão, em pé. A ordem dos blocos é a ordem da "
      "decisão: unidade, cardápio, item, carrinho, dados, pagamento, acompanhamento. Nenhuma tela tem "
      "duas ações primárias.")

    pair_figure([WIRE / "mobile-01.png", WIRE / "mobile-02.png"],
                ["Início", "Cardápio"],
                "Telas de início e cardápio no canal mobile", 7.2)
    p("A unidade ativa aparece no cabeçalho das duas telas, porque preço e disponibilidade dependem "
      "dela. Na tela inicial, o hero tem uma única ação primária — ver cardápio — ao lado de uma "
      "ação secundária para trocar de unidade; a fidelidade fica no Clube Raízes, sem promoção "
      "paralela na home. No cardápio, busca e "
      "categorias ficam visíveis sem rolagem; a barra de carrinho só aparece quando há itens.")

    pair_figure([WIRE / "mobile-03.png", WIRE / "mobile-04.png"],
                ["Detalhe do produto", "Carrinho"],
                "Telas de detalhe do produto e carrinho no canal mobile", 7.2)
    p("No detalhe, o preço do botão já inclui os adicionais escolhidos — a principal dúvida registrada "
      "na jornada. O limite de adicionais é do produto, não global. No carrinho, itens com a mesma "
      "configuração somam quantidade, mas configurações diferentes permanecem separadas; o cupom é "
      "validado na hora e o erro aparece junto ao campo.")

    pair_figure([WIRE / "mobile-05.png", WIRE / "mobile-06.png"],
                ["Checkout", "Pagamento"],
                "Telas de checkout e pagamento no canal mobile", 7.2)
    p("O checkout concentra a maior queda emocional da jornada. Por isso o aviso de privacidade fica "
      "no corpo, perto do botão, com a finalidade e o link para a política — sem uma caixa obrigatória "
      "para criar o pedido. O resumo mostra subtotal, cupom, pontos e total antes da confirmação, e o limite de "
      "50% é explicado em texto de apoio. No pagamento, o aviso de ambiente simulado é permanente e o "
      "retorno tem três telas distintas: aprovado, recusado e não confirmado.")

    pair_figure([WIRE / "mobile-07.png", WIRE / "mobile-08.png"],
                ["Acompanhamento", "Fidelidade"],
                "Telas de acompanhamento e fidelidade no canal mobile", 7.2)
    p("O acompanhamento usa a mesma linguagem de status do painel operacional, com linha do tempo e "
      "horário previsto; a tela mostra o status salvo no dispositivo e não atualiza sozinha, então o "
      "cliente reabre ou recarrega para ver mudanças. Na fidelidade, a regra de "
      "conversão aparece antes das recompensas e cada recompensa sem saldo mostra quanto falta, em vez "
      "de desaparecer. O extrato registra ganho e resgate com o código do pedido.")

    pair_figure([WIRE / "mobile-09.png", WIRE / "mobile-10.png"],
                ["Perfil e privacidade", "Operação"],
                "Telas de perfil e painel operacional no canal mobile", 7.2)
    p("O perfil reúne dados cadastrais, consentimentos por finalidade, exportação e exclusão. A "
      "exclusão exige digitar uma palavra-chave, porque é irreversível. No painel operacional, o "
      "perfil ativo muda as ações disponíveis e explica o motivo quando uma ação está bloqueada; o "
      "gerente vê também a restauração dos dados de demonstração.")

    pair_figure([WIRE / "mobile-11.png", WIRE / "mobile-12.png"],
                ["Totem", "Confirmação"],
                "Telas de totem e confirmação do pedido", 7.2)
    p("O totem não tem menu de navegação e usa alvos ampliados. Solicita o primeiro nome e mostra "
      "um aviso de privacidade, sem exigir consentimento para avançar. Após a simulação de pagamento, "
      "o código fica em destaque e a tela retorna ao início "
      "automaticamente em 20 segundos; a pessoa também pode selecionar Novo atendimento para "
      "antecipar o retorno. A confirmação no site segue a mesma hierarquia: código, horário, unidade "
      "e pontos.")

    h2("4.3 Fluxo desktop")
    p("No desktop, a arquitetura de informação é a mesma; muda a distribuição. O catálogo ganha uma "
      "segunda coluna com o resumo do pedido, e o checkout mantém o resumo fixo ao lado do formulário. "
      "Essa decisão evita um fluxo paralelo: o usuário que começa no celular e termina no computador "
      "reconhece a mesma sequência.")

    figure(WIRE / "desktop-01.png", "Tela inicial no canal desktop", 19.5, landscape=True)
    p("O hero ocupa duas colunas e reserva a ação primária para o cardápio. A grade de quatro produtos "
      "por linha mantém a ordem de leitura e não transforma a página em catálogo infinito. O rodapé "
      "concentra canais, política de privacidade e o aviso de projeto acadêmico.")

    figure(WIRE / "desktop-02.png", "Cardápio com carrinho fixo no canal desktop", 19.5, landscape=True)
    p("O carrinho fixo à direita permite conferir o pedido sem perder o catálogo. Cupom e total ficam "
      "no mesmo bloco, e a informação de retirada no balcão aparece no rodapé do resumo — não existe "
      "entrega, e a interface não pode sugerir que exista.")

    figure(WIRE / "desktop-03.png", "Checkout no canal desktop", 19.5, landscape=True)
    p("O formulário ocupa a coluna principal e o resumo fica ao lado, com cupom, pontos e total em "
      "tempo real. O aviso de privacidade permanece no corpo, junto ao botão de confirmar. A validação é a "
      "mesma do mobile, com resumo dos erros e indicação por campo.")

    figure(WIRE / "desktop-04.png", "Painel operacional no canal desktop", 19.5, landscape=True)
    p("O painel separa perfil e fila em duas áreas: perfil à esquerda, fila à direita. Cada cartão "
      "mostra apenas as ações permitidas ao perfil ativo. Os indicadores no topo apoiam o gerente, mas "
      "não substituem a fila — a decisão operacional acontece no cartão do pedido.")
    ensure(False)

    h2("4.4 Decisões de interface")
    bullet("**Uma ação primária por tela.** Adicionar, ir ao checkout, pagar, acompanhar. As demais "
           "ações têm contorno e nunca competem por atenção.")
    bullet("**Estados sempre desenhados.** Vazio, carregando, erro, indisponível e sucesso fazem parte "
           "do wireframe, porque é onde o produto costuma falhar na implementação.")
    bullet("**Contexto de retirada em todo lugar.** Unidade e horário aparecem no cabeçalho, no "
           "checkout e na confirmação. Sem entrega, o pedido só faz sentido amarrado a uma loja e a "
           "um horário.")
    bullet("**LGPD no fluxo, não no rodapé.** O aviso de privacidade aparece no checkout e no totem; "
           "preferências opcionais podem ser revistas no perfil, com exportação e exclusão a um clique.")
    bullet("**Permissão visível.** O perfil ativo muda as ações e explica o bloqueio, em vez de esconder "
           "botões sem justificativa.")
    bullet("**Mobile-first, não mobile-only.** O mobile define a ordem e o tamanho dos alvos; o desktop "
           "redistribui os mesmos blocos em duas colunas.")


# ---------------------------------------------------------------------------
# 5 LGPD
# ---------------------------------------------------------------------------
def lgpd():
    h1("5 LGPD E PRIVACIDADE DA INTERFACE")

    h2("5.1 Princípios aplicados")
    p("A Lei nº 13.709/2018 (LGPD) estabelece princípios que precisam aparecer no produto, não apenas "
      "na política. Neste projeto, cinco deles orientaram decisões concretas: **finalidade** (os avisos "
      "explicam o uso dos dados), **necessidade** (os campos correspondem ao fluxo do pedido), "
      "**transparência** (a política e as escolhas opcionais ficam acessíveis), **segurança** (dados "
      "de pedido armazenados localmente, sem envio a API ou gateway configurados) e **prestação de "
      "contas** (preferências opcionais têm versão e data). A hospedagem entrega os arquivos estáticos; "
      "a afirmação sobre ausência de envio refere-se aos dados inseridos nos formulários.")
    p("Nome, telefone e e-mail são solicitados no checkout para preparar, liberar e informar sobre a "
      "retirada. Marketing e analytics são opcionais, começam desligados e podem ser revogados. Nesta "
      "demonstração, suas escolhas ficam no navegador, sem serviço de analytics ou envio de ofertas.")

    h2("5.2 Avisos e preferências na interface")
    p("No primeiro acesso, um banner oferece aceitar todos, somente essenciais ou abrir as preferências "
      "por finalidade. Checkout e totem exibem um aviso sobre o armazenamento local e um link para a "
      "política; não exigem uma caixa de consentimento para criar pedido. No perfil, o cliente revê e "
      "altera as escolhas opcionais de analytics e marketing.")
    p("A versão, a data e as escolhas são registradas nas preferências do usuário, não como autorização "
      "do pedido. O teste T-07 verifica que escolher somente essenciais não impede a compra. O relatório "
      "usa execução de contrato como hipótese documental para os dados necessários ao pedido; a caixa "
      "removida não era nem é apresentada como base legal. Esta descrição acadêmica não é parecer jurídico.")

    figure(DIAG / "lgpd.png", "Consentimento, finalidades e direitos do titular na interface",
           23.0, landscape=True)
    ensure(False)

    h2("5.3 Dados pessoais e direitos do titular")
    p("A tabela abaixo relaciona cada dado coletado à finalidade, à base legal e ao prazo de "
      "permanência. O princípio aplicado é o da minimização: se o dado não sustenta uma finalidade "
      "concreta, ele não é coletado.")

    quadro("Dados coletados, finalidades e bases legais",
           ["Dado", "Finalidade", "Base legal (hipótese acadêmica)", "Permanência"],
           [("Nome, telefone e e-mail", "Preparar, liberar e informar sobre a retirada", "Execução de contrato (art. 7º, V)", "Até a exclusão da conta"),
            ("Unidade, itens e horário", "Produção e conferência no balcão", "Execução de contrato (art. 7º, V)", "Até a exclusão da conta"),
            ("Histórico e pontos", "Fidelidade e atendimento", "Execução de contrato (art. 7º, V)", "Até a exclusão da conta"),
            ("Preferências opcionais (versão e data)", "Registrar escolhas; sem serviço externo conectado", "Consentimento opcional", "Até a revogação"),
            ("Estado da simulação de pagamento", "Demonstrar o fluxo; sem transação real", "Não se aplica a pagamento real", "Até a exclusão dos dados")],
           [3.4, 4.6, 4.8, 3.2],
           font_size=8.5)

    p("As bases indicadas são hipóteses para fins acadêmicos e não constituem parecer jurídico. Os "
      "direitos do titular são exercíveis na própria interface, sem canal de atendimento "
      "intermediário. Isso reduz atrito e torna a conformidade verificável: o avaliador consegue "
      "exportar e excluir os dados em poucos cliques.")

    quadro("Direitos do titular e forma de atendimento",
           ["Direito (art. 18)", "Como é atendido", "Onde"],
           [("Confirmação e acesso", "Dados cadastrais e histórico visíveis na conta", "Perfil e Meus pedidos"),
            ("Correção", "Edição de nome e telefone", "Perfil"),
            ("Portabilidade", "Exportação em JSON com cadastro, pedidos e consentimentos", "Perfil"),
            ("Eliminação", "Exclusão da conta e dos dados, com confirmação por palavra-chave", "Perfil"),
            ("Revogação do consentimento", "Alternância de analytics e marketing", "Perfil e preferências"),
            ("Informação sobre tratamento", "Política de privacidade com finalidades e bases legais", "Página de privacidade")],
           [3.6, 8.8, 3.6],
           font_size=8.5)

    h2("5.4 Limites do modelo e riscos")
    p("Como não há backend, os dados de pedido ficam no localStorage do navegador e a aplicação não "
      "os envia a uma API ou gateway de pagamento. Os arquivos estáticos são entregues pelo provedor "
      "de hospedagem; portanto, esta descrição se limita aos dados preenchidos nos formulários. Isso "
      "não substitui controles reais de segurança: não há criptografia em repouso, autenticação forte "
      "nem trilha de auditoria em servidor. Em produção, as escolhas opcionais seriam registradas "
      "com carimbo de tempo, a "
      "exportação seria assíncrona e a exclusão precisaria alcançar backups e sistemas integrados.")
    p("A política de privacidade é um modelo acadêmico e está identificada como tal. Ela não substitui "
      "parecer jurídico nem define um encarregado real de dados. O objetivo é demonstrar que a LGPD "
      "foi tratada como requisito de interface — com aviso, escolhas opcionais e saída — e não como "
      "parágrafo de rodapé.")


# ---------------------------------------------------------------------------
# 6 Entrega técnica
# ---------------------------------------------------------------------------
def entrega():
    h1("6 ENTREGA TÉCNICA")

    h2("6.1 Opção B e stack")
    p("A entrega adota a **Opção B — Codificação**, com dados mockados, repositório Git e publicação "
      "estática. A escolha foi feita porque o protótipo navegável não permitiria demonstrar validação "
      "de formulário, cálculo de pontos, máquina de estados e persistência com a mesma fidelidade de "
      "uma aplicação real. Além disso, o código é verificável: o avaliador pode ler as regras, rodar o "
      "projeto e testar os cenários deste documento.")

    quadro("Stack e justificativa das escolhas",
           ["Camada", "Escolha", "Motivo"],
           [("Interface", "React 18 + TypeScript", "Componentes tipados, sem dependência de framework visual."),
            ("Build", "Vite 5", "Servidor de desenvolvimento rápido e build estático simples de publicar."),
            ("Rotas", "React Router 6", "Rotas aninhadas, layout compartilhado e proteção por sessão."),
            ("Estado", "Context API", "Um único estado de aplicação, sem biblioteca adicional."),
            ("Persistência", "localStorage", "Simula backend e mantém a demonstração entre recargas."),
            ("Estilo", "CSS próprio, mobile-first", "Controle de layout, foco e contraste sem peso de UI kit."),
            ("Ícones", "SVG inline", "Sem requisições extras nem dependência de fonte de ícones.")],
           [2.6, 4.2, 9.2],
           font_size=8.5)

    h2("6.2 Estrutura do código e rotas")
    p("A organização separa o que é domínio do que é tela. As regras de preço, cupom, pontos e status "
      "ficam em módulos puros; o contexto coordena o estado; as páginas apenas compõem componentes e "
      "chamam ações. Essa divisão permite testar as contas sem renderizar React e evita que duas telas "
      "cheguem a totais diferentes.")

    code_block([
        "raizes-do-nordeste/",
        "  public/              _redirects, icone e manifest",
        "  src/",
        "    components/        header, nav, cards, pagamento, timeline",
        "    config/rules.ts    pontos, limite de 50%, antecedencia, versao",
        "    context/           estado da aplicacao, pedidos, sessao, LGPD",
        "    lib/               precos, formatacao, status, persistencia",
        "    mocks/             19 produtos, 6 categorias, 3 unidades, cupons",
        "    pages/             18 telas",
        "    styles/            tokens e CSS global",
        "    App.tsx            rotas",
        "  docs/                diagramas, wireframes, requisitos, testes",
        "  vercel.json          fallback de SPA",
    ])

    quadro("Rotas da aplicação",
           ["Rota", "Tela", "Acesso"],
           ROTAS,
           [4.4, 6.6, 5.0],
           font_size=8.5,
           align=["left", "left", "left"])

    h2("6.3 Como executar e publicar")
    p("Pré-requisitos: Node.js 18 ou superior e npm. O build executa a checagem de tipos antes de "
      "gerar os arquivos estáticos; portanto, um erro de TypeScript impede a publicação.")
    code_block([
        "npm install",
        "npm run dev      # http://localhost:5173",
        "npm run build    # checagem de tipos + build em dist/",
        "npm run preview  # serve o build local",
    ])
    p("A aplicação está publicada na Vercel e o repositório Git é público. Os endereços estão "
      "registrados na tabela abaixo para acesso à demonstração e ao código.")

    quadro("Links da entrega",
           ["Item", "Endereço"],
           [("Aplicação publicada", DEPLOY_URL),
            ("Repositório público", REPO_URL),
            ("Documento final", f"{FILE_STEM}.pdf"),
            ("Wireframes navegáveis", "docs/WIREFRAMES.html")],
           [4.2, 11.8],
           font_size=9,
           source="Fonte: elaborado pelo autor (2026).")

    h2("6.4 Dados de demonstração")
    p("A conta de cliente já vem com 120 pontos, histórico e preferências registradas. O painel "
      "operacional não exige login: o perfil é trocado no próprio painel e começa como atendente. Os "
      "cupons cobrem os casos positivo e negativo, e o cartão terminado em 0000 permite testar a "
      "recusa de forma repetível.")

    quadro("Cupons disponíveis na demonstração",
           ["Código", "Regra", "Mínimo"],
           [("RAIZES10", "10% de desconto", "R$ 30,00"),
            ("NORDESTE5", "R$ 5,00 de desconto", "R$ 25,00"),
            ("BEMVINDO15", "15% de desconto", "R$ 40,00"),
            ("EXPIRADO2024", "expirado de propósito (teste de erro)", "—")],
           [3.2, 8.4, 4.4],
           font_size=9)

    p("**Cliente:** cliente@raizes.com / raizes123. **Operação:** rota /operacao, sem senha. "
      "**Cartão:** qualquer número com 13 a 16 dígitos é aprovado, exceto os terminados em 0000, que "
      "são recusados. O botão Simular timeout mantém o pedido aguardando pagamento. Nenhum dado de "
      "cartão é armazenado.")

    h2("6.5 Limitações declaradas")
    bullet("**Sem backend:** os dados ficam no dispositivo; dois navegadores não compartilham pedidos.")
    bullet("**Pagamento simulado:** não há adquirente, PCI-DSS nem webhook real.")
    bullet("**Perfis simulados:** as permissões são aplicadas no cliente e podem ser contornadas.")
    bullet("**Notificações:** o aviso de pedido pronto é visual; não há push, e-mail ou WhatsApp.")
    bullet("**Testes automatizados:** a validação é manual; as funções puras estão isoladas para "
           "receber Vitest e Playwright em uma próxima etapa.")


# ---------------------------------------------------------------------------
# 7 Plano de testes
# ---------------------------------------------------------------------------
def testes():
    h1("7 PLANO DE TESTES")

    p("Este plano reúne 22 cenários funcionais e verificações de regras de negócio, usabilidade, "
      "responsividade e privacidade. Os 22 cenários funcionais foram executados na interface local; "
      "T-07 e T-21 foram reexecutados após a remoção do aceite obrigatório. "
      "Os resultados observados estão registrados na seção 7.3. A inspeção heurística foi realizada "
      "na aplicação publicada em 29/10/2026; H-01 foi corrigido e retestado. As demais verificações "
      "de acessibilidade permanecem pendentes.")

    h2("7.1 Estratégia e ambiente")
    quadro("Níveis de validação",
           ["Nível", "Como foi feito", "Evidência"],
           [("Funcional", "Interface local com automação Playwright.", "22 cenários aprovados"),
            ("Regras de negócio", "Casos de borda de cupom, pontos e quantidade.", "Valores conferidos em T-04, T-05, T-08 e T-09"),
            ("Usabilidade", "Inspeção heurística em 390 × 844 e 1440 × 900.", "Registrada; H-01 corrigido e retestado"),
            ("Responsividade", "Seis rotas em quatro larguras.", "Sem overflow horizontal"),
            ("Acessibilidade", "Checkout por teclado e foco visível.", "Pedido concluído; sem auditoria automatizada"),
            ("Privacidade", "Preferências opcionais, exportação e exclusão.", "Fluxos verificados em T-17 e T-18")],
           [3.0, 7.4, 5.6],
           font_size=8.5)
    p("Ambiente: Windows; navegador integrado ao VS Code (Chromium 150.0.7871.250, Electron "
      "43.8.3); Node.js v24.22.0; aplicação servida pelo Vite em http://127.0.0.1:5173. Os dados "
      "locais foram limpos ou restaurados entre blocos, exceto nos cenários que exigiam estado "
      "acumulado, como cupom reutilizado e resgate de pontos.")

    h2("7.2 Cenários executados", landscape=True)
    quadro("Cenários de teste da interface",
           ["ID", "Cenário", "Dados de entrada", "Resultado esperado", "Situação"],
           TESTES,
           [1.3, 5.3, 6.2, 9.8, 2.0],
           font_size=7.5,
           landscape=True,
           pad=0.0,
           align=["center", "left", "left", "left", "center"])
    ensure(False)

    h2("7.3 Resultados da execução")
    quadro("Evidências observadas por cenário",
           ["ID", "Resultado"],
           RESULTADOS_TESTES,
           [1.5, 14.5],
           font_size=8.5)
    p("Os resultados correspondem à interface local e não representam teste com usuários, auditoria "
      "automatizada de acessibilidade ou compatibilidade com navegadores diferentes do ambiente registrado.")

    h2("7.4 Mensagens previstas no código")
    p("As mensagens foram escritas para dizer o que aconteceu e o que fazer, sem culpar o usuário. "
      "Cada campo inválido recebe aria-invalid e uma mensagem associada; o foco vai para o primeiro "
      "campo com erro e o resumo no topo permite corrigir tudo de uma vez.")

    quadro("Mensagens de erro e condição que as dispara",
           ["Contexto", "Mensagem", "Condição"],
           MENSAGENS,
           [2.8, 9.4, 3.8],
           font_size=8.5)

    h2("7.5 Avaliação heurística")
    p("A inspeção heurística foi realizada em 29/10/2026 na aplicação publicada, nos viewports de "
      "390 × 844 px e 1440 × 900 px. Foram percorridos início, seleção de unidade, cardápio, detalhe "
      "do produto, carrinho, checkout com erros de validação e pagamento aprovado/reaberto. Trata-se "
      "de avaliação individual e não substitui teste com usuários.")

    quadro("Resultados da inspeção heurística",
           ["#", "Heurística", "Verificação", "Situação"],
           HEURISTICAS,
           [1.2, 3.2, 3.0, 6.6],
           font_size=8.5,
           align=["center", "left", "left", "left"])

    p("**H-01 — corrigido e retestado:** a inspeção inicial identificou que o toast de validação e "
      "um toast anterior de item adicionado podiam cobrir parcialmente os campos junto à navegação "
      "inferior no checkout mobile. A correção dispensa os toasts ativos quando o envio é bloqueado "
      "e mantém o resumo geral e as mensagens específicas no formulário. No reteste a 390 × 844 px, "
      "após adicionar um item e enviar o checkout vazio, não havia toast visível; o resumo e os "
      "campos permaneceram legíveis, sem sobreposição com a navegação fixa.")
    p("**Demais observações:** a unidade selecionada permanece identificada no fluxo; pagamento "
      "aprovado não pode ser processado novamente após recarga; as novas tentativas de T-11 e T-12 "
      "estão disponíveis; o checkout informa login e limite de 50% para resgate de pontos. A palavra "
      "\"comanda\" aparece na confirmação de pagamento e pode ser padronizada com \"pedido\". Os "
      "avisos identificam claramente a simulação, embora os controles de teste também fiquem visíveis. "
      "O seletor de canal não compete com a navegação principal, o foco por teclado tem contorno visível "
      "de 2 px e as mensagens de erro aparecem junto aos campos.")

    h2("7.5.1 Teste exploratório com usuários")
    quadro("Registro do teste exploratório",
           ["Item", "Descrição"],
           [("Data", "29/10/2026"),
            ("Aplicação", "Versão publicada na Vercel"),
            ("Participantes", "6 colegas de trabalho"),
            ("Tarefas", "Montar pedido; aplicar cupom; trocar de unidade; testar cupom inválido; consultar privacidade; acompanhar pedido"),
            ("Resultado relatado", "Nenhum participante identificou bug, erro ou mau funcionamento"),
            ("Métricas", "Tempo, conclusão sem ajuda e satisfação não foram medidos formalmente"),
            ("Limitação", "Perfil demográfico, desempenho individual e evidências por tarefa não foram registrados")],
           [3.2, 12.8],
           font_size=8.5)
    p("O resultado é exploratório: não comprova ausência de defeitos nem representa validação "
      "estatística de usabilidade. A inspeção individual H-01 identificou uma sobreposição no "
      "checkout mobile, que foi corrigida e retestada depois do teste com participantes.")
    p("Em um próximo ciclo, podem ser medidos conclusão sem ajuda, tempo por tarefa e satisfação "
      "em escala de 1 a 5, além de investigar a compreensão do código de retirada, do limite de "
      "50% em pontos e da localização das opções de privacidade.")

    h2("7.6 Responsividade e acessibilidade")
    quadro("Verificações de responsividade e acessibilidade",
           ["Verificação", "Método", "Resultado"],
           RESPONSIVIDADE,
           [3.4, 7.0, 5.6],
           font_size=8.5)

    p("Rolagem horizontal, foco visível e percurso por teclado foram verificados em T-22. A "
      "sobreposição de toast no checkout mobile foi corrigida e retestada em H-01. Alvos de toque, "
      "estrutura semântica, contraste e movimento reduzido continuam pendentes.")

    h2("7.7 Riscos residuais")
    quadro("Riscos residuais e mitigações",
           ["Risco", "Impacto", "Mitigação"],
           RISCOS,
           [3.8, 6.0, 6.2],
           font_size=8.5)


# ---------------------------------------------------------------------------
# 8 Conclusão
# ---------------------------------------------------------------------------
def conclusao():
    h1("8 CONCLUSÃO")
    p("Foi implementado um protótipo front-end para pedidos com retirada em três unidades fictícias. "
      "O sistema inclui catálogo por unidade, carrinho, checkout, pagamento simulado, acompanhamento "
      "do pedido, fidelidade, painel operacional e controles de privacidade. Os dados ficam no "
      "navegador e não existe integração com serviço de pagamento ou backend.")
    p("Os 22 cenários funcionais foram executados e aprovados na interface local. A inspeção "
      "heurística foi registrada; o achado H-01 foi corrigido e retestado no checkout mobile. Um "
      "teste exploratório com seis usuários não identificou bugs, erros ou mau funcionamento, embora "
      "não tenham sido coletadas métricas formais. As verificações restantes de acessibilidade ainda "
      "precisam ser feitas antes de concluir sobre acessibilidade.")
    p("Para uso fora de uma "
      "demonstração, também seriam necessários backend, autenticação no servidor e integração real "
      "com o meio de pagamento.")


# ---------------------------------------------------------------------------
# Referências
# ---------------------------------------------------------------------------
def referencias():
    h1("REFERÊNCIAS")

    refs = [
        "ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. **NBR 14724**: informação e documentação: trabalhos acadêmicos: apresentação. Rio de Janeiro: ABNT, 2011.",
        "ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. **NBR 6023**: informação e documentação: referências: elaboração. Rio de Janeiro: ABNT, 2018.",
        "ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. **NBR 6027**: informação e documentação: sumário: apresentação. Rio de Janeiro: ABNT, 2012.",
        "ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. **NBR 6028**: informação e documentação: resumo: apresentação. Rio de Janeiro: ABNT, 2021.",
        "ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. **NBR 10520**: informação e documentação: citações em documentos: apresentação. Rio de Janeiro: ABNT, 2023.",
        "AUTORIDADE NACIONAL DE PROTEÇÃO DE DADOS. **Guia orientativo sobre segurança da informação para agentes de tratamento de pequeno porte**. Brasília, DF: ANPD, 2022.",
        "BRASIL. **Lei nº 12.965, de 23 de abril de 2014**. Estabelece princípios, garantias, direitos e deveres para o uso da Internet no Brasil. Brasília, DF: Presidência da República, 2014.",
        "BRASIL. **Lei nº 13.709, de 14 de agosto de 2018**. Lei Geral de Proteção de Dados Pessoais (LGPD). Brasília, DF: Presidência da República, 2018. Disponível em: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm. Acesso em: 28 out. 2026.",
        "GIL, Antonio Carlos. **Como elaborar projetos de pesquisa**. 6. ed. São Paulo: Atlas, 2017.",
        "KRUG, Steve. **Não me faça pensar**: uma abordagem de bom senso à usabilidade na web e mobile. 2. ed. Rio de Janeiro: Alta Books, 2014.",
        "MICROSOFT. **TypeScript documentation**. [S. l.]: Microsoft, 2024. Disponível em: https://www.typescriptlang.org/docs. Acesso em: 28 out. 2026.",
        "MOZILLA. **MDN Web Docs**: Window.localStorage. [S. l.]: Mozilla, 2024. Disponível em: https://developer.mozilla.org/pt-BR/docs/Web/API/Window/localStorage. Acesso em: 28 out. 2026.",
        "NIELSEN, Jakob. **Usability engineering**. San Francisco: Morgan Kaufmann, 1994.",
        "OWASP FOUNDATION. **OWASP Top 10:2021**. [S. l.]: OWASP, 2021. Disponível em: https://owasp.org/Top10/. Acesso em: 28 out. 2026.",
        "REACT. **React documentation**. [S. l.]: Meta, 2024. Disponível em: https://react.dev. Acesso em: 28 out. 2026.",
        "SOMMERVILLE, Ian. **Engenharia de software**. 10. ed. São Paulo: Pearson, 2019.",
        "VITE. **Vite documentation**. [S. l.]: Evan You, 2024. Disponível em: https://vite.dev. Acesso em: 28 out. 2026.",
        "W3C. **Web Content Accessibility Guidelines (WCAG) 2.2**. [S. l.]: W3C, 2023. Disponível em: https://www.w3.org/TR/WCAG22/. Acesso em: 28 out. 2026.",
    ]
    for item in refs:
        paragraph = doc.add_paragraph()
        add_runs(paragraph, item, size=12)
        pf = paragraph.paragraph_format
        pf.alignment = WD_ALIGN_PARAGRAPH.LEFT
        pf.first_line_indent = Cm(0)
        pf.left_indent = Cm(0)
        pf.space_before = Pt(0)
        pf.space_after = Pt(12)
        pf.line_spacing = 1.0


# ---------------------------------------------------------------------------
# Apêndice A
# ---------------------------------------------------------------------------
def apendice():
    h1("APÊNDICE A — DECLARAÇÃO DE USO DE FERRAMENTAS DE INTELIGÊNCIA ARTIFICIAL")
    p("Em conformidade com as orientações da atividade, declaro o uso de ferramenta de inteligência "
      "artificial generativa no apoio ao desenvolvimento deste projeto. O uso ocorreu de forma "
      "assistida: a ferramenta não substituiu o estudo, as decisões de projeto ou a validação dos "
      "artefatos.")

    quadro("Ferramentas utilizadas e finalidade",
           ["Ferramenta", "Finalidade", "Etapas"],
           [("Agente de codificação com modelo de linguagem (OpenCode)", "Apoio à implementação, revisão de texto e geração de scripts auxiliares", "Estrutura do projeto, componentes, CSS, diagramas, revisão e plano de testes")],
           [3.8, 6.4, 5.8],
           font_size=8.5,
           align=["left", "left", "left"])

    p("**Objetivos de uso.** A ferramenta foi usada para: (i) gerar o esqueleto inicial do projeto "
      "React com TypeScript e Vite; (ii) apoiar a escrita de componentes, estilos e funções de "
      "domínio; (iii) produzir os scripts Python que desenham os diagramas em SVG e exportam as "
      "imagens; (iv) revisar a redação dos documentos e a consistência entre requisitos, telas e "
      "testes; e (v) organizar o plano de testes.")
    p("**Prompts representativos.** Os pedidos feitos à ferramenta foram, em resumo:")
    numbered([
        "“Estruture uma aplicação React com TypeScript e Vite para o estudo de caso, com rotas, contexto "
        "e dados mockados.”",
        "“Revise as mensagens de erro do checkout para que sejam específicas por campo e acessíveis.”",
        "“Gere um script Python que desenhe os diagramas em SVG com tipografia legível em A4.”",
        "“Revise a redação da seção de LGPD e verifique a coerência com as telas implementadas.”",
        "“Monte um plano de testes com cenários positivos e negativos, entradas e saídas esperadas.”",
    ])
    p("**Trechos aproveitados e revisão.** Foram aproveitados trechos de código, textos de apoio e "
      "scripts, todos lidos e ajustados pelo autor. As decisões de escopo, as regras de negócio, a "
      "priorização dos requisitos e a redação final foram definidas e revisadas pelo autor. Nenhum "
      "dado real de cliente foi utilizado; todos os dados são fictícios.")
    p("**Limitações e responsabilidade.** A ferramenta não tem acesso ao contexto da instituição, às "
      "normas internas nem ao julgamento sobre o que é adequado ao estudo de caso. Todo o conteúdo "
      "foi conferido contra o enunciado e contra a aplicação implementada. Assumo a responsabilidade "
      "pelo material entregue e pelas escolhas nele registradas.", keep_next=True)

    p(f"{CIDADE}, {DATA_ENTREGA}.", indent=False, align="left",
      space_before=30, keep_next=True)
    p("______________________________________________", indent=False, align="left",
      space_before=42, keep_next=True)
    p(ALUNO, indent=False, align="left", keep_next=True)
    p(f"RU {RU}", indent=False, align="left")


# ---------------------------------------------------------------------------
# Exportação
# ---------------------------------------------------------------------------
def update_word_document(create_pdf: bool):
    try:
        import win32com.client  # type: ignore
    except Exception:
        print("pywin32 indisponível: DOCX gerado, PDF não exportado.")
        return

    word = None
    document = None
    try:
        word = win32com.client.DispatchEx("Word.Application")
        word.Visible = False
        word.DisplayAlerts = 0
        document = word.Documents.Open(str(OUT_DOCX), ReadOnly=False)
        document.Fields.Update()
        for toc in document.TablesOfContents:
            toc.Update()
            toc.Range.Font.Name = "Arial"
            toc.Range.Font.Size = 12
            toc.Range.ParagraphFormat.SpaceAfter = 6
            toc.Range.ParagraphFormat.LineSpacingRule = 0
        document.Repaginate()
        for toc in document.TablesOfContents:
            toc.Update()
        # Salva o DOCX com o sumário já preenchido: o texto provisório só
        # aparecia porque as alterações do Word eram descartadas ao fechar.
        document.Save()
        if create_pdf:
            document.SaveAs2(str(OUT_PDF), FileFormat=17)
            print(f"PDF gerado: {OUT_PDF}")
        print(f"DOCX salvo com o sumário atualizado: {OUT_DOCX}")
    finally:
        if document is not None:
            document.Close(False)
        if word is not None:
            word.Quit()


def main():
    configure_styles()
    pre_textual()
    introducao()
    requisitos()
    diagramas()
    wireframes()
    lgpd()
    entrega()
    testes()
    conclusao()
    referencias()
    apendice()

    props = doc.core_properties
    props.title = "Rede Raízes do Nordeste — projeto de interface multicanal"
    props.subject = "Projeto Multidisciplinar — Trilha Front-End"
    props.author = ALUNO
    props.keywords = "interface; multicanalidade; LGPD; React; pagamento"
    props.comments = "Documento gerado por docs/tools/build_report.py"

    doc.save(OUT_DOCX)
    print(f"DOCX gerado: {OUT_DOCX}")
    if "--no-pdf" not in sys.argv:
        update_word_document(create_pdf=True)
    elif "--update-docx" in sys.argv:
        update_word_document(create_pdf=False)

    # Aviso: o script não apaga entregas antigas. Nome diferente do RU atual
    # costuma virar o arquivo errado no momento de enviar o trabalho.
    antigos = sorted(
        p for p in ROOT.glob("*_Projeto_Front_End.*")
        if p.suffix.lower() in {".pdf", ".docx"} and p.stem != FILE_STEM
    )
    if antigos:
        print("\nATENÇÃO: existem arquivos de uma geração anterior nesta pasta.")
        print("Confira qual é o correto antes de enviar e apague os demais:")
        for p in antigos:
            print(f"  - {p.name}")


if __name__ == "__main__":
    main()
