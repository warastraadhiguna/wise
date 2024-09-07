<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Customer extends Model
{
    use HasFactory;
    use Notifiable;
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'price_category_id',
        'name',
        'company_name' ,
        'address',
        'email',
        'phone',
        'bank_account',
        'note',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function priceCategory()
    {
        return $this->belongsTo(PriceCategory::class);
    }
}
