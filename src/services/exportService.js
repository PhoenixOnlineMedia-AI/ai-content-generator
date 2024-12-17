const PDFDocument = require('pdfkit');
const docx = require('docx');
const marked = require('marked');

class ExportService {
  async exportToPDF(content) {
    const doc = new PDFDocument();
    doc.text(content.title);
    doc.text(content.content);
    return doc;
  }

  async exportToWord(content) {
    const doc = new docx.Document({
      sections: [{
        properties: {},
        children: [
          new docx.Paragraph({
            children: [new docx.TextRun(content.content)]
          })
        ]
      }]
    });
    return doc;
  }

  exportToHTML(content) {
    return marked.parse(content.content);
  }

  exportToPlainText(content) {
    return content.content;
  }
}

module.exports = new ExportService();