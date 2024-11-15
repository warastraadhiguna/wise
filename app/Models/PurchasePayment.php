<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PurchasePayment extends Model
{
    use HasFactory;
    use Notifiable;
    use SoftDeletes;

    protected $fillable = [
        'purchase_id',
        'user_id',
        'amount',
        'note'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    public function purchase()
    {
        return $this->belongsTo(Purchase::class);
    }
}
