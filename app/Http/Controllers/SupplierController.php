<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use App\Models\PriceCategory;
use Inertia\Inertia;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function index()
    {
        $perPage = Request()->input("perPage");
        $searchingText = Request()->input("searchingText");

        $data = [
            'title' => 'Supplier List',
            'suppliers' => Supplier::withTrashed()
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

        return Inertia::render("Supplier/Index", $data);
    }

    public function store(Request $request)
    {
        $data = $request->validate(
            [
                'name' => 'required|string',
                'company_name'  => 'required|string',
                'address' => 'required|string',
                'email' => 'nullable|string|email',
                'phone' => 'required|string',
                'bank_account' => 'nullable|string',
                'note' => 'nullable|string',
            ],
            [
                'name.required' => 'Name wajib diisi.',
                'company_name.required' => 'Name perusahaan wajib diisi.',
                'address.required' => 'Alamat wajib diisi.',
                'phone.required' => 'Telepon wajib diisi.',
            ]
        );

        $data['user_id'] = $request->user()->id;

        Supplier::create($data);
        return back()->with("success", 'Data berhasil disimpan');
    }

    public function update(Request $request, string $id)
    {
        $supplier = Supplier::withTrashed()->findOrFail($id);
        if($supplier->deleted_at) {
            $supplier->restore();

            return back()->with("success", 'Data berhasil dipulihkan');
        }


        $data = $request->validate(
            [
                'name' => 'required|string',
                'company_name'  => 'required|string',
                'address' => 'required|string',
                'email' => 'nullable|string|email',
                'phone' => 'required|string',
                'bank_account' => 'nullable|string',
                'note' => 'nullable|string',
            ],
            [
                'name.required' => 'Name wajib diisi.',
                'company_name.required' => 'Name perusahaan wajib diisi.',
                'address.required' => 'Alamat wajib diisi.',
                'phone.required' => 'Telepon wajib diisi.',
            ]
        );

        $data['user_id'] = $request->user()->id;

        $supplier->update($data);

        return back()->with("success", 'Data berhasil diubah');
    }

    public function destroy(string $id)
    {
        $supplier = Supplier::withTrashed()->findOrFail($id);

        $deletedAtStatus = $supplier->deleted_at ? true : false;

        if ($deletedAtStatus) {
            $supplier->forceDelete();
        } else {
            $supplier->delete();
        }

        return back()->with("success", 'Data berhasil dihapus' . ($deletedAtStatus ? " SELAMANYA" : ""));
    }
}
