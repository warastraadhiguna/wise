<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProductPriceRelation extends Model
{
    use HasFactory;
    use Notifiable;

    protected $fillable = [
        'user_id',
        'product_id' ,
        'price_category_id',
        'value',
        'is_default',
    ];

    public function priceCategory()
    {
        return $this->belongsTo(PriceCategory::class);
    }
}