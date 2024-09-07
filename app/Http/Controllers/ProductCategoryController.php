<?php

namespace App\Http\Controllers;

use App\Models\ProductCategory;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules;
use Illuminate\Support\Facades\Hash;

class ProductCategoryController extends Controller
{
    public function index()
    {
        $perPage = Request()->input("perPage");
        $searchingText = Request()->input("searchingText");

        $data = [
            'title' => 'Product Category List',
            'productCategories' => ProductCategory::withTrashed()
            ->with('user')
            ->orderBy('deleted_at')
            ->orderBy('name')
            ->where('name', 'LIKE', "%$searchingText%")
            ->orWhere('note', 'LIKE', "%$searchingText%")
            ->paginate($perPage),
            'searchingTextProps' => $searchingText ?? "",
        ];

        return Inertia::render("ProductCategory/Index", $data);
    }

    public function store(Request $request)
    {
        $data = $request->validate(
            [
                'name' => 'required|string',
                'note' => 'nullable|string',
            ],
            [
                'name.required' => 'Name wajib diisi.',
            ]
        );

        $data['user_id'] = $request->user()->id;

        ProductCategory::create($data);
        return back()->with("success", 'Data berhasil disimpan');
    }

    public function update(Request $request, string $id)
    {
        $productCategory = ProductCategory::withTrashed()->findOrFail($id);
        if($productCategory->deleted_at) {
            $productCategory->restore();

            return back()->with("success", 'Data berhasil dipulihkan');
        }


        $data = $request->validate(
            [
                'name' => 'required|string',
                'note' => 'nullable|string',
            ],
            [
                'name.required' => 'Name wajib diisi.',
            ]
        );

        $data['user_id'] = $request->user()->id;

        $productCategory->update($data);

        return back()->with("success", 'Data berhasil diubah');
    }

    public function destroy(string $id)
    {
        $productCategory = ProductCategory::withTrashed()->findOrFail($id);

        $deletedAtStatus = $productCategory->deleted_at ? true : false;

        if ($deletedAtStatus) {
            $productCategory->forceDelete();
        } else {
            $productCategory->delete();
        }

        return back()->with("success", 'Data berhasil dihapus' . ($deletedAtStatus ? " SELAMANYA" : ""));
    }
}
