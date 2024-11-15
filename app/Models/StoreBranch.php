<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class StoreBranch extends Model
{
    use HasFactory;
    use Notifiable;
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'displayed_name',
        'address',
        'city',
        'phone',
        'email',
        'bank_account',
        'note',
        'minimum_stok',
        'minimum_margin',
        'ppn',
        'ppn_out',
        'pph',
        'ceiling_threshold',
        'footer1',
        'footer2',
        'index',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}