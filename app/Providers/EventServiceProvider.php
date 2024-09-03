<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Auth\Events\Logout;
use App\Listeners\ClearUserSessionCache;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        Logout::class => [
            ClearUserSessionCache::class,
        ],
    ];

    public function boot()
    {
        parent::boot();
    }
}
