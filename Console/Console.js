export default class Console {
  /**
   * Create a console.
   * @param {Object} option This object define the settings of the console.
   */
  constructor(option) {
    // Define all the variables
    this.option = option;
    this.option.context = option.context || globalThis;
    if (!this.option.context.eval) throw Error("This context is invalid.");

    // Securising
    if (option.disableParent) this.option.context.parent = this.option.context;

    this.option.container =
      option.container || this.option.context.document.body;

    this.option.width = option.width ?? 500;
    this.option.height = option.height ?? 400;

    this.option.style = option.style || new Object();
    this.option.style.background = option.style.background || "#333333";
    this.option.style.default = option.style.default || "#ffffff";
    this.option.style.error = option.style.error || "#e05f5f";
    this.option.style.warn = option.style.warn || "#dee059";
    this.option.style.info = option.style.info || "#4eaefd";

    this.history = [];
    let historyCount = 0;

    this.option.container.style.display = "flex";
    this.option.container.style.flexDirection = "column";
    this.option.container.style.height = this.option.height + "px";
    this.option.container.style.width = this.option.width + "px";
    this.option.container.style.borderRadius = "10px";
    this.option.container.style.overflow = "hidden";
    this.option.container.style.fontFamily =
      '"Courier New", Courier, monospace';
    this.option.container.style.backgroundColor = option.style.background;

    this.option.container.innerHTML = `
    <div id="output" style="flex: 1; overflow: hidden auto; scroll-behavior: smooth;"></div>
    <div
      id="input-container"
      style="
        width: 100%;
        padding-left: 10px;

        font-family: 'Courier New', Courier, monospace;

        background-color: #ffffff;
        border-top: 4px solid ${this.option.style.default};

        display: flex;
        align-items: center;
        text-align: center;
      "
    >
      <span>&gt;&gt;&gt;&nbsp;</span
      ><input
        placeholder="write some javascript..."
        autocomplete="off"
        id="input"
        type="text"
        style="
          flex: 1;
          padding: 10px;

          font-family: 'Courier New', Courier, monospace;
          border: none;
          outline: none;
        "
      />
    </div>
    `;

    this.option.context.console.log = (...args) => {
      this.createTile(args.join(", "));
    };

    this.option.context.console.clear = (...args) => {
      this.option.container.querySelector("#output").innerHTML = "";
      return "Console cleared.";
    };

    this.option.context.console.error = (...args) => {
      this.createTile("(x) " + args.join(", "), option.style.error);
    };

    this.option.context.console.warn = (...args) => {
      this.createTile("/!\\ " + args.join(", "), option.style.warn);
    };

    this.option.context.console.info = (...args) => {
      this.createTile("(i) " + args.join(", "), option.style.info);
    };

    function OTFS(obj, tabNb = 1) {
      if (typeof obj !== "object") throw Error("Argument must be an object.");
      if (!Object.keys(obj).length) return Array.isArray(obj) ? "[]" : "{}";
      let tab = "";
      for (let i = 0; i < tabNb; i++) {
        tab += "  ";
      }

      let formatedString = Array.isArray(obj) ? "[\n" + tab : "{\n" + tab;
      if (Array.isArray(obj)) {
        Object.entries(obj).forEach((entry) => {
          if (typeof entry[1] === "object") {
            if (obj === entry[1]) formatedString += "[recursive]";
            else formatedString += OTFS(entry[1], tabNb + 1);
          } else if (typeof entry[1] === "function") {
            formatedString += "[function]";
          } else {
            formatedString += JSON.stringify(entry[1]);
          }
          formatedString += ",\n" + tab;
        });
      } else {
        Object.entries(obj).forEach((entry) => {
          if (typeof entry[1] === "object") {
            if (obj === entry[1]) formatedString += `${entry[0]}: [recursive]`;
            else formatedString += `${entry[0]}: ${OTFS(entry[1], tabNb + 1)}`;
          } else if (typeof entry[1] === "function") {
            formatedString += `${entry[0]}: [function]`;
          } else {
            formatedString += `${entry[0]}: ${JSON.stringify(entry[1])}`;
          }
          formatedString += ",\n" + tab;
        });
      }
      formatedString = formatedString.split(",\n" + tab);
      formatedString.pop();
      formatedString = formatedString.join(",\n" + tab);
      formatedString += Array.isArray(obj)
        ? "\n" + tab.slice(2) + "]"
        : "\n" + tab.slice(2) + "}";
      return formatedString;
    }

    this.option.container
      .querySelector("#input")
      .addEventListener("keydown", async (e) => {
        if (e.code === "Enter") {
          this.createTile(
            ">>> " + this.option.container.querySelector("#input").value,
            this.option.style.default,
            true
          );
          this.history.unshift(
            this.option.container.querySelector("#input").value
          );
          historyCount = 0;

          let evaluated;

          try {
            evaluated = await this.option.context.eval(
              this.option.container.querySelector("#input").value
            );
            if (typeof evaluated === "object") {
              try {
                this.createTile(
                  "<<< " + OTFS(evaluated),
                  this.option.style.default,
                  true
                );
              } catch {
                this.createTile("<<< " + evaluated);
              }
            } else if (typeof evaluated === "string") {
              this.createTile(
                "<<< " + JSON.stringify(evaluated),
                this.option.style.default,
                true
              );
            } else {
              this.createTile(
                "<<< " + evaluated,
                this.option.style.default,
                true
              );
            }
          } catch (err) {
            this.createTile("(x) " + err, this.option.style.error);
          }

          this.option.container.querySelector("#input").value = "";
        } else if (e.code === "ArrowUp") {
          if (!this.history.length > 0 || historyCount >= this.history.length)
            return;

          this.option.container.querySelector("#input").value =
            this.history[historyCount];
          historyCount++;
        } else if (e.code === "ArrowDown") {
          if (historyCount <= 0)
            return (this.option.container.querySelector("#input").value = "");
          if (!this.history.length > 0) return;
          this.option.container.querySelector("#input").value =
            this.history[historyCount - 1];
          historyCount--;
        } else {
          historyCount = 0;
        }
      });

    this.createTile("JS console ready.", this.option.style.warn);
  }

  #HFH(htmlEl) {
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
    // parsed = parsed.replace(
    //   regexReg,
    //   `<span data-hl-type="regex" style="color: #eb993a;">&#47;$1&#47;$2</span>`
    // );
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

  createTile(
    content,
    color = this.option.style.default,
    syntaxHl = false,
    asText = true
  ) {
    const tile = this.option.context.document.createElement("div");
    tile.classList.add("tile");
    tile.style.borderLeft = "4px solid " + color;
    tile.style.color = color;
    tile.style.padding = "5px 10px";
    tile.style.margin = "10px";
    tile.style.overflowWrap = "break-word";

    if (asText)
      tile.innerHTML = content
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replaceAll("\n", "<br>")
        .replaceAll(" ", "&nbsp;");
    else tile.innerHTML = content;

    if (syntaxHl) this.#HFH(tile);

    this.option.container.querySelector("#output").appendChild(tile);
    this.option.container
      .querySelector("#output")
      .scrollTo(0, this.option.container.querySelector("#output").scrollHeight);
  }
}