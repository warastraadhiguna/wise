<?php

namespace App\Http\Middleware;

use App\Models\UserCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $userCategories = Cache::get('user_categories_key');

        $roles = $userCategories == null ? null : $userCategories->map(function ($userCategory) {
            return ['value' => $userCategory->name, 'label' => ucfirst($userCategory->name)];
        })->toArray();

        return [
            ...parent::share($request),
            'appName' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'methods' => [['value' => 'get', 'label' => 'Read'], ['value' => 'post', 'label' => 'Create'], ['value' => 'put', 'label' => 'Update'], ['value' => 'delete', 'label' => 'Delete']],
            'roles' => $roles
        ];
    }
}
