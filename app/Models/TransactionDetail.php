<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TransactionDetail extends Model
{
    use HasFactory;
    use Notifiable;
    use SoftDeletes;

    protected $fillable = [
        'transaction_id',
        'order_user_id',
        'user_id',
        'product_id',
        'order_quantity',
        'quantity',
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

    public function transactionDetailReturns()
    {
        return $this->hasMany(TransactionDetailReturn::class);
    }
}
