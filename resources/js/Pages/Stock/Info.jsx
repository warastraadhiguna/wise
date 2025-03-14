import { router } from "@inertiajs/react";
import React, { useState } from "react";

const Info = ({ setShowInfo, selectedStock }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [prices, setPrices] = useState(
    selectedStock ? selectedStock.prices : []
  );
  const [isEditNumberInput, setIsEditNumberInput] = useState("");

  // Ambil average_price dari selectedStock
  const averagePrice = Number(selectedStock?.lastInfo?.average_price || 0);

  const handlePriceChange = (event, index) => {
    const value = event.target.value;
    const isDecimal = /^[0-9]*\.?[0-9]+$/.test(value);
    const updatedPrices = [...prices];
    updatedPrices[index].value = isDecimal ? value : 0;
    setPrices(updatedPrices);
  };

  const handleDefaultChange = (selectedIndex) => {
    const updatedPrices = prices.map((price, index) => ({
      ...price,
      is_default: index === selectedIndex ? "1" : "0",
    }));
    setPrices(updatedPrices);
  };

  const handleSavePrice = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    router.post("product-price-relation", prices, {
      onFinish: () => {
        setIsEditNumberInput("");
        setIsProcessing(false);
      },
      onError: () => {
        setIsProcessing(false);
      },
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
        <h2 className="text-3xl font-semibold mb-5 text-center">
          Update Prices
          <hr />
        </h2>

        <div className="max-w-4xl mx-auto">
          {/* Form info produk dalam 2 kolom */}
          <div className="flex flex-wrap -mx-2">
            {/* Barcode */}
            <div className="w-1/2 px-2 mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Barcode
              </label>
              <input
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={`${selectedStock.lastInfo.code}`}
                disabled
              />
            </div>

            {/* Name */}
            <div className="w-1/2 px-2 mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={`${selectedStock.lastInfo.name} (${selectedStock.lastInfo.unit_name})`}
                disabled
              />
            </div>
          </div>

          <div className="flex flex-wrap -mx-2">
            {/* Last Price */}
            <div className="w-1/2 px-2 mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Last Price
              </label>
              <input
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={`${Number(selectedStock.lastInfo.last_price).toLocaleString()}`}
                disabled
              />
            </div>

            {/* Average Price */}
            <div className="w-1/2 px-2 mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Average Price
              </label>
              <input
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={`${averagePrice.toLocaleString()}`}
                disabled
              />
            </div>
          </div>

          <hr />
          {/* Form Price Setting */}
          <form onSubmit={handleSavePrice}>
            <h2 className="text-2xl font-semibold text-center mb-6 mt-3">
              Price Setting
            </h2>

            {prices.map((price, index) => {
              // Hitung selisih persentase vs average_price
              const currentValue = Number(price.value) || 0;
                let diffPercentage = 0;
                let dppValue = 0;
                const ppn = 11;
              if (averagePrice > 0) {
                  diffPercentage = ((currentValue - averagePrice) / averagePrice) * 100;
                  dppValue = currentValue * (100/(100 + ppn))
              }

              return (
                <div className="mb-4 flex flex-col" key={index}>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      {price.name}
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="radio"
                        name="is_default"
                        className="ml-4"
                        checked={price.is_default === "1"}
                        disabled={isProcessing}
                        onChange={() => handleDefaultChange(index)}
                      />
                      <span
                        className="text-xs text-gray-500 cursor-pointer"
                        onClick={() => handleDefaultChange(index)}
                      >
                        Set as Default
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {/* Input Harga */}
                    <input
                      type={
                        isEditNumberInput === price.name ? "number" : "text"
                      }
                      className="block w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      value={
                        isEditNumberInput === price.name
                          ? price.value
                          : Number(price.value).toLocaleString()
                      }
                      onChange={(event) => handlePriceChange(event, index)}
                      onFocus={() => setIsEditNumberInput(price.name)}
                      disabled={isProcessing}
                      onBlur={() => setIsEditNumberInput("")}
                    />
                    {/* Input/Label Persentase */}
                    <input
                      type="text"
                      readOnly
                      className="block w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 focus:outline-none sm:text-sm"
                      value={`${diffPercentage.toFixed(2)} %`}
                          />
                    <input
                      type="text"
                      readOnly
                      className="block w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 focus:outline-none sm:text-sm"
                      value={`${Number(dppValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (DPP)`}
                    />                          
                  </div>
                </div>
              );
            })}

            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-4"
                disabled={isProcessing}
              >
                Save Price
              </button>
              <button
                type="button"
                onClick={() => setShowInfo(false)}
                className="bg-red-500 text-white font-bold py-1 px-2 rounded"
                disabled={isProcessing}
              >
                Close
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Info;
