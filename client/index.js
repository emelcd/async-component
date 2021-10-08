import { LitElement, css, html } from "lit";

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
      h1 {
        font-size: 1.5em;
      }
    `;
  }
  constructor() {
    super();
    this.data = null;
    this.url = null;
    this.retries = 10;
    this.delay = 100;
    this.error = null;
  }
  async connectedCallback() {
    super.connectedCallback();
    const fetcher = new Fetcher(this.url, { method: "GET" });
    try {
      this.data = await fetcher.retryUntilSuccess(this.retries, this.delay);
    } catch (e) {
      this.error = e.message;
      this.data = 500;
    }
  }
  waitingTemplate() {
    return html`<h1>Loading...</h1>`;
  }
  errorTemplate() {
    return html`<h1>Error</h1>
      <p style="color:red">${this.error}</p>`;
  }
  successTemplate() {
    const template = () => html`
      <h1>Success</h1>
      <a href="${this.url}">
        <img
        alt="${this.login}"
        style="width:100px"
        src="${this.data.avatar_url}"
        />
      </a>
      <pre>${JSON.stringify(this.data, null, 2)}</pre>
    `;
    return template(this.data);
  }
  render() {
    return html`${this.data === null
      ? this.waitingTemplate()
      : this.error
      ? this.errorTemplate()
      : this.successTemplate()}`;
  }
}

customElements.define("fetch-wait", fetchWait);
