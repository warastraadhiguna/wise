<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\PriceCategory;
use Inertia\Inertia;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index()
    {
        $perPage = Request()->input("perPage");
        $searchingText = Request()->input("searchingText");

        $data = [
            'title' => 'Customer List',
            'customers' => Customer::withTrashed()
            ->with('user', 'priceCategory')
            ->where('name', 'LIKE', "%$searchingText%")
            ->orWhere('company_name', 'LIKE', "%$searchingText%")
            ->orWhere('phone', 'LIKE', "%$searchingText%")
            ->orderBy('deleted_at')
            ->orderBy('name')
            ->paginate($perPage),
            'searchingTextProps' => $searchingText ?? "",
            'priceCategories' => PriceCategory::orderBy('index')->get()
        ];

        return Inertia::render("Customer/Index", $data);
    }

    public function store(Request $request)
    {
        $data = $request->validate(
            [
                'price_category_id' => 'required',
                'name' => 'required|string',
                'company_name'  => 'required|string',
                'address' => 'required|string',
                'email' => 'nullable|string|email',
                'phone' => 'required|string',
                'bank_account' => 'nullable|string',
                'note' => 'nullable|string',
            ],
            [
                'price_category_id.requred' => 'Jenis harga wajib diisi.',
                'name.required' => 'Name wajib diisi.',
                'company_name.required' => 'Name perusahaan wajib diisi.',
                'address.required' => 'Alamat wajib diisi.',
                'phone.required' => 'Telepon wajib diisi.',
            ]
        );

        $data['user_id'] = $request->user()->id;

        Customer::create($data);
        return back()->with("success", 'Data berhasil disimpan');
    }

    public function update(Request $request, string $id)
    {
        $customer = Customer::withTrashed()->findOrFail($id);
        if($customer->deleted_at) {
            $customer->restore();

            return back()->with("success", 'Data berhasil dipulihkan');
        }


        $data = $request->validate(
            [
                'price_category_id' => 'required',
                'name' => 'required|string',
                'company_name'  => 'required|string',
                'address' => 'required|string',
                'email' => 'nullable|string|email',
                'phone' => 'required|string',
                'bank_account' => 'nullable|string',
                'note' => 'nullable|string',
            ],
            [
                'price_category_id.requred' => 'Jenis harga wajib diisi.',
                'name.required' => 'Name wajib diisi.',
                'company_name.required' => 'Name perusahaan wajib diisi.',
                'address.required' => 'Alamat wajib diisi.',
                'phone.required' => 'Telepon wajib diisi.',
            ]
        );

        $data['user_id'] = $request->user()->id;

        $customer->update($data);

        return back()->with("success", 'Data berhasil diubah');
    }

    public function destroy(string $id)
    {
        $customer = Customer::withTrashed()->findOrFail($id);

        $deletedAtStatus = $customer->deleted_at ? true : false;

        if ($deletedAtStatus) {
            $customer->forceDelete();
        } else {
            $customer->delete();
        }

        return back()->with("success", 'Data berhasil dihapus' . ($deletedAtStatus ? " SELAMANYA" : ""));
    }
}
