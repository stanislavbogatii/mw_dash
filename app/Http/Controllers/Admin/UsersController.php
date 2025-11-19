<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UsersController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/users/index', [
            'users' => User::with('roles')->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/users/create', [
            'roles' => Role::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['email'],
            'password' => ['required', 'string', 'min:6'],
            'username' => ['required', 'string', 'unique:users,username'],
            'roles'    => ['array'],
            'roles.*'  => ['string'],
        ]);
        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'username' => $validated['username'],
            'password' => bcrypt($validated['password']),
        ]);

        if (!empty($validated['roles'])) {
            $user->syncRoles($validated['roles']);
        }

        return redirect()->route('admin.users.index');
    }

    public function edit(User $user)
    {
        return Inertia::render('admin/users/edit', [
            'user' => $user->load('roles'),
            'roles' => Role::all(),
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['email'],
            'password' => ['nullable', 'string'],
            'username' => ['required', 'string', 'unique:users,username,' . $user->username],
            'roles' => ['array'],
            'roles.*' => ['string'],
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->username = $validated['username'];
        if ($validated['password']) {
            $user->password = bcrypt($validated['password']);
        }
        $user->save();
        $user->syncRoles($validated['roles'] ?? []);

        return redirect()->route('admin.users.index');
    }
}
