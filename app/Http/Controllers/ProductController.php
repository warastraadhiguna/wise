<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Unit;
use Inertia\Inertia;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        $perPage = Request()->input("perPage");
        $perPage ??= 10;
        $searchingText = Request()->input("searchingText");

        $data = [
            'title' => 'Product List',
            'products' => Product::withTrashed()
            ->with('user', 'productCategory', 'unit', 'brand')
            ->where('name', 'LIKE', "%$searchingText%")
            ->orderBy('deleted_at')
            ->orderBy('name')
            ->paginate($perPage)
            ->appends([
                'perPage' => $perPage,
                'searchingText' => $searchingText,
            ]),
            'searchingTextProps' => $searchingText ?? "",
            'productCategories' => ProductCategory::orderBy('name')->get(),
            'brands' => Brand::orderBy('name')->get(),
            'units' => Unit::orderBy('name')->get()
        ];

        return Inertia::render("Product/Index", $data);
    }

    public function store(Request $request)
    {
        $request->merge([
            'note' => $request->input('note', ''),
        ]);

        $data = $request->validate(
            [
                'product_category_id' => 'nullable',
                'brand_id'  => 'nullable',
                'unit_id' => 'required',
                'code' =>
                    [
                        'nullable',
                        'required_if:product_category_id,null',
                        'string',
                        'unique:products'
                    ],
                'name' => 'required|string',
                'note' => 'nullable|string',
            ],
            [
                'name.required' => 'Name wajib diisi.',
                'unit_id.required' => 'Unit wajib diisi.',
                'code.unique' => 'Barcode wajib unik.',
                'code.required_if' => 'Jika menggunakan autogenerated, product category wajib diisi'
            ]
        );

        if (!$data['code']) {
            $productCategoryId = $request->input('product_category_id');

            $lastOrder = Product::where('product_category_id', $productCategoryId)
                            ->whereRaw('LENGTH(code) = 6')
                            ->orderBy('id', 'desc')
                            ->value('code');

            $lastOrderNumber = $lastOrder ? (int) substr($lastOrder, -5) : 0;
            $newOrderNumber = $lastOrderNumber + 1;
            $formattedOrderNumber = str_pad($newOrderNumber, 5, '0', STR_PAD_LEFT);

            $data['code'] = $productCategoryId . $formattedOrderNumber;
        }

        $data['user_id'] = $request->user()->id;

        Product::create($data);
        return back()->with("success", 'Data berhasil disimpan');
    }

    public function update(Request $request, string $id)
    {
        $product = Product::withTrashed()->findOrFail($id);
        if ($product->deleted_at) {
            $product->restore();

            return back()->with("success", 'Data berhasil dipulihkan');
        }

        $data = $request->validate(
            [
                'product_category_id' => 'nullable',
                'brand_id'  => 'nullable',
                'unit_id' => 'required',
                'code' => 'required|string|unique:products,code,' . $product->id,
                'name' => 'required|string',
                'note' => 'string',
            ],
            [
                'name.required' => 'Name wajib diisi.',
                'unit_id.required' => 'Unit wajib diisi.',
                'code.required' => 'Barcode wajib diisi.',
                'code.unique' => 'Barcode wajib unik.',
            ]
        );

        $data['user_id'] = $request->user()->id;

        $product->update($data);

        return back()->with("success", 'Data berhasil diubah');
    }

    public function destroy(string $id)
    {
        $product = Product::withTrashed()->findOrFail($id);

        $deletedAtStatus = $product->deleted_at ? true : false;

        if ($deletedAtStatus) {
            $product->forceDelete();
        } else {
            $product->delete();
        }

        return back()->with("success", 'Data berhasil dihapus' . ($deletedAtStatus ? " SELAMANYA" : ""));
    }
}
