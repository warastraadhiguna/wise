<?php

namespace App\Models;

use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    use HasFactory;
    use Notifiable;
    use SoftDeletes;

    protected $fillable = [
        "product_category_id",
        "brand_id",
        "unit_id",
        "code",
        "name",
        "note",
        "user_id"
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function productCategory()
    {
        return $this->belongsTo(ProductCategory::class);
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function priceRelations()
    {
        return $this->hasMany(ProductPriceRelation::class);
    }

    // public static function getPurchasedProduct($searchingText = "", $supplierId = "", $perPage = 10)
    // {
    //     $searchingText = trim($searchingText);

    //     $query = DB::table('products')
    //         ->select('products.*', 'units.name as unit_name')
    //         ->leftJoin('units', 'units.id', '=', 'products.unit_id')
    //         ->whereNull('products.deleted_at');

    //     // Jika ada pencarian text
    //     if (!empty($searchingText)) {
    //         if (strpos($searchingText, ' ') !== false) {
    //             $keywords = explode(' ', $searchingText);
    //             foreach ($keywords as $keyword) {
    //                 $query->where(function ($subQuery) use ($keyword) {
    //                     $subQuery->where('products.name', 'like', '%' . $keyword . '%');
    //                 });
    //             }
    //         } else {
    //             $query->where('products.name', 'like', '%' . $searchingText . '%')
    //                 ->orWhere('code', '=', $searchingText);
    //         }
    //     }

    //     // Jika ada filter supplier ID
    //     if (!empty($supplierId)) {
    //         $query->where('supplier_id', $supplierId);
    //     }
    //     $query->orderBy("products.name");
    //     // Paginate hasil query
    //     return $query->paginate($perPage)->appends([
    //             'perPage' => $perPage,
    //             'searchingText' => $searchingText,
    //         ]);
    // }
}