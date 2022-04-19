/**
 * Highlight some JavaScript code from a HTML tag.
 * @param {HTMLElement} htmlEl The HTML element to highlight.
 */
export default function HFH(htmlEl) {
  let str1Reg = /"((?:\\"|(?!").)*)"/g,
    str2Reg = /'((?:\\'|(?!').)*)'/g,
    str3Reg = /`((?:\\`|(?!`).)*)`/g,
    specialReg =
      /\b(new|var|let|const|if|do|function|class|while|switch|of|in|for|return|continue|break\b)(?!\w)/g,
    typeReg =
      /\b(Array|String|Object|Number|null|undefined|true|false|\$\b)(?!\w)/g,
    methodReg = /\b(?!function|if|catch|while|for\b)\w+\s*(?=\(.*\))/g,
    commentReg =
      /(?:\/\*(?:[\s\S]*?)\*\/)|(?:^\s*\/\/(?:.*)$)|(?:_\s*\w+(?!\w*\(.*\)*))/g,
    classReg = /(?<![a-z])(?=\.*\s*)[A-Z]+\w*/g,
    propretyReg = /(?<=\.\s*)\w+(?!\w*\(.*\))/g,
    regexReg = /(?:\/([\s\S]+?)\/([gimsuy]*))/g;

  let string = htmlEl.innerHTML;
  let parsed = string.replace(
    str1Reg,
    `<span data-hl-type="string" style="color: #a1e46d; font-style: normal;">&quot;$1&quot;</span>`
  );
  parsed = parsed.replace(
    str2Reg,
    `<span data-hl-type="string" style="color: #a1e46d; font-style: normal;">&apos;$1&apos;</span>`
  );
  parsed = parsed.replace(
    str3Reg,
    `<span data-hl-type="string" style="color: #a1e46d; font-style: normal;">&#96;$1&#96;</span>`
  );
  parsed = parsed.replace(
    specialReg,
    `<span data-hl-type="special" style="color: #b61fff;">$&</span>`
  );
  parsed = parsed.replace(
    typeReg,
    `<span data-hl-type="type" style="color: #e05f5f; font-style: italic;">$&</span>`
  );
  parsed = parsed.replace(
    methodReg,
    `<span data-hl-type="method" style="color: #4dbfd4;">$&</span>`
  );
  parsed = parsed.replace(
    propretyReg,
    `<span data-hl-type="proprety" style="color: #eb993a;">$&</span>`
  );
  /*
  parsed = parsed.replace(
    regexReg,
    `<span data-hl-type="regex" style="color: #eb993a;">&#47;$1&#47;$2</span>`
  ); 
  */
  parsed = parsed.replace(
    classReg,
    `<span data-hl-type="class" style="color: #dee059;">$&</span>`
  );
  parsed = parsed.replace(
    commentReg,
    `<span data-hl-type="comment" style="color: #aaa; font-style: italic;">$&</span>`
  );

  htmlEl.innerHTML = parsed;

  htmlEl.querySelectorAll("span[data-hl-type]>span").forEach((el) => {
    el.style.color = "inherit";
    el.style.fontStyle = "inherit";
    el.style.fontWheight = "inherit";
    delete el.dataset.hlType;
  });
}
