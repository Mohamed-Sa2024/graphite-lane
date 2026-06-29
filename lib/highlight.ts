/**
 * A minimal, dependency-free syntax highlighter. It is intentionally small:
 * it tokenizes a single line into colored spans for the common cases (keywords,
 * strings, comments, numbers) across JS/TS, JSON, CSS and Markdown. This keeps
 * the build self-contained; swapping in Shiki/Prism later is a drop-in upgrade.
 */

export type TokenKind =
  | "plain"
  | "keyword"
  | "string"
  | "comment"
  | "number"
  | "function"
  | "tag"
  | "attr"
  | "punct";

export interface Token {
  text: string;
  kind: TokenKind;
}

const JS_KEYWORDS = new Set([
  "const","let","var","function","return","if","else","for","while","do",
  "switch","case","break","continue","new","class","extends","import","from",
  "export","default","async","await","try","catch","finally","throw","typeof",
  "instanceof","in","of","this","super","null","undefined","true","false",
  "void","yield","static","get","set","public","private","protected","readonly",
  "interface","type","enum","namespace","as","is","keyof","implements","abstract",
]);

interface Rule {
  kind: TokenKind;
  re: RegExp;
}

// Order matters: comments and strings first so their contents aren't re-tokenized.
const JS_RULES: Rule[] = [
  { kind: "comment", re: /^\/\/.*$/ },
  { kind: "comment", re: /^\/\*[\s\S]*?(\*\/|$)/ },
  { kind: "string", re: /^`(?:\\.|[^`\\])*`?/ },
  { kind: "string", re: /^"(?:\\.|[^"\\])*"?/ },
  { kind: "string", re: /^'(?:\\.|[^'\\])*'?/ },
  { kind: "number", re: /^0x[\da-fA-F]+|^\d+(?:\.\d+)?(?:e[+-]?\d+)?/ },
  { kind: "function", re: /^[A-Za-z_$][\w$]*(?=\s*\()/ },
  { kind: "plain", re: /^[A-Za-z_$][\w$]*/ }, // resolved to keyword below
  { kind: "punct", re: /^[{}()[\].,;:=<>+\-*/%!&|^~?@]+/ },
  { kind: "plain", re: /^\s+/ },
  { kind: "plain", re: /^./ },
];

const CSS_RULES: Rule[] = [
  { kind: "comment", re: /^\/\*[\s\S]*?(\*\/|$)/ },
  { kind: "string", re: /^"(?:\\.|[^"\\])*"?|^'(?:\\.|[^'\\])*'?/ },
  { kind: "number", re: /^-?\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw|s|ms|deg)?/ },
  { kind: "keyword", re: /^[.#]?[A-Za-z_-][\w-]*(?=\s*\{)/ },
  { kind: "attr", re: /^[A-Za-z-]+(?=\s*:)/ },
  { kind: "punct", re: /^[{}();:,]+/ },
  { kind: "plain", re: /^\s+/ },
  { kind: "plain", re: /^./ },
];

function tokenizeWith(line: string, rules: Rule[], resolveKeywords: boolean): Token[] {
  const tokens: Token[] = [];
  let rest = line;
  let guard = 0;
  while (rest.length && guard++ < 5000) {
    let matched = false;
    for (const rule of rules) {
      const m = rest.match(rule.re);
      if (m && m[0].length) {
        let kind = rule.kind;
        if (resolveKeywords && kind === "plain" && JS_KEYWORDS.has(m[0])) {
          kind = "keyword";
        }
        tokens.push({ text: m[0], kind });
        rest = rest.slice(m[0].length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      tokens.push({ text: rest[0], kind: "plain" });
      rest = rest.slice(1);
    }
  }
  return mergePlain(tokens);
}

function mergePlain(tokens: Token[]): Token[] {
  const out: Token[] = [];
  for (const t of tokens) {
    const last = out[out.length - 1];
    if (last && last.kind === "plain" && t.kind === "plain") {
      last.text += t.text;
    } else {
      out.push({ ...t });
    }
  }
  return out;
}

export function highlightLine(line: string, lang: string): Token[] {
  if (!line) return [{ text: "", kind: "plain" }];
  switch (lang) {
    case "js":
    case "json":
    case "go":
    case "rs":
    case "py":
      return tokenizeWith(line, JS_RULES, true);
    case "css":
      return tokenizeWith(line, CSS_RULES, false);
    default:
      return [{ text: line, kind: "plain" }];
  }
}

export const TOKEN_COLORS: Record<TokenKind, string> = {
  plain: "var(--fg)",
  keyword: "#c792ea",
  string: "#9ccc65",
  comment: "var(--muted)",
  number: "#f78c6c",
  function: "#82aaff",
  tag: "#f07178",
  attr: "#ffcb6b",
  punct: "var(--muted)",
};
