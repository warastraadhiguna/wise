<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class StockOpname extends Model
{
    use HasFactory;
    use Notifiable;
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'approved_user_id',
        'store_branch_id',
        'number',
        'stock_opname_date',
        'approve_stock_opname_date',
        'note',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function approvedUser()
    {
        return $this->belongsTo(User::class, 'approved_user_id');
    }

    public function stockOpnameDetails()
    {
        return $this->hasMany(StockOpnameDetail::class);
    }

    public function storeBranch()
    {
        return $this->belongsTo(StoreBranch::class);
    }


}
