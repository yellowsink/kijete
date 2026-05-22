import { $, useEffect, store, html, If, For, Fragment, render } from "voby";
import { base64_encode } from "./b64"
import { cook } from "./cooker"

const data = store({ barcodes: [] });

const removeBarcode = (i) => void data.barcodes.splice(i, 1);

const swapBarcodes = (i) => {
  const tmp = data.barcodes[i + 1];
  data.barcodes[i + 1] = data.barcodes[i];
  data.barcodes[i] = tmp;
};

const addBarcode = () =>
  data.barcodes.push({ name: "", type: "code128", data: "" });

function generatePebbleURL() {

  const data_with_cooked = {
    ...data,
    barcodes: data.barcodes.map(bc => ({
      ...bc,
      cooked: cook(bc)
    }))
  }

  console.log(data_with_cooked);

  const data_str = base64_encode(JSON.stringify(data_with_cooked));

  var return_to =
    new URLSearchParams(location.search).get("return_to") ||
    "pebblejs://close#";
  location.href = return_to + data_str;
}

const UIBarcode = (i) => {
  const select = $();

  useEffect(() => {
    if (select()) select().value = data.barcodes[i].type;
  });

  return html`
    <div class="UIBarcode">
      Barcode ${i + 1}
      <button class="btn btn_right" onClick=${() => removeBarcode(i)}>
        <i class="fa fa-trash-o"></i>
      </button>
      <${If} when=${data.barcodes.length < 1}>
        <button class="btn btn_right" onClick=${() => swapBarcodes(i)}>
          <i class="fa fa-arrow-down"></i>
        </button>
      <//>
      <${If} when=${i > 0}>
        <button class="btn btn_right" onClick=${() => swapBarcodes(i - 1)}>
          <i class="fa fa-arrow-up"></i>
        </button>
      <//>

      <table class="UIBarcodeInput">
        <tr>
          <td>Name</td>
          <td class="UIInputBox">
            <input
              type="text"
              value=${() => data.barcodes[i].name}
              onInput=${(ev) => (data.barcodes[i].name = ev.target.value)}
            />
          </td>
        </tr>
        <tr>
          <td>Type</td>
          <td class="UIInputDropdown">
            <select
              ref=${select}
              onInput=${(ev) => (data.barcodes[i].type = ev.target.value)}
            >
              <optgroup label="Linear">
                <option value="code128">Code 128</option>
              </optgroup>
              <optgroup label="Matrix">
                <option value="azteccode">Aztec</option>
                <option value="datamatrix">Data Matrix</option>
                <option value="pdf417">PDF 417</option>
                <option value="qrcode">QR Code</option>
              </optgroup>
            </select>
          </td>
        </tr>
        <tr>
          <td>Data</td>
          <td class="UIInputBox">
            <input
              type="text"
              maxlength=${() => (data.barcodes[i].type === "code128" ? 16 : "")}
              onInput=${(ev) => (data.barcodes[i].data = ev.target.value)}
            />
          </td>
        </tr>
      </table>
    </div>
  `;
};

const App = () => html`
  <div id="UIHeader">
    <button onClick=${addBarcode} class="btn">New</button>
    <button onClick=${generatePebbleURL} class="btn">Save</button>
  </div>

  <div id="UIBarcodeListContainer">
    ${() => data.barcodes.map((_, i) => UIBarcode(i))}
  </div>
`;

render(App, document.body);
