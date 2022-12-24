const consoleStyleArgs = {
  background: "#0f1020",
  default: "#ffffff",
  error: "#e05f5f",
  warn: "#ffe856",
  info: "#0099ff",

  strings: "#71ec5f",
  keywords: "#9744e3",
  types: "#e05f5f",
  methods: "#0099ff",
  propreties: "#e05f5f",
  classes: "#ffe856",
  comments: "#bbc0c0",
};

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

    this.option.style = Object.assign(consoleStyleArgs, option.style);

    this.history = [];
    let historyCount = 0;

    this.option.container.style.display = "flex";
    this.option.container.style.flexDirection = "column";
    this.option.container.style.height = this.option.height + "px";
    this.option.container.style.width = this.option.width + "px";
    this.option.container.style.borderRadius = "10px";
    this.option.container.style.overflow = "hidden";
    this.option.container.style.fontFamily =
      '"JetBrains Mono", "Courier New", Courier, monospace';
    this.option.container.style.backgroundColor = option.style.background;

    let alphas = "abcdefghijklmnopqrstuvwxyz";
    let id = "";
    for (let i = 0; i < 4; i++)
      id += alphas[Math.floor(Math.random() * alphas.length)];
    this.id = id;

    this.option.container.innerHTML = `

    <style>
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono&display=swap');

      #${this.id}-output::-webkit-scrollbar {
          background: transparent;
          width: 24px;
      }
      #${this.id}-output::-webkit-scrollbar-thumb {
          border: 10px solid transparent;
          box-shadow: inset 0 0 10px 10px #fff;
      }
      #${this.id}-output::-webkit-scrollbar-track {
          border: 10px solid transparent;
          box-shadow: inset 0 0 10px 10px #bbc0c0;
      }
    </style>
    <div id="${this.id}-output" style="flex: 1; overflow: hidden auto; scroll-behavior: smooth;"></div>
    <div
      id="input-container"
      style="
        width: 100%;
        padding-left: 10px;

        font-family: 'JetBrains Mono', 'Courier New', Courier, monospace;

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
        id="${this.id}-input"
        type="text"
        style="
          flex: 1;
          padding: 10px;

          font-family: 'JetBrains Mono', 'Courier New', Courier, monospace;
          border: none;
          outline: none;
        "
      />
    </div>
    `;

    function OTFS(obj, tabNb = 1) {
      if (typeof obj !== "object") throw Error("Argument must be an object.");
      if (!Object.keys(obj).length) return Array.isArray(obj) ? "[]" : "{}";
      if (obj instanceof Window) return "[instance of Window]";
      
      let tab = "";
      for (let i = 0; i < tabNb; i++) {
        tab += "  ";
      }

      let formatedString = Array.isArray(obj) ? "[\n" + tab : "{\n" + tab;
      if (Array.isArray(obj)) {
        Object.entries(obj).forEach((entry) => {
          if (typeof entry[1] === "object") {
            if (obj === entry[1]) formatedString += "[circular]";
            else formatedString += OTFS(entry[1], tabNb + 1);
          } else if (typeof entry[1] === "function") {
            formatedString +=
              entry[1].name.length != 0
                ? `[function ${entry[1].name}]`
                : "[function]";
          } else {
            formatedString += JSON.stringify(entry[1]);
          }
          formatedString += ",\n" + tab;
        });
      } else {
        Object.entries(obj).forEach((entry) => {
          if (typeof entry[1] === "object") {
            if (obj === entry[1]) formatedString += `${entry[0]}: [circular]`;
            else formatedString += `${entry[0]}: ${OTFS(entry[1], tabNb + 1)}`;
          } else if (typeof entry[1] === "function") {
            formatedString +=
              `${entry[0]}: ` +
              (entry[1].name.length != 0
                ? `[function ${entry[1].name}]`
                : "[function]");
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

    this.option.context.console.clear = () => {
      this.option.container.querySelector(`#${this.id}-output`).innerHTML = "";
    };

    this.option.context.console.log = (... args) => {
      const newArgs = [];
      args.forEach((arg) =>
        newArgs.push(typeof arg === "object" ? OTFS(arg) : arg)
      );
      this.createTile(newArgs.join(", "));
    };

    this.option.context.console.error = (...args) => {
      const newArgs = [];
      args.forEach((arg) =>
        newArgs.push(typeof arg === "object" ? OTFS(arg) : arg)
      );
      this.createTile("(x): " + newArgs.join(", "), option.style.error);
    };

    this.option.context.console.warn = (...args) => {
      const newArgs = [];
      args.forEach((arg) =>
        newArgs.push(typeof arg === "object" ? OTFS(arg) : arg)
      );
      this.createTile("/!\\: " + newArgs.join(", "), option.style.warn);
    };

    this.option.context.console.info = (...args) => {
      const newArgs = [];
      args.forEach((arg) =>
        newArgs.push(typeof arg === "object" ? OTFS(arg) : arg)
      );
      this.createTile("(i): " + newArgs.join(", "), option.style.info);
    };

    this.option.container
      .querySelector("#" + this.id + "-input")
      .addEventListener("keydown", async (e) => {
        if (e.code === "Enter") {
          this.createTile(
            ">>> " +
              this.option.container.querySelector("#" + this.id + "-input")
                .value,
            this.option.style.default,
            true
          );
          this.history.unshift(
            this.option.container.querySelector("#" + this.id + "-input").value
          );
          historyCount = 0;

          let evaluated;

          try {
            evaluated = await this.option.context.eval(
              this.option.container.querySelector("#" + this.id + "-input")
                .value
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
            this.option.context.console.error(`${err.name}: ${err.message}`);
          }

          this.option.container.querySelector(`#${this.id}-input`).value = "";
        } else if (e.code === "ArrowUp") {
          if (!this.history.length > 0 || historyCount >= this.history.length)
            return;

          this.option.container.querySelector(`#${this.id}-input`).value =
            this.history[historyCount];
          historyCount++;
        } else if (e.code === "ArrowDown") {
          if (historyCount <= 0)
            return (this.option.container.querySelector(
              "#" + this.id + "-input"
            ).value = "");
          if (!this.history.length > 0) return;
          this.option.container.querySelector(`#${this.id}-input`).value =
            this.history[historyCount - 1];
          historyCount--;
        } else {
          historyCount = 0;
        }
      });

    this.option.onready?.(this);
  }

  #HFH(htmlEl) {
    let str1Reg = /((?<=(?<!\\)(?:\\{2})*))"((?:\\"|(?!").)*)"/g,
      str2Reg = /((?<=(?<!\\)(?:\\{2})*))'((?:\\'|(?!').)*)'/g,
      str3Reg = /((?<=(?<!\\)(?:\\{2})*))`((?:\\`|(?!`).)*)`/g,
      keywordReg =
        /\b(import|from|new|typeof|var|let|const|if|else|do|function|class|while|switch|try|catch|of|in|for|return|continue|break|throw\b)(?!\w)/g,
      typeReg =
        /\b(window|globalThis|self|this|Array|String|Object|Number|null|undefined|true|false|\$\b)(?!\w)/g,
      methodReg = /\b(?![A-Z]|function|if|catch|while|for\b)\w+\s*(?=\(.*\))/g,
      commentReg =
        /(?:\/\*(?:[\s\S]*?)\*\/)|(?:^\s*\/\/(?:.*)$)|(?:_\s*\w+(?!\w*\(.*\)*))/g,
      classReg = /(?<![a-z])(?=\.*\s*)[A-Z]+\w*/g,
      propretyReg = /(?<=\.\s*)\w+(?!\w*\(.*\))/g;

    let string = htmlEl.innerHTML;
    let parsed = string.replace(
      str1Reg,
      `$1<span data-hl-type="string" style="color: ${this.option.style.strings};">&quot;$2&quot;</span>`
    );
    parsed = parsed.replace(
      str2Reg,
      `<span data-hl-type="string" style="color: ${this.option.style.strings};">$1&apos;$2&apos;</span>`
    );
    parsed = parsed.replace(
      str3Reg,
      `<span data-hl-type="string" style="color: ${this.option.style.strings};">$1&#96;$2&#96;</span>`
    );
    parsed = parsed.replace(
      keywordReg,
      `<span data-hl-type="keyword" style="color: ${this.option.style.keywords};">$&</span>`
    );
    parsed = parsed.replace(
      typeReg,
      `<span data-hl-type="type" style="color: ${this.option.style.types}; font-style: italic;">$&</span>`
    );
    parsed = parsed.replace(
      methodReg,
      `<span data-hl-type="method" style="color: ${this.option.style.methods};">$&</span>`
    );
    parsed = parsed.replace(
      propretyReg,
      `<span data-hl-type="proprety" style="color: ${this.option.style.propreties};">$&</span>`
    );
    parsed = parsed.replace(
      classReg,
      `<span data-hl-type="class" style="color: ${this.option.style.classes};">$&</span>`
    );

    parsed = parsed.replace(
      commentReg,
      `<span data-hl-type="comment" style="color: ${this.option.style.comments}; font-style: italic;">$&</span>`
    );

    htmlEl.innerHTML = parsed;

    htmlEl.querySelectorAll("span[data-hl-type]>span").forEach((el) => {
      el.style.color = "inherit";
      el.style.fontStyle = "inherit";
      el.style.fontWheight = "inherit";
      delete el.dataset.hlType;
    });

    htmlEl
      .querySelectorAll("span[data-hl-type='string']>span")
      .forEach((el) => {
        el.style.color = "inherit";
        el.style.fontStyle = "inherit";
        el.style.fontWheight = "inherit";
        delete el.dataset.hlType;
      });

    htmlEl
      .querySelectorAll("span[data-hl-type='comment']>span")
      .forEach((el) => {
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

    this.option.container.querySelector(`#${this.id}-output`).appendChild(tile);
    this.option.container
      .querySelector(`#${this.id}-output`)
      .scrollTo(
        0,
        this.option.container.querySelector(`#${this.id}-output`).scrollHeight
      );
  }
}
