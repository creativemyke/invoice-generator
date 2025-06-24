"use client";
import CustomTextInput from "@/app/component/ui/customTextInput";
import CurrencyInput from "@/app/component/ui/currencyInput";
import { currencyList } from "@/lib/currency";
import { Input } from "@/app/component/ui/input";
import { Plus, Trash2 } from "lucide-react";
import CustomNumberInput from "@/app/component/ui/customNumberInput";
import { useGetValue } from "@/app/hooks/useGetValue";
import { Controller } from "react-hook-form";
import { getItemValue } from "@/lib/getInitialValue";

type Item = {
  itemDescription: string;
  amount?: number;
  qty?: number;
};

export const InvoiceDetailsForm = () => {
  const value = useGetValue("currency", "INR");
  const currencyDetails = currencyList.find(
    (currency) => currency.value.toLowerCase() === value.toLowerCase()
  )?.details;

  return (
    <Controller
      render={({ field: { onChange, value } }) => (
        <div className="pt-24">
          <p className="text-2xl font-semibold pb-3">Invoice Details</p>
          <div className="flex flex-col gap-6">
            <div>
              <p className="pt-3 font-medium text-neutral-500">
                Select an invoice currency
              </p>
              <CurrencyInput />
            </div>
            <div>
              <p className="py-3 font-medium text-sm text-neutral-500">Items</p>
              {value.map(
                ({ itemDescription, amount, qty }: Item, index: number) => (
                  <div
                    className="flex relative items-center group -ml-8"
                    key={index}
                  >
                    <div
                      className={`w-9 h-7 ${value.length === 1 && "invisible"}`}
                    >
                      <button
                        onClick={() => {
                          const newList = [...value];
                          newList.splice(index, 1);
                          localStorage.setItem(
                            "items",
                            JSON.stringify(newList)
                          );
                          onChange(newList);
                        }}
                        type="button"
                        className="flex-shrink-0 rounded-md p-1.5 group-hover:bg-gray-50 hidden group-hover:block"
                      >
                        <Trash2 className="w-4 text-gray-500 h-4 group-hover:text-red-400" />
                      </button>
                    </div>
                    <div className="w-full flex-1">
                      <Input
                        placeholder="Item name"
                        value={itemDescription}
                        type="text"
                        onChange={(e) => {
                          const updatedArray = [...value];
                          updatedArray[index] = {
                            itemDescription: e.target.value,
                            amount,
                            qty,
                          };
                          localStorage.setItem(
                            "items",
                            JSON.stringify(updatedArray)
                          );
                          onChange(updatedArray);
                        }}
                      />
                    </div>
                    <div className="w-14">
                      <Input
                        placeholder="Qat"
                        value={`${qty || ""}`}
                        type="text"
                        pattern="[0-9]*"
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          if (
                            /^-?\d*\.?\d*$/.test(inputValue) ||
                            inputValue === ""
                          ) {
                            const updatedArray = [...value];
                            updatedArray[index] = {
                              itemDescription,
                              amount,
                              qty: +inputValue,
                            };
                            localStorage.setItem(
                              "items",
                              JSON.stringify(updatedArray)
                            );
                            onChange(updatedArray);
                          }
                        }}
                      />
                    </div>
                    <div className="w-14">
                      <Input
                        placeholder="Price"
                        value={`${amount || ""}`}
                        type="text"
                        pattern="[0-9]*"
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          if (
                            /^-?\d*\.?\d*$/.test(inputValue) ||
                            inputValue === ""
                          ) {
                            const updatedArray = [...value];
                            updatedArray[index] = {
                              itemDescription,
                              amount: +inputValue,
                              qty,
                            };
                            localStorage.setItem(
                              "items",
                              JSON.stringify(updatedArray)
                            );
                            onChange(updatedArray);
                          }
                        }}
                      />
                    </div>
                  </div>
                )
              )}
              <div className="py-3 border-dashed border-b border-gray-300">
                <button
                  onClick={() => {
                    localStorage.setItem(
                      "items",
                      JSON.stringify([...value, { itemDescription: "" }])
                    );
                    onChange([...value, { itemDescription: "" }]);
                  }}
                  type="button"
                  className="flex justify-center items-center text-orange-500 font-medium text-sm gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <p>Add Item</p>
                </button>
              </div>
            </div>
            <div>
              <p className="pt-3 font-medium text-sm text-neutral-500 pb-5">
                Note
              </p>
              <CustomTextInput placeholder="Add a note" variableName="note" />
            </div>
            <div>
              <p className="pt-3 font-medium text-sm text-neutral-500 pb-5">
                More options
              </p>
              <CustomNumberInput
                label="Discount"
                placeholder={`${currencyDetails?.currencySymbol}0`}
                variableName="discount"
              />
              <CustomNumberInput
                label="Taxes"
                placeholder="0%"
                variableName="tax"
              />
              {currencyDetails?.currencyShortForm === "NGN" && (
                <>
                  <CustomNumberInput
                    label="WHT (Withholding Tax)"
                    placeholder="0%"
                    variableName="wht"
                  />
                  {/* Balance Payable (read-only, calculated) */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Balance Payable
                    </label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-700 cursor-not-allowed"
                      value={(() => {
                        const subtotal =
                          value && value.length
                            ? value.reduce((total: number, item: Item) => {
                                const quantity = item.qty ? +item.qty : 1;
                                const amount = item.amount ? +item.amount : 0;
                                return total + quantity * amount;
                              }, 0)
                            : 0;
                        const discount = window.localStorage.getItem("discount")
                          ? +window.localStorage.getItem("discount")!
                          : 0;
                        const tax = window.localStorage.getItem("tax")
                          ? +window.localStorage.getItem("tax")!
                          : 0;
                        const wht = window.localStorage.getItem("wht")
                          ? +window.localStorage.getItem("wht")!
                          : 0;
                        const discountAmount = subtotal - discount;
                        const taxAmount = discountAmount * (tax / 100);
                        const totalAmount = discountAmount + taxAmount;
                        const whtAmount = subtotal * (wht / 100);
                        const balancePayable = totalAmount - whtAmount;
                        return `${
                          currencyDetails?.currencySymbol || ""
                        }${balancePayable.toLocaleString()}`;
                      })()}
                      readOnly
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      name="items"
      defaultValue={getItemValue()}
    />
  );
};
