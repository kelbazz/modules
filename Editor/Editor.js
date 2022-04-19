export default class Editor {
  /**
   * Create an javascript editor.
   * @param {HTMLDivElement} element The div to use as editor.
   * @param {Object} options The parameters for the editor creation.
   */
  constructor(element, options) {
    this.editor = element;

    if (!options) options = new Object();
    if (!options.style) options.style = new Object();

    this.options = {
      width: options.width || 400,
      height: options.height || 300,
      fontSize: options.fontSize || 15,
      onlyShow: options.onlyShow || false,
      autoCloseBrackets: options.autoCloseBrackets || true,
      breakCode: options.breakCode || false,
      style: {
        background: options.style.background || "#0f1020",
        default: options.style.default || "#ffffff",
        strings: options.style.strings || "#a1e46d",
        keywords: options.style.keywords || "#cb61ff",
        types: options.style.types || "#e05f5f",
        methods: options.style.methods || "#4dbfd4",
        propreties: options.style.propreties || "#eb993a",
        classes: options.style.classes || "#dee059",
        comments: options.style.comments || "#aaaaaa",
      },
    };

    this.editor.style.width = this.options.width + "px";
    this.editor.style.height = this.options.height + "px";
    this.editor.style.fontSize = this.options.fontSize + "px";
    this.editor.style.background = this.options.style.background;
    this.editor.style.borderRadius = "10px";
    this.editor.style.caretColor = this.options.style.default;
    this.editor.style.padding = "10px";
    this.editor.style.fontFamily = "monospace";
    this.editor.style.overflow = "scroll";
    this.editor.style.overflowWrap = this.options.breakCode
      ? "break-word"
      : "initial";
    if (!this.options.onlyShow) this.editor.contentEditable = true;

    this.editor.spellcheck = false;

    const highlight = document.createElement("div");

    highlight.style.position = "absolute";
    highlight.style.color = this.options.style.default;
    highlight.style.pointerEvents = "none";
    highlight.style.overflow = "hidden";
    highlight.style.overflowWrap = this.editor.style.overflowWrap;

    const HFH = (htmlEl, htmlEl2 = htmlEl) => {
      let str1Reg = /"((?:\\"|(?!").)*)"/g,
        str2Reg = /'((?:\\'|(?!').)*)'/g,
        str3Reg = /`((?:\\`|(?!`).)*)`/g,
        specialReg =
          /\b(new|typeof|var|let|const|if|else|do|function|class|while|switch|try|catch|of|in|for|return|continue|break|throw\b)(?!\w)/g,
        typeReg =
          /\b(window|globalThis|self|this|Array|String|Object|Number|null|undefined|true|false|\$\b)(?!\w)/g,
        methodReg =
          /\b(?![A-Z]|function|if|catch|while|for\b)\w+\s*(?=\(.*\))/g,
        commentReg =
          /(?:\/\*(?:[\s\S]*?)\*\/)|(?:^\s*\/\/(?:.*)$)|(?:_\s*\w+(?!\w*\(.*\)*))/g,
        classReg = /(?<![a-z])(?=\.*\s*)[A-Z]+\w*/g,
        propretyReg = /(?<=\.\s*)\w+(?!\w*\(.*\))/g;

      let string = htmlEl.innerHTML;
      let parsed = string.replace(
        str1Reg,
        `<span data-hl-type="string" style="color: ${this.options.style.strings};">&quot;$1&quot;</span>`
      );
      parsed = parsed.replace(
        str2Reg,
        `<span data-hl-type="string" style="color: ${this.options.style.strings};">&apos;$1&apos;</span>`
      );
      parsed = parsed.replace(
        str3Reg,
        `<span data-hl-type="string" style="color: ${this.options.style.strings};">&#96;$1&#96;</span>`
      );
      parsed = parsed.replace(
        specialReg,
        `<span data-hl-type="special" style="color: ${this.options.style.keywords};">$&</span>`
      );
      parsed = parsed.replace(
        typeReg,
        `<span data-hl-type="type" style="color: ${this.options.style.types}; font-style: italic;">$&</span>`
      );
      parsed = parsed.replace(
        methodReg,
        `<span data-hl-type="method" style="color: ${this.options.style.methods};">$&</span>`
      );
      parsed = parsed.replace(
        propretyReg,
        `<span data-hl-type="proprety" style="color: ${this.options.style.propreties};">$&</span>`
      );
      parsed = parsed.replace(
        classReg,
        `<span data-hl-type="class" style="color: ${this.options.style.classes};">$&</span>`
      );

      parsed = parsed.replace(
        commentReg,
        `<span data-hl-type="comment" style="color: ${this.options.style.comments}; font-style: italic;">$&</span>`
      );

      htmlEl2.innerHTML = parsed;

      htmlEl2.querySelectorAll("span[data-hl-type]>span").forEach((el) => {
        el.style.color = "inherit";
        el.style.fontStyle = "inherit";
        el.style.fontWheight = "inherit";
        delete el.dataset.hlType;
      });
    };

    const loop = () => {
      requestAnimationFrame(loop);

      // actualize style
      this.editor.style.color = "transparent";
      highlight.style.fontFamily = this.editor.style.fontFamily;
      highlight.style.left = this.editor.offsetLeft + "px";
      highlight.style.top = this.editor.offsetTop + "px";
      highlight.style.fontSize = this.editor.style.fontSize;
      highlight.style.width = this.editor.style.width;
      highlight.style.height = this.editor.style.height;
      highlight.style.padding = this.editor.style.padding;
      highlight.style.zIndex = parseInt(this.editor.style.zIndex) + 1 || 2;

      HFH(this.editor, highlight);
      highlight.scrollTo({
        left: this.editor.scrollLeft,
        top: this.editor.scrollTop,
      });
    };

    const addToCursorPos = (str) => {
      let doc = this.editor.ownerDocument.defaultView;
      let sel = doc.getSelection();
      let range = sel.getRangeAt(0);

      let tabNode = document.createTextNode(str);
      range.insertNode(tabNode);
      sel.setPosition(tabNode);
    };

    this.editor.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        e.preventDefault();

        var doc = this.editor.ownerDocument.defaultView;
        var sel = doc.getSelection();
        var range = sel.getRangeAt(0);

        var tabNode = document.createTextNode("\u00a0\u00a0");
        range.insertNode(tabNode);

        range.setStartAfter(tabNode);
        range.setEndAfter(tabNode);
        sel.removeAllRanges();
        sel.addRange(range);
      }

      if (this.options.autoCloseBrackets) {
        // Brackets
        if (e.key === "(") addToCursorPos(")");
        if (e.key === "{") addToCursorPos("}");
        if (e.key === "[") addToCursorPos("]");

        // Quots
        if (e.key === '"') addToCursorPos('"');
        if (e.key === "'") addToCursorPos("'");
        if (e.key === "`") addToCursorPos("`");
      }
    });

    requestAnimationFrame(loop);
    this.editor.insertAdjacentElement("afterend", highlight);
  }
}
