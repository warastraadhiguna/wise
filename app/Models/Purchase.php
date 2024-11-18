<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Purchase extends Model
{
    use HasFactory;
    use Notifiable;
    use SoftDeletes;

    protected $fillable = [
        'order_user_id',
        'user_id',
        'approved_order_user_id',
        'supplier_id',
        'order_number',
        'purchase_number',
        'order_date',
        'purchase_date',
        'approve_order_date',
        'order_note',
        'purchase_note',
        'payment_status_id',
        'discount',
        'discount_percent',
        'ppn',
        'approved_user_id',
        'approve_purchase_date'
    ];

    protected static function booted()
    {
        static::created(function ($purchase) {
            PurchasePayment::create([
                'purchase_id' => $purchase->id,
                'user_id' => $purchase->user_id ?? $purchase->order_user_id,
                'amount' => 0,
            ]);
        });
    }

    public function orderUser()
    {
        return $this->belongsTo(User::class, 'order_user_id');
    }

    public function approvedOrderUser()
    {
        return $this->belongsTo(User::class, 'approved_order_user_id');
    }

    public function purchaseUser()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function approvedUser()
    {
        return $this->belongsTo(User::class, 'approved_user_id');
    }

    public function purchaseDetails()
    {
        return $this->hasMany(PurchaseDetail::class);
    }

    public function storeBranch()
    {
        return $this->belongsTo(StoreBranch::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function paymentStatus()
    {
        return $this->belongsTo(PaymentStatus::class);
    }

    public function purchasePayment()
    {
        return $this->hasMany(PurchasePayment::class);
    }
}
