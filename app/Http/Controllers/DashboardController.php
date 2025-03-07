<?php

namespace App\Http\Controllers;

use App\Models\StoreBranch;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {

        $data = [
            'title' => 'Dashboard',
            'storeBranchs' => StoreBranch::get(),
            'selectedStoreBranchId' => session('selectedStoreBranchId', '')
        ];

        return Inertia::render("Dashboard", $data);
    }

    public function update(Request $request)
    {
        session()->put('selectedStoreBranchId', $request->storeBranchId ?? "1");
        return back()->with("success", 'Data berhasil diubah');
    }
}
