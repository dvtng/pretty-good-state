// Modified from https://github.com/react-syntax-highlighter/react-syntax-highlighter/blob/master/src/styles/prism/duotone-light.js

const BLUE_DARK = "#092B6E";
const BLUE_MEDIUM = "#124EC5";
const BLUE_LIGHT = "#5F8FEE";
const GREEN = "#09A54C";

const style: { [key: string]: React.CSSProperties } = {
  'code[class*="language-"]': {
    fontFamily:
      'Consolas, Menlo, Monaco, "Andale Mono WT", "Andale Mono", "Lucida Console", "Lucida Sans Typewriter", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Liberation Mono", "Nimbus Mono L", "Courier New", Courier, monospace',
    fontSize: "15px",
    lineHeight: "1.375",
    direction: "ltr",
    textAlign: "left",
    whiteSpace: "pre",
    wordSpacing: "normal",
    wordBreak: "normal",
    MozTabSize: "4",
    OTabSize: "4",
    tabSize: "4",
    WebkitHyphens: "none",
    MozHyphens: "none",
    msHyphens: "none",
    hyphens: "none",
    background: "#faf8f5",
    color: BLUE_DARK,
  },
  'pre[class*="language-"]': {
    fontFamily:
      'Consolas, Menlo, Monaco, "Andale Mono WT", "Andale Mono", "Lucida Console", "Lucida Sans Typewriter", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Liberation Mono", "Nimbus Mono L", "Courier New", Courier, monospace',
    fontSize: "15px",
    lineHeight: "1.375",
    direction: "ltr",
    textAlign: "left",
    whiteSpace: "pre",
    wordSpacing: "normal",
    wordBreak: "normal",
    MozTabSize: "4",
    OTabSize: "4",
    tabSize: "4",
    WebkitHyphens: "none",
    MozHyphens: "none",
    msHyphens: "none",
    hyphens: "none",
    background: "#faf8f5",
    color: BLUE_DARK,
    padding: "1em",
    margin: ".5em 0",
    overflow: "auto",
  },
  'pre > code[class*="language-"]': {
    fontSize: "1em",
  },
  'pre[class*="language-"]::-moz-selection': {
    textShadow: "none",
    background: "#faf8f5",
  },
  'pre[class*="language-"] ::-moz-selection': {
    textShadow: "none",
    background: "#faf8f5",
  },
  'code[class*="language-"]::-moz-selection': {
    textShadow: "none",
    background: "#faf8f5",
  },
  'code[class*="language-"] ::-moz-selection': {
    textShadow: "none",
    background: "#faf8f5",
  },
  'pre[class*="language-"]::selection': {
    textShadow: "none",
    background: "#faf8f5",
  },
  'pre[class*="language-"] ::selection': {
    textShadow: "none",
    background: "#faf8f5",
  },
  'code[class*="language-"]::selection': {
    textShadow: "none",
    background: "#faf8f5",
  },
  'code[class*="language-"] ::selection': {
    textShadow: "none",
    background: "#faf8f5",
  },
  ':not(pre) > code[class*="language-"]': {
    padding: ".1em",
    borderRadius: ".3em",
  },
  comment: {
    color: GREEN,
    fontWeight: "bold",
  },
  prolog: {
    color: "#b6ad9a",
  },
  doctype: {
    color: "#b6ad9a",
  },
  cdata: {
    color: "#b6ad9a",
  },
  punctuation: {
    color: "#b6ad9a",
  },
  namespace: {
    opacity: ".7",
  },
  tag: {
    color: BLUE_DARK,
  },
  operator: {
    color: BLUE_MEDIUM,
  },
  number: {
    color: BLUE_LIGHT,
  },
  property: {
    color: "#b29762",
  },
  function: {
    color: "#b29762",
  },
  "tag-id": {
    color: "#2d2006",
  },
  selector: {
    color: "#2d2006",
  },
  "atrule-id": {
    color: "#2d2006",
  },
  "code.language-javascript": {
    color: "#896724",
  },
  "attr-name": {
    color: "#896724",
  },
  "code.language-css": {
    color: BLUE_LIGHT,
  },
  "code.language-scss": {
    color: BLUE_LIGHT,
  },
  boolean: {
    color: BLUE_LIGHT,
  },
  string: {
    color: BLUE_LIGHT,
  },
  entity: {
    color: BLUE_LIGHT,
    cursor: "help",
  },
  url: {
    color: BLUE_LIGHT,
  },
  ".language-css .token.string": {
    color: BLUE_LIGHT,
  },
  ".language-scss .token.string": {
    color: BLUE_LIGHT,
  },
  ".style .token.string": {
    color: BLUE_LIGHT,
  },
  "attr-value": {
    color: BLUE_LIGHT,
  },
  keyword: {
    color: BLUE_MEDIUM,
  },
  control: {
    color: BLUE_LIGHT,
  },
  directive: {
    color: BLUE_LIGHT,
  },
  unit: {
    color: BLUE_LIGHT,
  },
  statement: {
    color: BLUE_LIGHT,
  },
  regex: {
    color: BLUE_LIGHT,
  },
  atrule: {
    color: BLUE_LIGHT,
  },
  placeholder: {
    color: BLUE_LIGHT,
  },
  variable: {
    color: BLUE_LIGHT,
  },
  deleted: {
    textDecoration: "line-through",
  },
  inserted: {
    borderBottom: "1px dotted #2d2006",
    textDecoration: "none",
  },
  italic: {
    fontStyle: "italic",
  },
  important: {
    fontWeight: "bold",
    color: "#896724",
  },
  bold: {
    fontWeight: "bold",
  },
  "pre > code.highlight": {
    outline: ".4em solid #896724",
    outlineOffset: ".4em",
  },
  ".line-numbers.line-numbers .line-numbers-rows": {
    borderRightColor: "#ece8de",
  },
  ".line-numbers .line-numbers-rows > span:before": {
    color: "#cdc4b1",
  },
  ".line-highlight.line-highlight": {
    background:
      "linear-gradient(to right, rgba(45, 32, 6, 0.2) 70%, rgba(45, 32, 6, 0))",
  },
};

export default style;
