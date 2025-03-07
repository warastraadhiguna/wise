import React from "react";
import { useState } from "react";
import { useEffect } from "react";

const Invoice = ({ transaction, details }) => {
    const [totalSum, setTotalSum] = useState(0);
    const [grandtotal, setGrandtotal] = useState(0);

    const numberToWord = (angka) => {
    // Pastikan tipe data adalah number
    if (typeof angka !== "number") {
        angka = Number(angka);
    }

    // Tangani angka 0
    if (angka === 0) return "";

    // Tangani angka negatif
    if (angka < 0) {
        return `minus ${numberToWord(Math.abs(angka))}`;
    }

    const satuan = [
        "", "Satu", "Dua", "Tiga", "Empat",
        "Lima", "Enam", "Tujuh", "Delapan",
        "Sembilan", "Sepuluh", "Sebelas"
    ];

    // Rentang kondisi rekursif
    if (angka < 12) {
        return satuan[angka];
    } else if (angka < 20) {
        return `${numberToWord(angka - 10)} Belas`;
    } else if (angka < 100) {
        return `${numberToWord(Math.floor(angka / 10))} Puluh ${numberToWord(angka % 10)}`.trim();
    } else if (angka < 200) {
        return `Seratus ${numberToWord(angka - 100)}`.trim();
    } else if (angka < 1000) {
        return `${numberToWord(Math.floor(angka / 100))} Ratus ${numberToWord(angka % 100)}`.trim();
    } else if (angka < 2000) {
        return `Seribu ${numberToWord(angka - 1000)}`.trim();
    } else if (angka < 1000000) {
        // < 1 juta
        return `${numberToWord(Math.floor(angka / 1000))} Ribu ${numberToWord(angka % 1000)}`.trim();
    } else if (angka < 1000000000) {
        // < 1 miliar
        return `${numberToWord(Math.floor(angka / 1000000))} Juta ${numberToWord(angka % 1000000)}`.trim();
    } else if (angka < 1000000000000) {
        // < 1 triliun
        return `${numberToWord(Math.floor(angka / 1000000000))} Miliar ${numberToWord(angka % 1000000000)}`.trim();
    } else {
        // Di atas 1 triliun, tambahkan logika 'triliun' jika perlu
        return "Nilai terlalu besar";
    }
    };
    useEffect(() => {
        const total = details.reduce((acc, transactionDetail) => {
            const totalPerRow =
                transactionDetail.quantity *
                (transactionDetail.price -
                    transactionDetail.discount -
                    (transactionDetail.price *
                        transactionDetail.discount_percent) /
                        100);
            return acc + totalPerRow;
        }, 0);
        setTotalSum(total);
        const grandTotal =
            total -
            transaction.discount -
            (total * transaction.discount_percent) / 100;
        setGrandtotal(
            Math.round(grandTotal + (grandTotal * transaction.ppn) / 100)
        );
    }, [details]);
    // console.log(transaction);
    return (
        <div className="invoice-container">
            {/* Header & Info Toko */}
            <div className="header">
                {/* Bagian Kiri */}
                <div className="left-header">
                    <h2 className="store-name">
                        {transaction.store_branch.displayed_name}
                    </h2>
                    <p className="location">
                        {transaction.store_branch.address}
                    </p>
                    <p className="location">{transaction.store_branch.city}</p>
                </div>

                {/* Bagian Kanan */}
                <div className="right-header">
                    <h2 className="invoice-title">FAKTUR PENJUALAN</h2>

                    <table className="info-table">
                        <tbody>
                            <tr>
                                <td className="label-cell">Tanggal Faktur</td>
                                <td className="colon-cell">:</td>
                                <td className="value-cell">
                                    {transaction.transaction_date
                                        ? transaction.transaction_date
                                            .split("-")
                                            .reverse()
                                            .join("-")
                                        : ""}
                                </td>
                            </tr>
                            <tr>
                                <td className="label-cell">No. Faktur</td>
                                <td className="colon-cell">:</td>
                                <td className="value-cell">
                                    {transaction.number}
                                </td>
                            </tr>
                            <tr>
                                <td className="label-cell">Cara Bayar</td>
                                <td className="colon-cell">:</td>
                                <td className="value-cell">
                                    {transaction.payment_status.name}
                                </td>
                            </tr>
                            <tr>
                                <td className="label-cell">Total Bayar</td>
                                <td className="colon-cell">:</td>
                                <td className="value-cell">
                                    Rp {Number(grandtotal).toLocaleString()}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Informasi Pelanggan */}
            <div className="customer-info">
                <p>
                    <strong>
                        {transaction.customer
                            ? "Kepada " + transaction.customer.name
                            : ""}{" "}
                    </strong>
                </p>
            </div>

            <div className="invoice-details">
                {/* Tabel Detail Barang */}
                <table className="item-table">
                    <thead>
                        <tr>
                            <th scope="col">No</th>
                            <th scope="col">Name</th>
                            <th scope="col">Qty</th>
                            <th scope="col">Unit</th>
                            <th scope="col">Price</th>
                            <th scope="col">Disc.</th>
                            <th scope="col">Disc. %</th>
                            <th scope="col">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {details
                            .filter(
                                (transactionDetail) =>
                                    transactionDetail.quantity !== null
                            )
                            .map((transactionDetail, i) => (
                                <tr
                                    key={i}
                                    className={`bg-white border-b dark:bg-gray-800 dark:border-gray-700`}
                                >
                                    <td
                                        scope="row"
                                        className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white "
                                    >
                                        {i + 1}
                                    </td>
                                    <td className="px-6 py-4">
                                        {transactionDetail.product
                                            ? transactionDetail.product.name
                                            : ""}
                                        {transactionDetail.product
                                            ? " (" +
                                              transactionDetail.product.code +
                                              ")"
                                            : ""}
                                    </td>
                                    <td className="px-6 py-4 cursor-pointer">
                                        {Number(
                                            transactionDetail.quantity
                                        ).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        {transactionDetail.product
                                            ? transactionDetail.product.unit
                                                  .name
                                            : ""}
                                    </td>
                                    <td className="px-6 py-4 cursor-pointer">
                                        {Number(
                                            transactionDetail.price
                                        ).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 cursor-pointer">
                                        {Number(
                                            transactionDetail.discount
                                        ).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 cursor-pointer">
                                        {Number(
                                            transactionDetail.discount_percent
                                        ).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        {Number(
                                            transactionDetail.quantity *
                                                (transactionDetail.price -
                                                    transactionDetail.discount -
                                                    (transactionDetail.price *
                                                        transactionDetail.discount_percent) /
                                                        100)
                                        ).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
                <div className="footer">
                    {/* BAGIAN KIRI */}
                    <div className="footer-left">
                        <p className="amount-in-words">
                            {numberToWord(grandtotal)} Rupiah
                        </p>
                        <div className="signature-section">
                            <div className="sign-row">
                                <div>Tanda Terima</div>
                                <div>Diperiksa</div>
                                <div>Dikemas</div>
                            </div>

                        </div>
                    </div>

                    {/* BAGIAN KANAN */}
                    <div className="footer-right">
                        <table className="summary-table">
                            <tbody>
                                <tr>
                                    <td className="label-cell">Total</td>
                                    <td className="colon-cell">:</td>
                                    <td className="value-cell">
                                        {Number(totalSum).toLocaleString()}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="label-cell">Potongan</td>
                                    <td className="colon-cell">:</td>
                                    <td className="value-cell">
                                        {Number(
                                            transaction.discount
                                        ).toLocaleString()}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="label-cell">Disc</td>
                                    <td className="colon-cell">:</td>
                                    <td className="value-cell">
                                        {Number(
                                            transaction.discount_percent
                                        ).toLocaleString()}{" "}
                                        %
                                    </td>
                                </tr>
                                <tr>
                                    <td className="label-cell">PPN</td>
                                    <td className="colon-cell">:</td>
                                    <td className="value-cell">
                                        {Number(
                                            (grandtotal * transaction.ppn) / 100
                                        ).toLocaleString()}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="label-cell">Total Bayar</td>
                                    <td className="colon-cell">:</td>
                                    <td className="value-cell">
                                        {Number(grandtotal).toLocaleString()}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="label-cell">Bayar</td>
                                    <td className="colon-cell">:</td>
                                    <td className="value-cell">
                                        {Number(
                                            transaction.transaction_payments[0]
                                                .payment
                                        ).toLocaleString()}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="label-cell">Kembali</td>
                                    <td className="colon-cell">:</td>
                                    <td className="value-cell">
                                        {Number(
                                            transaction.transaction_payments[0]
                                                .payment -
                                                transaction
                                                    .transaction_payments[0]
                                                    .amount
                                        ).toLocaleString()}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <style>{`
  /* ========== KONTAINER UTAMA ========== */
  .invoice-container {
    width: 210mm;
    margin: 0 auto;
    font-family: Arial, sans-serif;
    color: #000;
    padding: 10mm;
  }

  /* ========== HEADER ========== */
  .header {
    display: flex;
    justify-content: flex-start; /* agar tidak terlalu jauh ke kanan */
    align-items: flex-start;
    gap: 300px; /* beri jarak horizontal antara left-header & right-header */
  }

  /* BAGIAN KIRI */
  .left-header {
    width: 50%;
    text-align: center; /* 'UD Mukti Wibowo' dkk di tengah */
  }
  .store-name {
    font-size: 32px;
    font-weight: bold;
    margin-bottom: 5px;
  }
  .store-sub {
    font-size: 14px;
    margin: 0;
  }
  .customer-label {
    margin-top: 10px;
    font-size: 12px;
  }

  /* BAGIAN KANAN */
  .right-header {
    width: 60%;
    text-align: right; /* text di area kanan, bisa diubah ke 'left' jika diinginkan */
  }
  .invoice-title {
    font-size: 16px;
    font-weight: bold;
    text-decoration: underline;
    margin-bottom: 5px;
  }

  /* ========== BAGIAN TENGAH/BODY ========== */
  .invoice-body {
    margin-top: 15px;
    font-size: 12px;
  }

  /* ========== DETAIL INVOICE (TABEL BARANG, TOTAL, DST.) ========== */
  .invoice-details {
    margin-top: 10px;
    font-size: 12px;
  }

  .item-table {
    width: 100%;
    border-collapse: collapse; /* Penting agar garis menyatu */
  }

  /* Header: garis tebal di bagian paling atas & di bawah header */
  .item-table thead tr {
    border-top: 2px solid #000;    /* garis tebal paling atas */
    border-bottom: 2px solid #000; /* garis tebal di bawah header */
  }

  .item-table th {
    padding: 5px;
    text-align: center;
  }

  /* Body: tidak ada garis antar baris */
  .item-table tbody tr {
    border-bottom: none; /* Hilangkan garis antar-baris */
  }

  /* Hanya baris terakhir di tbody yang punya garis tebal */
  .item-table tbody tr:last-child {
    border-bottom: 2px solid #000; /* garis tebal di bawah baris terakhir */
  }

  .item-table td {
    padding: 5px;
    text-align: center;
  }

  /* Total dalam Huruf */
    .footer {
          display: flex;
          justify-content: space-between;
          margin-top: 10px; /* Jarak atas dari tabel barang */
          font-size: 12px;
        }

        /* BAGIAN KIRI */
        .footer-left {
          width: 60%; /* Lebar area kiri */
        }
        .amount-in-words {
          margin: 5mm 0 3mm;
          font-style: italic;
        }

        /* Area Tanda Tangan */
        .signature-section {
          margin-top: 5mm;
        }
        .sign-row {
          display: flex;
          justify-content: space-around; /* Supaya Tanda Terima, Diperiksa, Dikemas tersebar merata */
          margin-bottom: 5mm;
        }
        .sign-row > div {
          width: 33%;
          text-align: center;
        }

        /* BAGIAN KANAN */
        .footer-right {
          width: 22%; /* Lebar area kanan */
          text-align: left;
        }

        /* Tabel Ringkasan Pembayaran */
        .summary-table {
          border-collapse: collapse;
        }
        .summary-table td {
          padding: 2px 5px;
          vertical-align: top;
        }
        .label-cell {
          white-space: nowrap;
          font-weight: bold;
        }
        .colon-cell {
          width: 5px; /* Lebar kolom titik dua */
          text-align: center;
          font-weight: bold;
        }
        .value-cell {
            font-weight: bold;
            text-align: right;            
        }

  /* ========== STYLE TABEL LABEL : TITIK DUA : NILAI ========== */
  /* Tabel untuk menampilkan Tanggal Faktur, No. Faktur, dsb. secara rapi */
  .info-table {
    border-collapse: collapse; /* Hilangkan jarak default antarkolom */
    margin: 0 auto; /* jika ingin center table di area .right-header (opsional) */
  }
  .info-table td {
    padding: 2px 5px;
    vertical-align: top;
    font-size: 14px; /* Sesuaikan ukuran teks dengan layout */
  }

  /* ========== PENGATURAN CETAK (UKURAN HALAMAN) ========== */
  @media print {
    @page {
      size: 210mm 148mm; /* Contoh half continuous form, sesuaikan kebutuhan */
      margin: 10mm;
    }
  }
`}</style>
        </div>
    );
};

export default Invoice;
