import { html, css, LitElement } from 'lit-element';
import { render } from 'lit-html';
import { styleMap } from 'lit-html/directives/style-map.js';
import '@vaadin/vaadin-grid';
import '@github/time-elements';
import { installMediaQueryWatcher } from 'pwa-helpers/media-query.js';

export class MyGrid extends LitElement {
  static get properties() {
    return {
      data: { type: Array },
      narrow: { type: Boolean },
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }
      * {
        box-sizing: border-box;
      }
      .tools {
        margin-bottom: 8px;
        padding: 16px;
        background: #fafafa;
      }

      .date {
        display: flex;
        justify-content: flex-end;
      }

      .row {
        display: flex;
      }

      .flex-1 {
        flex: 1;
      }
      .avatar {
        margin-right: 8px;
        padding: 3px;
        border-radius: 50%;
        background: tomato;
      }
      .avatar > img {
        height: 48px;
        width: 48px;
        border-radius: 50%;
        border: 1px solid #fff;
      }

      .row .end {
        justify-self: flex-end;
      }

      .row .date {
        color: #737373;
      }
    `;
  }

  constructor() {
    super();
    this.data = [];
    this.narrow = false;
  }

  render() {
    const narrow = this.narrow;
    const nameHeaderRenderer = narrow ? undefined : this._nameHeaderRenderer.bind(this);
    const dateHeaderRenderer = narrow ? undefined : this._dateHeaderRenderer.bind(this);
    const subjectHeaderRenderer = narrow ? undefined : this._subjectHeaderRenderer.bind(this);

    return html`
      <div class="tools">
        <div>
          <button @click="${this._toggleNarrow}">toggle narrow</button>
          <span>narrow=${this.narrow}</span>
          <p>Grid will switch to narrow mode automatically based on media width</p>
        </div>
      </div>
      <vaadin-grid .items="${this.data}">
        <vaadin-grid-column
          resizable
          auto-width
          ?hidden="${this.narrow}"
          .headerRenderer="${nameHeaderRenderer}"
          .renderer="${this._nameRenderer}"
        ></vaadin-grid-column>

        <vaadin-grid-column
          resizable
          auto-width
          ?hidden="${this.narrow}"
          .headerRenderer="${subjectHeaderRenderer}"
          .renderer="${this._subjectRenderer}"
        ></vaadin-grid-column>

        <vaadin-grid-column
          zresizable
          ?hidden="${this.narrow}"
          .headerRenderer="${dateHeaderRenderer}"
          .renderer="${this._dateRenderer}"
        ></vaadin-grid-column>

        <vaadin-grid-column
          ?hidden="${!this.narrow}"
          .renderer="${this._narrowRenderer}"
        ></vaadin-grid-column>
      </vaadin-grid>
      <div>count ${this.data.length}</div>
    `;
  }

  firstUpdated() {
    this._registerMediaWatcher();
    this._fetchData();
  }

  _registerMediaWatcher() {
    installMediaQueryWatcher(`(min-width: 720px)`, matches => {
      this.narrow = !matches;
    });
  }

  _toggleNarrow() {
    this.narrow = !this.narrow;
  }

  _fetchData() {
    import('./contacts').then(module => {
      this._receiveData(module.data);
    });
  }

  _receiveData(data) {
    this.data = data.map(item => {
      const dt = new Date(Date.parse(item.date));
      const iso = dt.toISOString();
      return {
        ...item,
        subject: item.shortText,
        iso: iso,
      };
    });
  }

  static _basicRenderer(root, value) {
    render(
      html`
        <div>${value}</div>
      `,
      root,
    );
  }

  _functionGenerator() {
    return undefined;
  }

  _narrowRenderer(root, column, rowData) {
    const item = rowData.item;
    let styles = { backgroundColor: item.color };
    const templ = html`
      <div class="row">
        <div class="avatar" style="${styleMap(styles)}">
          <img src="${item.image}"></img>
        </div>
        <div class="flex-1">
          <div>${item.name}</div>
          <div>${item.subject}</div>
        </div>
        <div class="end">
          ${MyGrid._dateTemplate(item)}
        </div>
      </div>
    `;
    render(templ, root);
  }

  _nameHeaderRenderer(root, column) {
    MyGrid._basicRenderer(root, 'Name');
  }

  _nameRenderer(root, column, rowData) {
    MyGrid._basicRenderer(root, rowData.item.name);
  }

  _subjectHeaderRenderer(root, column) {
    MyGrid._basicRenderer(root, 'Subject');
  }

  _subjectRenderer(root, column, rowData) {
    MyGrid._basicRenderer(root, rowData.item.subject);
  }

  _dateHeaderRenderer(root, column) {
    render(
      html`
        <div class="date">Date</div>
      `,
      root,
    );
  }

  static _dateTemplate(item) {
    return html`
      <local-time
        class="date"
        month="short"
        day="numeric"
        year="numeric"
        weekday="short"
        datetime="${item.iso}"
      >
      </local-time>
    `;
  }

  _dateRenderer(root, column, rowData) {
    render(MyGrid._dateTemplate(rowData.item), root);
  }
}

window.customElements.define('my-grid', MyGrid);
