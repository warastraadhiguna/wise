import React, { useEffect, useState } from "react";
import dateFormat from "dateformat";

const Receipt = ({ transaction, details }) => {
  const [totalSum, setTotalSum] = useState(0);
  const [grandtotal, setGrandtotal] = useState(0);
  const [dpp, setDpp] = useState(0);

  // Fungsi konversi angka ke dalam kata (jika diperlukan)
  const numberToWord = (angka) => {
    if (typeof angka !== "number") {
      angka = Number(angka);
    }
    if (angka === 0) return "";
    if (angka < 0) return `minus ${numberToWord(Math.abs(angka))}`;
    const satuan = [
      "", "Satu", "Dua", "Tiga", "Empat",
      "Lima", "Enam", "Tujuh", "Delapan",
      "Sembilan", "Sepuluh", "Sebelas"
    ];
    if (angka < 12) return satuan[angka];
    if (angka < 20) return `${numberToWord(angka - 10)} Belas`;
    if (angka < 100) return `${numberToWord(Math.floor(angka / 10))} Puluh ${numberToWord(angka % 10)}`.trim();
    if (angka < 200) return `Seratus ${numberToWord(angka - 100)}`.trim();
    if (angka < 1000) return `${numberToWord(Math.floor(angka / 100))} Ratus ${numberToWord(angka % 100)}`.trim();
    if (angka < 2000) return `Seribu ${numberToWord(angka - 1000)}`.trim();
    if (angka < 1000000) return `${numberToWord(Math.floor(angka / 1000))} Ribu ${numberToWord(angka % 1000)}`.trim();
    if (angka < 1000000000) return `${numberToWord(Math.floor(angka / 1000000))} Juta ${numberToWord(angka % 1000000)}`.trim();
    if (angka < 1000000000000) return `${numberToWord(Math.floor(angka / 1000000000))} Miliar ${numberToWord(angka % 1000000000)}`.trim();
    return "Nilai terlalu besar";
  };

  useEffect(() => {
    // Hitung total sum dan average (jika diperlukan)
    const total = details.reduce((acc, transactionDetail) => {
      const totalPerRow =
        transactionDetail.quantity *
        (transactionDetail.price -
          transactionDetail.discount -
          (transactionDetail.price *
            transactionDetail.discount_percent) / 100);
      return acc + totalPerRow;
    }, 0);
    setTotalSum(total);

    // Grand Total = Total - Discount - (Total * discount_percent / 100)
    const grandTotal =
      total -
      transaction.discount -
      (total * transaction.discount_percent) / 100;
    setGrandtotal(Math.round(grandTotal));

    // DPP = GrandTotal / (1 + PPn/100)
    setDpp(
      Math.round(
        grandTotal * (100 / (100 + Number(transaction.ppn)))
      )
    );
  }, [details, transaction.discount, transaction.discount_percent, transaction.ppn]);

  return (
    <div className="receipt-container">
      {/* Header: Store Info */}
      <div className="receipt-header">
        <h2 className="store-name">
          {transaction.store_branch.displayed_name}
        </h2>
        <p className="store-address">{transaction.store_branch.address}</p>
        <p className="store-city">{transaction.store_branch.city}</p>
      </div>

      {/* Title & Transaction Info */}
      <div className="receipt-title">
        <h2>STRUK PENJUALAN</h2>
        <table className="receipt-info-table">
          <tbody>
            <tr>
              <td className="label">Nomor</td>
              <td className="colon">:</td>
              <td className="value">{transaction.number}</td>
            </tr>
            <tr>
              <td className="label">Tanggal</td>
              <td className="colon">:</td>
              <td className="value">
                {transaction.transaction_date
                  ? transaction.transaction_date.split("-").reverse().join("-")
                  : ""}
              </td>
            </tr>                      
            <tr>
              <td className="label">Bayar</td>
              <td className="colon">:</td>
                          <td className="value">Rp {Number(grandtotal).toLocaleString()}</td>
            </tr>
            <tr>
              <td className="label">Pelanggan</td>
              <td className="colon">:</td>
              <td className="value">{transaction.customer ? transaction.customer.name : "-"}</td>
            </tr>                      
          </tbody>
        </table>
      </div>

      {/* Detail Items */}
      <div className="receipt-details">
        <table className="receipt-item-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama</th>
              <th>Qty</th>
              <th>Harga</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {details.map((transactionDetail, i) => (
              <tr key={i}>
                <td className="td-center">{i + 1}</td>
                <td>{transactionDetail.product ? transactionDetail.product.name : ""}</td>
                <td className="td-center">
                  {Number(transactionDetail.quantity).toLocaleString()}
                </td>
                <td className="td-right">
                  {Number(transactionDetail.price).toLocaleString()}
                </td>
                <td className="td-right">
                  {Number(
                    transactionDetail.quantity *
                      (transactionDetail.price -
                        transactionDetail.discount -
                        (transactionDetail.price *
                          transactionDetail.discount_percent) / 100)
                  ).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="receipt-summary">
        <table className="summary-table">
          <tbody>
            <tr>
              <td className="label">Total</td>
              <td className="colon">:</td>
              <td className="value">{Number(totalSum).toLocaleString()}</td>
            </tr>
            <tr>
              <td className="label">Diskon</td>
              <td className="colon">:</td>
              <td className="value">{Number(transaction.discount).toLocaleString()}</td>
            </tr>
            <tr>
              <td className="label">Grand Total</td>
              <td className="colon">:</td>
              <td className="value">{Number(grandtotal).toLocaleString()}</td>
            </tr>
            <tr>
              <td className="label">DPP</td>
              <td className="colon">:</td>
              <td className="value">{Number(dpp).toLocaleString()}</td>
            </tr>
            <tr>
              <td className="label">PPn</td>
              <td className="colon">:</td>
              <td className="value">{Number(grandtotal - dpp).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer: Amount in Words & Signature */}
      <div className="receipt-footer">
        <p className="thanks-note">
          Terimakasih
        </p>
      </div>

      <style jsx>{`
        .receipt-container {
          width: 80mm;
          margin: 0 auto;
          padding: 2mm;
          font-family: monospace;
          font-size: 10px;
          color: #000;
        }
        .receipt-header {
          text-align: center;
          margin-bottom: 3mm;
        }
        .store-name {
          font-size: 12px;
          font-weight: bold;
        }
        .receipt-title {
          text-align: center;
          margin-bottom: 3mm;
        }
        .receipt-info-table {
          width: 100%;
          margin: 0 auto;
          font-size: 10px;
        }
        .receipt-info-table .label {
          text-align: left;
          width: 35%;
        }
        .receipt-info-table .colon {
          width: 5%;
          text-align: center;
        }
        .receipt-info-table .value {
          text-align: right;
          width: 60%;
        }
        .receipt-customer {
          margin-bottom: 3mm;
          text-align: center;
        }
        .receipt-item-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10px;
        }
        .receipt-item-table th,
        .receipt-item-table td {
          padding: 1mm;
          border-bottom: 1px dashed #000;
        }
        .td-center {
          text-align: center;
        }
        .td-right {
          text-align: right;
        }
        .receipt-summary {
          margin-top: 3mm;
          font-size: 10px;
        }
        .summary-table {
          width: 100%;
        }
        .summary-table .label {
          text-align: left;
          font-weight: bold;
        }
        .summary-table .colon {
          width: 5%;
          text-align: center;
          font-weight: bold;
        }
        .summary-table .value {
          text-align: right;
        }
        .receipt-footer {
          margin-top: 3mm;
          text-align: center;
          font-size: 10px;
        }
        .thanks-note {
          margin-bottom: 2mm;
        }
        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }
          .receipt-container {
            padding: 1mm;
          }
        }
      `}</style>
    </div>
  );
};

export default Receipt;
