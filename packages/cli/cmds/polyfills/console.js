class ConsolePollyfill {
  constructor() {
    this.tokenTypes = [
      { regex: /^\s+/, tokenType: "WHITESPACE" },
      { regex: /^[{}]/, tokenType: "BRACE" },
      { regex: /^[[\]]/, tokenType: "BRACKET" },
      { regex: /^:/, tokenType: "COLON" },
      { regex: /^,/, tokenType: "COMMA" },
      { regex: /^-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/i, tokenType: "NUMBER_LITERAL" },
      { regex: /^"(?:\\.|[^"\\])*"(?=\s*:)/, tokenType: "STRING_KEY" },
      { regex: /^"(?:\\.|[^"\\])*"/, tokenType: "STRING_LITERAL" },
      { regex: /^true|^false/, tokenType: "BOOLEAN_LITERAL" },
      { regex: /^null/, tokenType: "NULL_LITERAL" }
    ];
    this.defaultColors = {
      BRACE: "\u00A7b",
      BRACKET: "\u00A7b",
      COLON: "\u00A7f",
      COMMA: "\u00A7f",
      STRING_KEY: "\u00A7a",
      STRING_LITERAL: "\u00A7a",
      NUMBER_LITERAL: "\u00A76",
      BOOLEAN_LITERAL: "\u00A76",
      NULL_LITERAL: "\u00A7f"
    };
  }
  getTokens(json, options = {}) {
    let input;
    if (options.pretty) {
      const inputObj = typeof json === "string" ? JSON.parse(json) : json;
      input = JSON.stringify(inputObj, null, 2);
    } else {
      input = typeof json === "string" ? json : JSON.stringify(json);
    }
    let tokens = [];
    let foundToken;
    do {
      foundToken = false;
      for (let i = 0; i < this.tokenTypes.length; i++) {
        const match = this.tokenTypes[i].regex.exec(input);
        if (match) {
          tokens.push({ type: this.tokenTypes[i].tokenType, value: match[0] });
          input = input.substring(match[0].length);
          foundToken = true;
          break;
        }
      }
    } while (input.length > 0 && foundToken);
    return tokens;
  }
  colorize(tokens) {
    return tokens.reduce((acc, token) => {
      const colorKey = this.defaultColors[token.type];
      if (token.type === "WHITESPACE") {
        return acc + token.value;
      }
      return acc + `${colorKey}${token.value}\u00A7r`;
    }, "");
  }
  prettyJson(obj) {
    return this.colorize(this.getTokens(JSON.stringify(obj), { pretty: true }));
  }
  log(...data) {
    let chatEventData = __system__.createEventData(
      "minecraft:display_chat_event"
    );
    chatEventData.data.message = data
      .map(i => {
        if (typeof i === "object") {
          return this.prettyJson(i);
        }
        return i;
      })
      .join("");
    __system__.broadcastEvent("minecraft:display_chat_event", chatEventData);
  }
}

__console__ = new ConsolePollyfill();
