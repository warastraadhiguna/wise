<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Transaction extends Model
{
    use HasFactory;
    use Notifiable;
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'customer_id',
        'number',
        'transaction_date',
        'note',
        'payment_status_id',
        'discount',
        'discount_percent',
        'ppn',
        'approved_user_id',
        'approve_transaction_date',
        'store_branch_id'
    ];

    // protected static function booted()
    // {
    //     static::created(function ($transaction) {
    //         TransactionPayment::create([
    //             'transaction_id' => $transaction->id,
    //             'user_id' => $transaction->user_id,
    //             'amount' => 0,
    //         ]);
    //     });
    // }

    public function transactionUser()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function approvedUser()
    {
        return $this->belongsTo(User::class, 'approved_user_id');
    }

    public function transactionDetails()
    {
        return $this->hasMany(TransactionDetail::class);
    }

    public function storeBranch()
    {
        return $this->belongsTo(StoreBranch::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function paymentStatus()
    {
        return $this->belongsTo(PaymentStatus::class);
    }

    public function transactionPayments()
    {
        return $this->hasMany(TransactionPayment::class);
    }
}
