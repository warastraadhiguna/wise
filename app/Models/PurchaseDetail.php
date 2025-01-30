<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PurchaseDetail extends Model
{
    use HasFactory;
    use Notifiable;
    use SoftDeletes;

    protected $fillable = [
        'purchase_id',
        'order_user_id',
        'user_id',
        'product_id',
        'order_quantity',
        'quantity',
        'quantity_copy',
        'price',
        'discount_percent',
        'discount',
        'quantity'
    ];

    public function orderUser()
    {
        return $this->belongsTo(User::class, 'order_user_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function purchaseDetailReturns()
    {
        return $this->hasMany(PurchaseDetailReturn::class);
    }
}
