import { LitElement, css, html } from "./_snowpack/pkg/lit.js";

class Fetcher {
  constructor(url, options = {}) {
    this.url = url;
    this.options = options;
  }
  wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  async fetch() {
    const response = await fetch(this.url, this.options);
    return await response.json();
  }
  async retryUntilSuccess(retries = 10, delay) {
    let retry = 0;
    let count = 0;
    while (retry < retries) {
      try {
        return await this.fetch();
      } catch (e) {
        retry++;
        count += retry * delay;
        await this.wait(retry * delay || 100);
      }
    }
    throw new Error(
      `Failed to fetch data after ${retries} retries and ${
        count / 1000
      } seconds`
    );
  }
}

const waiting = html` <h1>Waiting</h1> `;
const error = html` <h1>Error</h1> `;
const success = (d) => html` <pre>${JSON.stringify(d, null, 2)}</pre> `;

export class fetchWait extends LitElement {
  static get properties() {
    return {
      data: { type: Object },
      url: { type: String },
      retries: { type: Number },
      delay: { type: Number },
    };
  }
  static get styles() {
    return css`
      :host {
        font-family: "Courier New", Courier, monospaces;
      }
    `;
  }
  constructor() {
    super();
    this.data = null;
    this.url = null;
    this.retries = 10;
    this.delay = 100;
  }
  async connectedCallback() {
    super.connectedCallback();
    const fetcher = new Fetcher(this.url, { method: "GET" });
    try {
      this.data = await fetcher.retryUntilSuccess(this.retries, this.delay);
    } catch (e) {
      this.data = 500;
    }
  }
  render() {
    return html`${this.data === null
      ? waiting
      : this.data === 500
      ? error
      : success(this.data)}`;
  }
}

customElements.define("fetch-wait", fetchWait);
