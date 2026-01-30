import Configuration from "@db/Configuration";
import { currencyFormat } from "@libraries/utils";

export default function useTemplateShare() {
  const getTemplate = async (type, data) => {
    // const header = await getHeader();

    if (type == "balance") {
      return getTemplateBalance(data);
    } else if (type == "task") {
      return getTemplateTask(data);
    } else if (type == "order") {
      return getTemplateOrder(data);
    } else if (type == "payment") {
      return getTemplatePayment(data);
    } else if (type == "efc") {
      return getTemplateEDocument(data);
    }
  };

  const getTemplateBalance = async (data) => {
    const { balance, account } = data;

    const header = await getHeader();

    let html = `
    ${header}
    <h2>Cuenta Corriente ${account}</h2>
    <table style="border-collapse: collapse; width: 100%;">
      <thead>
        <tr>
          <th style="text-align:left">Fecha</th>
          <th style="text-align:left">Comprobante</th>
          <th style="text-align:left">Detalle</th>
          <th style="text-align:right">Importe</th>
        </tr>
      </thead>
      <tbody>
    `;

    let style = "";

    balance.forEach((item) => {
      if (item.idcomprobante == "SALDO ANTERIOR" || item.idcomprobante == "SALDO ACTUAL") {
        style = "font-weight: bold; font-size: 17px;";
      } else {
        style = "";
      }

      html += `
      <tr style="border-bottom:1px solid #e1e1e1;">
        <td style="text-align:left;"><small>${item.fecha}</small></td>
        <td style="text-align:left; ${style}"><small>${item.tc} ${item.idcomprobante}</small></td>
        <td style="text-align:left;"><small>${item.detalle.trim()}</small></td>
        <td style="text-align:right; ${style}"><small>${currencyFormat(item.importe)}</small></td>
      </tr>
      `;
    });

    html += `
      </tbody>
      </table>

      ${getFooter()}

    `;

    return html;
  };

  const getTemplateTask = async (data) => {
    const { payload } = data;

    const header = await getHeader();
    let html = header;

    html += `
    <html>
      <body>
        <div style="width: 90%; padding: 10px; border: 1px solid #e1e1e1">
          <h2>Detalle de tarea realizada</h2>
        </div>

        <div style="margin-top: 10px; width: 90%; padding: 10px; border: 1px solid #e1e1e1">
          <p><b>Fecha:</b> ${payload.date}</p>
          <p><b>Cuenta:</b> ${payload?.account} - ${payload.accountName}</p>
          <p><b>Técnico:</b> ${payload.seller} - ${payload.sellerName}</p>
          <br />
          <p><b>Servicio:</b> ${payload.service} - ${payload.serviceName}</p>
          <p><b>Observaciones:</b> ${payload.obs}</p>
        </div>

        <div style="margin-top: 10px; width: 90%; padding: 10px; border: 1px solid #e1e1e1">
          <p><b>Firma del cliente:</b></p>
          <img style="width: 300px; height: 300px" src="${payload.sign}" />
        </div>
        ${getFooter()}
      </body>
    </html>
    `;

    return html;
  };

  const getTemplateOrder = async (data) => {
    console.log(data);
    const { order, products, accountName } = data;
    const isInventory = order?.tc === "IR";
    const isReception = order?.tc === "RP";
    const title = isInventory ? "Toma de inventario" : isReception ? "Recepción de compras" : `Pedido nro ${order.id}`;

    let detailProducts = () => {
      let html = "";
      products.forEach((product) => {
        if (isInventory || isReception) {
          html += `
          <tr>
            <td style="text-align: left; padding: 10px">${product.name}</td>
            <td style="text-align: right; padding: 10px">${product.quantity}</td>
          </tr>`;
          return;
        }
        const total =
          product.disc > 0
            ? (product[`price${order.price_class}`] - (product.disc * product[`price${order.price_class}`]) / 100) * product.quantity
            : product[`price${order.price_class}`] * product.quantity;
        html += `
        <tr>
          <td style="text-align: left; padding: 10px">${product.name}</td>
          <td style="text-align: right; padding: 10px">${product.quantity}</td>
          <td style="text-align: right; padding: 10px">${currencyFormat(product[`price${order.price_class}`])}</td>
          <td style="text-align: right; padding: 10px">% ${product.disc.toFixed(2)}</td>
          <td style="text-align: right; padding: 10px">${currencyFormat(total)}</td>
        </tr>`;
      });

      return html;
    };

    const header = await getHeader();
    let html = header;

    html += `
    <html>
      <body>
        <div style="width: 95%; padding: 10px; border: 1px solid #e1e1e1">
          <h2>${title}</h2>
        </div>
    
        <div style="margin-top: 10px; width: 95%; padding: 10px; border: 1px solid #e1e1e1">
          <p><b>Fecha:</b> ${order?.date}</p>
          ${isInventory
        ? `<p><b>Observaciones:</b> ${order?.obs || ""}</p>`
        : isReception
          ? `<p><b>Cuenta:</b> ${order?.account} - ${accountName}</p>
             <p><b>Observaciones:</b> ${order?.obs || ""}</p>`
          : `<p><b>Cuenta:</b> ${order?.account} - ${accountName}</p>`
      }
        </div>
    
        <div style="margin-top: 5px; width: 95%;">
          <p><b>Detalle:</b></p>
    
          <table border="1" style="border-collapse: collapse; width: 100%">
            <thead>
              <tr>
                <th style="text-align: left; padding: 10px">Producto</th>
                <th style="text-align: right; padding: 10px">Cantidad</th>
                ${(isInventory || isReception)
        ? ""
        : `<th style="text-align: right; padding: 10px">Importe</th>
                   <th style="text-align: right; padding: 10px">% Dto.</th>
                   <th style="text-align: right; padding: 10px">Total</th>`
      }
              </tr>
            </thead>
    
            <tbody>
              ${detailProducts()}
              ${(isInventory || isReception)
        ? ""
        : `<tr>
                <td style="padding: 10px" colspan="4"><b>TOTAL</b></td>
                <td style="padding: 10px; text-align: right"><b>${currencyFormat(order.total)}</b></td>
              </tr>`
      }
            </tbody>
          </table>
        </div>
        ${getFooter()}
      </body>
    </html>
    `;

    return html;
  };

  const getTemplateEDocument = async (data) => {
    // console.log(data)
    const { order, products, sellerName, accountName } = data;

    let detailProducts = () => {
      let html = "";
      products.forEach((product) => {
        // console.log(product)
        const total =
          product?.disc > 0
            ? (product.price1 - (product.disc * product.price1) / 100) * product.quantity
            : product.price1 * product.quantity;
        html += `
        <tr>
          <td style="text-align: left; padding: 10px">${product.name}</td>
          <td style="text-align: right; padding: 10px">${product.quantity}</td>
          <td style="text-align: right; padding: 10px">${currencyFormat(product.price1)}</td>
          <td style="text-align: right; padding: 10px">% ${product?.disc?.toFixed(2)}</td>
          <td style="text-align: right; padding: 10px">${currencyFormat(total)}</td>
        </tr>`;
      });

      return html;
    };

    const header = await getHeader();
    let html = header;

    html += `
    <html>
      <body>
        <div style="width: 95%; padding: 10px; border: 1px solid #e1e1e1">
          <h2>Factura ${order.ecpte}</h2>
        </div>
    
        <div style="margin-top: 10px; width: 95%; padding: 10px; border: 1px solid #e1e1e1">
          <p><b>Fecha:</b> ${order?.date}</p>
          <p><b>Cuenta:</b> ${order?.account} - ${accountName}</p>
          <p><b>Vendedor:</b> ${order?.id_seller} - ${sellerName}</p>
        </div>
    
        <div style="margin-top: 5px; width: 95%;">
          <p><b>Detalle:</b></p>
    
          <table border="1" style="border-collapse: collapse; width: 100%">
            <thead>
              <tr>
                <th style="text-align: left; padding: 10px">Producto</th>
                <th style="text-align: right; padding: 10px">Cantidad</th>
                <th style="text-align: right; padding: 10px">Importe</th>
                <th style="text-align: right; padding: 10px">% Dto.</th>
                <th style="text-align: right; padding: 10px">Total</th>
              </tr>
            </thead>
    
            <tbody>
              ${detailProducts()}
              <tr>
                <td style="padding: 10px" colspan="4"><b>TOTAL</b></td>
                <td style="padding: 10px; text-align: right"><b>${currencyFormat(order.total)}</b></td>
              </tr>
            </tbody>
          </table>
          <span style="display:block; width:100%; text-align:center; margin-top:10px;">AFIP Comprobante Autorizado - CAE : ${order?.cae} - Vto. CAE : ${order.vto_cae}</span>
        </div>
        ${getFooter()}
      </body>
    </html>
    `;

    return html;
  };

  const getTemplatePayment = async (data) => {
    const { accountName, date, sellerName, payments, invoices } = data;
    const header = await getHeader();

    let paymentsHtml = "";
    let invoicesHtml = "";
    let totalPayments = 0;
    let totalInvoices = 0;

    payments.map((payment) => {

      paymentsHtml += `
      <tr>
        <td scope="row" style="font-size:80%; padding: 5px; border: 1px solid #e1e1e1;">${payment.name}</td>
        <td scope="row" style="font-size:80%; padding: 5px; text-align: right; border: 1px solid #e1e1e1;">${currencyFormat(payment.amount)}</td>
        <td scope="row" style="font-size:80%; padding: 5px; border: 1px solid #e1e1e1;">${payment.checkNumber}</td>
      </tr>
      `
      totalPayments += parseFloat(payment.amount)
    })

    invoices.map((invoice) => {
      if (invoice.checked) {
        invoicesHtml += `
        <tr>
          <td scope="row" style="font-size:80%; padding: 5px; border: 1px solid #e1e1e1;">${invoice.fecha}</td>
          <td scope="row" style="font-size:80%; padding: 5px; border: 1px solid #e1e1e1;">${invoice.tc} ${invoice.idcomprobante}</td>
          <td scope="row" style="font-size:80%; padding: 5px; text-align: right; border: 1px solid #e1e1e1;">${invoice.saldo}</td>
        </tr>
        `
        totalInvoices += parseFloat(invoice.saldo)
      }
    })

    let html = `
    ${header}
    <div style="padding: 10px; border: 1px solid #e1e1e1">
      <h3>Recibo - No válido como factura</h3>
      <p>Fecha : ${date}</p>
      <p>Cuenta : ${accountName}</p>
      <p>Vendedor : ${sellerName}</p>

      <div style="display: flex;gap: 10px">
        <div style="flex-grow: 1;">
          <h4>Medios de pago</h4>
          <table style="width: 100%; border: 1px solid #e1e1e1; border-collapse: collapse;">
            <thead>
              <tr>
                <th style="padding: 5px; border: 1px solid #e1e1e1;" scope="col">Medio de pago</th>
                <th scope="col" style="padding: 5px; text-align: right; border: 1px solid #e1e1e1;">Importe</th>
                <th style="padding: 5px; border: 1px solid #e1e1e1;" scope="col">Adicional</th>
              </tr>
            </thead>
            <tbody>
              ${paymentsHtml}
              <tr>
                <td scope="row" style="font-size:80%; padding: 5px; border: 1px solid #e1e1e1;"><b>Total</b></td>
                <td scope="row" style="font-size:80%; padding: 5px; text-align: right; border: 1px solid #e1e1e1;"><b>${currencyFormat(totalPayments)}</b></td>
                <td scope="row" style="font-size:80%; padding: 5px; border: 1px solid #e1e1e1;"></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="flex-grow: 1;">
            <h4>Comprobantes aplicados</h4>
            <table style="width: 100%; border: 1px solid #e1e1e1; border-collapse: collapse;">
              <thead>
                <tr>
                  <th style="padding: 5px; border: 1px solid #e1e1e1;" scope="col">Fecha</th>
                  <th style="padding: 5px; border: 1px solid #e1e1e1;" scope="col">Comprobante</th>
                  <th scope="col" style="padding: 5px; text-align: right; border: 1px solid #e1e1e1;">Importe</th>
                </tr>
              </thead>
              <tbody>
                ${invoicesHtml}
                <tr>
                  <td scope="row" style="font-size:80%; padding: 5px; border: 1px solid #e1e1e1;"></td>
                  <td scope="row" style="font-size:80%; padding: 5px; border: 1px solid #e1e1e1;"><b>Total</b></td>
                  <td scope="row" style="font-size:80%; padding: 5px; text-align: right; border: 1px solid #e1e1e1;"><b>${currencyFormat(totalInvoices)}</b></td>
                </tr>
              </tbody>
            </table>
        </div>
      </div>
    </div>
    ${getFooter()}
    `;

    return html;
  };

  async function getHeader() {
    const location = await Configuration.getConfigValue("EMP_DOMICILIO");
    const email = await Configuration.getConfigValue("EMP_EMAIL");
    const phone = await Configuration.getConfigValue("EMP_TELEFONO");
    const name = await Configuration.getConfigValue("EMP_NOMBRE");

    let html = `
    <div style="padding: 10px; margin-bottom: 10px;">
      <span style="font-size:18px; font-weight: bold;">${name}</span><br />
      <span>${location}</span><br />
      <span>${email} - ${phone}</span>
    </div>
    `;

    return html;
  }

  function getFooter() {
    let html = `
      <div style="text-align:center; margin-top:20px;">
        <small>Creado por Alfa Net - www.alfagestion.com.ar</small>
      </div>
    `;

    return html;
  }

  return { getTemplate };
}
