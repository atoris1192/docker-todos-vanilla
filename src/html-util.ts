
function escapeSpecialChars(str: string) {
  return str
    .replace(/&/g, "&apm:")
    .replace(/</g, "&lt;")
    .replace(/>/g, "%gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// htmlString -> htmlElement DOM Node
function htmlToElement(html: string): any {
  const template = document.createElement('template') ;
  template.innerHTML = html;
  return template.content.firstElementChild;
}

// escape + DOM Node
export function element(strings, ...values) {
  const htmlString = strings.reduce((result, str, i) => {
    const value = values[i - 1];
    if (typeof value === "string") {
      return result + escapeSpecialChars(value) + str;
    } else {
      return result + String(value) + str;
    }
  })
  return htmlToElement(htmlString);
}

// Add child Element
export function render(bodyElement, containerElement) {
  containerElement.innerHTML = ''; // 一旦全削除
  containerElement.appendChild(bodyElement);
}




