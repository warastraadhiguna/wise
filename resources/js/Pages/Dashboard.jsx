import AdminLayout from "@/Layouts/AdminLayout";
import { usePage } from "@inertiajs/react";
import { useEffect } from "react";
import toast from "react-hot-toast";

export default function Dashboard({ auth }) {

    const { flash } = usePage().props;
    
    useEffect(() => {
        flash.success && toast.success(flash.success);
        flash.error && toast.error(flash.error);
    }, [flash]);

    return (
        <AdminLayout>
            <h2>Dashboard</h2>
        </AdminLayout>
    );
}