import re
import os

with open('src/components/ReportScreen.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace import
content = content.replace("import html2canvas from 'html2canvas';", "import * as htmlToImage from 'html-to-image';")

# Replace PDF generation logic
pdf_replacement = """
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
      const imgHeight = (img.height * pageWidth) / img.width;
"""

import_to_replace_pdf = """
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: '#ffffff',
        scrollY: 0,
        height: element.scrollHeight,
        windowHeight: element.scrollHeight,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('[data-report-container]') as HTMLElement;
          if (clonedElement) {
            clonedElement.style.height = 'auto';
            clonedElement.style.overflow = 'visible';
            clonedElement.style.borderRadius = '0';
            clonedElement.style.boxShadow = 'none';
          }
          
          const allElements = clonedDoc.getElementsByTagName('*');
          for (let i = 0; i < allElements.length; i++) {
            const el = allElements[i] as HTMLElement;
            if (typeof el.className === 'string' && (el.className.includes('backdrop-blur') || el.className.includes('bg-white/'))) {
              el.style.backdropFilter = 'none';
              (el.style as any).webkitBackdropFilter = 'none';
              if (el.className.includes('bg-white/')) {
                el.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              }
            }
          }

          const buttons = clonedDoc.querySelectorAll('button');
          buttons.forEach(btn => btn.style.display = 'none');
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;
"""
# Make the replace robust by replacing spacing and newlines
def normalize(s):
    return re.sub(r'\s+', '', s)

content = content.replace(import_to_replace_pdf.strip(), pdf_replacement.strip())
if import_to_replace_pdf.strip()[:20] not in content:
    # try primitive replace
    pass

# For shareReport logic
share_replacement = """
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
      const imgHeight = (img.height * pageWidth) / img.width;
"""

import_to_replace_share = """
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: '#ffffff',
        scrollY: 0,
        height: element.scrollHeight,
        windowHeight: element.scrollHeight,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('[data-report-container]') as HTMLElement;
          if (clonedElement) {
            clonedElement.style.height = 'auto';
            clonedElement.style.overflow = 'visible';
            clonedElement.style.borderRadius = '0';
            clonedElement.style.boxShadow = 'none';
          }

          const allElements = clonedDoc.getElementsByTagName('*');
          for (let i = 0; i < allElements.length; i++) {
            const el = allElements[i] as HTMLElement;
            if (typeof el.className === 'string' && (el.className.includes('backdrop-blur') || el.className.includes('bg-white/'))) {
              el.style.backdropFilter = 'none';
              (el.style as any).webkitBackdropFilter = 'none';
              if (el.className.includes('bg-white/')) {
                el.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              }
            }
          }

          const buttons = clonedDoc.querySelectorAll('button');
          buttons.forEach(btn => btn.style.display = 'none');
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;
"""

content = content.replace(import_to_replace_share.strip(), share_replacement.strip())

with open('src/components/ReportScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
