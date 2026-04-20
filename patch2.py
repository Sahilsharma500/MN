import re

with open('src/components/ReportScreen.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("import html2canvas from 'html2canvas';", "import * as htmlToImage from 'html-to-image';")

# Find the block from `const canvas = await html2canvas` up to `const imgHeight = ...;`
pattern1 = re.compile(r"const canvas = await html2canvas[\s\S]*?const imgHeight = .*?;", re.MULTILINE)

replacement = """      // Temporarily hide buttons from the capture
      const buttons = element.querySelectorAll('button');
      buttons.forEach(btn => btn.style.display = 'none');
      
      const imgData = await htmlToImage.toPng(element, {
        backgroundColor: '#ffffff',
        style: {
          borderRadius: '0px',
          boxShadow: 'none',
        }
      });
      
      buttons.forEach(btn => btn.style.display = '');
      
      const img = new Image();
      img.src = imgData;
      await new Promise(resolve => img.onload = resolve);
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pageWidth;
      const imgHeight = (img.height * pageWidth) / img.width;"""

text = pattern1.sub(replacement, text)

with open('src/components/ReportScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Replaced", len(pattern1.findall(text)), "occurrences.")
