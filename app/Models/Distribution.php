<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Distribution extends Model
{
    use HasFactory;
    use Notifiable;
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'approved_user_id',
        'received_user_id',
        'store_branch_id',
        'number',
        'distribution_date',
        'approve_date',
        'note',
        'receiption_date',
        'is_received',
        'receiption_note'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function approvedUser()
    {
        return $this->belongsTo(User::class);
    }

    public function receivedUser()
    {
        return $this->belongsTo(User::class);
    }

    public function distributionDetails()
    {
        return $this->hasMany(DistributionDetail::class);
    }

    public function storeBranch()
    {
        return $this->belongsTo(StoreBranch::class);
    }
}
