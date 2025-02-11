<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class MutationDetail extends Model
{
    use HasFactory;
    use Notifiable;

    protected $fillable = [
        'mutation_id',
        'product_id',
        'user_id',
        'quantity',
        'quantity_copy',
        'purchase_detail_id'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
