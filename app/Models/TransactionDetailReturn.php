<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransactionDetailReturn extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'transaction_detail_id',
        'note',
        'quantity',
    ];
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
