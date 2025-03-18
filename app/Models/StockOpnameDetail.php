<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class StockOpnameDetail extends Model
{
    use HasFactory;
    use Notifiable;
    use SoftDeletes;

    protected $fillable = [
        'stock_opname_id',
        'user_id',
        'product_id',
        'quantity',
        'quantity_copy',
        'last_quantity',
        'price',
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

}
