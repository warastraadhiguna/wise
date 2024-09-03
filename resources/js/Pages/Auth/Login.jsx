import Checkbox from "@/Components/Checkbox";
import GeneralLayout from "@/Layouts/GeneralLayout";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <GeneralLayout>
            <Head title="Log in" />
            <div className="border-2 border-gray-300 rounded-lg p-10 flex flex-col items-center">
                <img src="/logo.png" className="h-52 object-cover mb-8" />
                <form onSubmit={submit} className="w-full md:w-[400px]">
                    <div>
                        <InputLabel
                            htmlFor="email"
                            value="Email"
                            className="block text-gray-700 font-semibold mb-2"
                        />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full border border-gray-300 rounded-lg"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData("email", e.target.value)}
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel
                            htmlFor="password"
                            value="Password"
                            className="block text-gray-700 font-semibold mb-2"
                        />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full border border-gray-300 rounded-lg"
                            autoComplete="current-password"
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                        />
                        <InputError
                            message={errors.password}
                            className="mt-2"
                        />
                    </div>

                    <div className="block mt-4">
                        <label className="flex items-center">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) =>
                                    setData("remember", e.target.checked)
                                }
                            />
                            <span className="ms-2 text-sm text-gray-600">
                                Remember me
                            </span>
                        </label>
                    </div>

                    <div className="flex items-center justify-end mt-4">
                        <PrimaryButton
                            className="ms-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
                            disabled={processing}
                        >
                            Log in
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </GeneralLayout>
    );
}
