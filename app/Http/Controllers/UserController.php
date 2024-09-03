<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {
        $perPage = Request()->input("perPage");
        $searchingText = Request()->input("searchingText");
        $data = [
            'title' => 'User List',
            'users' => User::withTrashed()
            ->orderBy('deleted_at')
            ->orderBy('name')
            ->where('name', 'LIKE', "%$searchingText%")
            ->orWhere('email', 'LIKE', "%$searchingText%")
            ->paginate($perPage),
            'searchingTextProps' => $searchingText ?? "",
        ];

        return Inertia::render("User/Index", $data);
    }

    public function store(Request $request)
    {
        $data = $request->validate(
            [
                'name' => 'required|min:3',
                'email' => 'required|string|lowercase|email|max:255|unique:users',
                'password' => ['required',  Rules\Password::defaults()],
                'role' => 'required',
            ],
            [
                'name.required' => 'Name wajib diisi.',
                'name.min' => 'Minimal karakter nama ada 3 karakter',
                'email.required' => 'Email wajib diisi.',
                'email.unique' => 'Email wajib unik.',
                'password.required' => 'Password wajib diisi.',
                'role.required' => 'Role wajib diisi.',
            ]
        );

        $data['password'] = Hash::make($request->password);

        User::create($data);
        return back()->with("success", 'Data berhasil disimpan');
    }

    public function update(Request $request, string $id)
    {
        $user = User::withTrashed()->findOrFail($id);
        if($user->deleted_at) {
            $user->restore();

            return back()->with("success", 'Data berhasil dipulihkan');
        }


        $data = $request->validate(
            [
            'name' => 'required',
            'email' => 'required|string|lowercase|email|max:255|unique:users,email,' . $user->id,
            'password' =>  ['nullable',  Rules\Password::defaults()],
            'role' => 'required',
            ],
            [
                'name.required' => 'Name wajib diisi.',
                'name.min' => 'Minimal karakter nama ada 3 karakter',
                'email.required' => 'Email wajib diisi.',
                'email.unique' => 'Email wajib unik.',
                'password.required' => 'Password wajib diisi.',
                'role.required' => 'Role wajib diisi.',
            ]
        );

        $data["password"] = $request->password ? Hash::make($request->password) : $user->password;

        $user->update($data);

        return back()->with("success", 'Data berhasil diubah');
    }

    public function destroy(string $id)
    {
        $user = User::withTrashed()->findOrFail($id);

        $deletedAtStatus = $user->deleted_at ? true : false;

        if ($deletedAtStatus) {
            $user->forceDelete();
        } else {
            $user->delete();
        }

        return back()->with("success", 'Data berhasil dihapus' . ($deletedAtStatus ? " SELAMANYA" : ""));
    }
}
