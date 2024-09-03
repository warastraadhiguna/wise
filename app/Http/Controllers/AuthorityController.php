<?php

namespace App\Http\Controllers;

use App\Models\Path;
use Inertia\Inertia;
use App\Models\Authority;
use Illuminate\Http\Request;

class AuthorityController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $perPage = Request()->input("perPage");
        $searchingText = Request()->input("searchingText");
        $data = [
            'title' => 'Authority List',
            'authorities' => Authority::withTrashed()
            ->select('authorities.*', 'name')
            ->join('paths', 'authorities.path_id', "=", 'paths.id')
            ->orderBy('deleted_at')
            ->orderBy('name')
            ->where('name', 'LIKE', "%$searchingText%")
            ->orWhere('role', 'LIKE', "%$searchingText%")
            ->paginate($perPage),
            'searchingTextProps' => $searchingText ?? "",
            'paths' => Path::orderBy("name")->get(),
        ];

        return Inertia::render("Authority/Index", $data);
    }

    public function store(Request $request)
    {

        $data = $request->validate(
            [
                'path_id' => 'required',
                'method' => 'required',
                'role' => 'required',
            ],
            [
                'path_id.required' => 'Path name wajib diisi.',
                'method.required' => 'Method wajib diisi.',
                'role.required' => 'Role wajib diisi.',
            ]
        );

        Authority::create($data);
        return back()->with("success", 'Data berhasil disimpan');

    }

    public function update(Request $request, string $id)
    {
        $authority = Authority::withTrashed()->findOrFail($id);
        if($authority->deleted_at) {
            $authority->restore();

            return back()->with("success", 'Data berhasil dipulihkan');
        }


        $data = $request->validate(
            [
                'path_id' => 'required',
                'method' => 'required',
                'role' => 'required',
            ],
            [
                'path_id.required' => 'Path name wajib diisi.',
                'method.required' => 'Method wajib diisi.',
                'role.required' => 'Role wajib diisi.',
            ]
        );

        $authority->update($data);

        return back()->with("success", 'Data berhasil diubah');
    }

    public function destroy(string $id)
    {
        $authority = Authority::withTrashed()->findOrFail($id);

        $deletedAtStatus = $authority->deleted_at ? true : false;

        if ($deletedAtStatus) {
            $authority->forceDelete();
        } else {
            $authority->delete();
        }

        return back()->with("success", 'Data berhasil dihapus' . ($deletedAtStatus ? " SELAMANYA" : ""));
    }
}
