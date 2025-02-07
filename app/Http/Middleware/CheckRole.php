<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $role = Auth::user()->role;
        $authorities = Cache::get('authorities_key');

        $filteredByMethod = $authorities->filter(function ($authority) use ($request) {
            return stripos($authority->method, $request->method()) !== false;
        });


        $filteredByRole = $authorities->filter(function ($authority) use ($request) {
            return stripos($authority->name, explode('/', $request->getPathInfo())[1]) !== false;
        });

        if (!session()->has('selectedStoreBranchId')) {
            return redirect('/dashboard')->with("error", 'Anda harus memilih toko-saat-ini, terlebih dahulu!!');
        }

        if ($role == "superadmin" || (sizeof($filteredByMethod) > 0 && sizeof($filteredByRole) > 0)) {
            return $next($request);
        }

        return redirect('/dashboard')->with("error", 'Anda tidak berhak menggunakan fitur tersebut.');
    }
}
