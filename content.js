function highlightWords(wordMap) {
  const bodyText = document.body.innerHTML;
  Object.keys(wordMap).forEach(word => {
    const regex = new RegExp(`\\b(${word})\\b`, 'gi');
    document.body.innerHTML = document.body.innerHTML.replace(
      regex,
      `<span class="highlighted-word" data-tooltip="${wordMap[word]}">$1</span>`
    );
  });
}
