(() => {
  'use strict';
  function renderExamples(container, examples) {
    container.replaceChildren();
    container.hidden = !Array.isArray(examples) || examples.length === 0;
    if (container.hidden) return;
    const heading = document.createElement('h3');
    heading.textContent = '別の場面で使える例文';
    const list = document.createElement('ol');
    for (const example of examples) {
      const item = document.createElement('li');
      for (const [language, text] of [['en', example.en], ['ja', example.ja]]) {
        const line = document.createElement('p');
        line.lang = language;
        line.textContent = text;
        item.append(line);
      }
      list.append(item);
    }
    container.append(heading, list);
  }
  window.SentenceLesson = {renderExamples};
})();
