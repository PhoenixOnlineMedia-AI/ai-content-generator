class ContentUtils {
    static generateTable(headers, rows) {
      return {
        html: `
          <table class="content-table">
            <thead>
              <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${rows.map(row => `
                <tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>
              `).join('')}
            </tbody>
          </table>
        `,
        markdown: `
          | ${headers.join(' | ')} |
          | ${headers.map(() => '---').join(' | ')} |
          ${rows.map(row => `| ${row.join(' | ')} |`).join('\n')}
        `
      };
    }
  
    static generateFAQ(questions) {
      const faqHtml = questions.map(q => `
        <div class="faq-item">
          <h3 class="faq-question">${q.question}</h3>
          <div class="faq-answer">${q.answer}</div>
        </div>
      `).join('');
  
      const schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": questions.map(q => ({
          "@type": "Question",
          "name": q.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": q.answer
          }
        }))
      };
  
      return {
        html: `<div class="faq-section">${faqHtml}</div>`,
        schema: JSON.stringify(schema, null, 2)
      };
    }
  
    static generateListicle(items) {
      const listHtml = items.map((item, index) => `
        <div class="listicle-item">
          <h2 class="listicle-title">${index + 1}. ${item.title}</h2>
          <div class="listicle-content">${item.content}</div>
          ${item.image ? `<img src="${item.image}" alt="${item.title}" class="listicle-image">` : ''}
        </div>
      `).join('');
  
      return {
        html: `<div class="listicle-container">${listHtml}</div>`,
        markdown: items.map((item, index) => 
          `## ${index + 1}. ${item.title}\n\n${item.content}`
        ).join('\n\n')
      };
    }
  }
  
  module.exports = ContentUtils;  