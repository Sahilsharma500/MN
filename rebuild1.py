import re

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

content = read_file('src/components/ReportScreen.tsx')

# 1. Add parsing function inside the component, before the first return
helper_code = """
  const getParsedContent = (content: string) => {
    const match = content.match(/\\n(#{1,3}\\s+\\*?(?:Our Journey Together|Dimension Analysis)\\*?|\\*\\*Our Journey Together\\*\\*|\\*\\*Dimension Analysis\\*\\*)/i);
    if (match && match.index !== undefined) {
      return {
        page1Content: content.substring(0, match.index).trim(),
        page2Content: content.substring(match.index).trim()
      };
    }
    return { page1Content: content, page2Content: null };
  };

  const parsed = currentReport ? getParsedContent(currentReport.content) : null;
"""
# insert right after `const [isExporting, setIsExporting] = useState(false);`
content = content.replace("const [isExporting, setIsExporting] = useState(false);", "const [isExporting, setIsExporting] = useState(false);\n" + helper_code)

# 2. Rewrite the pdf logic block
pdf_replacement = """
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const captureAndAddPage = async (elementId: string, isFirstPage: boolean) => {
        const pageEl = document.getElementById(elementId);
        if (!pageEl) return;
        
        const imgData = await htmlToImage.toPng(pageEl, {
          backgroundColor: '#ffffff',
          style: {
            borderRadius: '0px',
            boxShadow: 'none',
            margin: '0',
          }
        });
        
        const img = new Image();
        img.src = imgData;
        await new Promise(resolve => img.onload = resolve);
        
        let drawWidth = pageWidth;
        let drawHeight = (img.height * pageWidth) / img.width;
        
        if (drawHeight > pageHeight) {
          const ratio = pageHeight / drawHeight;
          drawHeight = drawHeight * ratio * 0.98;
          drawWidth = drawWidth * ratio * 0.98;
        }
        
        if (!isFirstPage) {
          pdf.addPage();
        }
        
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        
        const xPos = (pageWidth - drawWidth) / 2;
        const yPos = 5; // tiny top margin
        
        pdf.addImage(imgData, 'PNG', xPos, yPos, drawWidth, drawHeight);
      };

      const buttons = document.querySelectorAll('button');
      buttons.forEach(btn => btn.style.display = 'none');

      await captureAndAddPage('pdf-page-1', true);
      const p2 = document.getElementById('pdf-page-2');
      if (p2) await captureAndAddPage('pdf-page-2', false);
      const p3 = document.getElementById('pdf-page-3');
      if (p3) await captureAndAddPage('pdf-page-3', false);

      buttons.forEach(btn => btn.style.display = '');"""

# I need to replace the body of both `downloadReportAsPDF` and `shareReport` with the new logic.
download_pattern = re.compile(r"try \{(.*?)const fileName = `MindGarden_Report_", re.DOTALL)
content = download_pattern.sub("try {" + pdf_replacement + "\n      const fileName = `MindGarden_Report_", content, count=1)

share_pattern = re.compile(r"try \{(.*?)const pdfBlob = pdf\.output\('blob'\);", re.DOTALL)
# However, wait. The shareReport will be the first match now if I used `sub` normally because download is already replaced?
# Actually just match exactly the identical block using regex by searching between `const element = reportRef.current;` and `const pdfBlob = pdf.output...` OR `const fileName =`

# Instead, let's use a robust string replace since the block is identical in both functions
old_logic_pattern = re.compile(r"(const element = reportRef\.current;[\s\S]*?)(const fileName =|const pdfBlob =)")

def repl_func(m):
    return pdf_replacement + "\n      " + m.group(2)

# It will match both places because they both use `const element = reportRef.current;`
content = old_logic_pattern.sub(repl_func, content)

# 3. Restructure JSX Layout
# From `<div ref={reportRef}...><div className="bg-emerald-900` ... to `)}</section>`
# We will just write a big regex for the JSX, or replace the whole file entirely.
"""It is often much safer to replace the whole JSX tree."""

write_file('src/components/ReportScreen.tsx', content)
print("done")
