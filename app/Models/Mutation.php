<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Mutation extends Model
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
        'mutation_date',
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

    public function mutationDetails()
    {
        return $this->hasMany(MutationDetail::class);
    }

    public function storeBranch()
    {
        return $this->belongsTo(StoreBranch::class);
    }
}
