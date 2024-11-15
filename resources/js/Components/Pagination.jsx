import { Link } from "@inertiajs/react";
import React from "react";

const Pagination = ({ data, isHideInformation }) => {
    const links = data.links;
    const currentPage = data.current_page - 1;
    const lastPage = data.last_page;
    const totalData = data.total;
    const pageSize = data.per_page;

    return (
        <div className="container mx-auto my-3">
            <div className="grid grid-cols-2 gap-4">
                <div>
                {!isHideInformation && 
                    <p  className="hidden md:block">
                        {`Number ${
                            totalData === 0 ? 0 : currentPage * pageSize + 1
                        } - ${
                            currentPage * pageSize + pageSize >= totalData
                                ? totalData
                                : currentPage * pageSize + pageSize
                        }  From Total ${totalData} Data`}
                    </p>
                }
                </div>

                <div className="flex justify-end items-center">
                    <nav aria-label="Page navigation example">
                        <ul className="inline-flex -space-x-px text-base h-10">
                            {links.map((link, i) => {
                                return (
                                    <li key={i}>
                                        <Link
                                            href={link.url}
                                            className={`flex items-center justify-center px-4 h-10 leading-tight text-gray-500 ${
                                                link.active
                                                    ? "bg-slate-200"
                                                    : "bg-white"
                                            } border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white ${
                                                i == 0 ? "rounded-s-md" : ""
                                            } ${
                                                i == links.length - 1
                                                    ? "rounded-e-md"
                                                    : ""
                                            } ${
                                                i == 0 &&
                                                currentPage == 1 &&
                                                "hidden"
                                            }  ${
                                                i == links.length - 1 &&
                                                currentPage == lastPage &&
                                                "hidden"
                                            }`}
                                        >
                                            <div
                                                dangerouslySetInnerHTML={{
                                                    __html:
                                                        link.label ==
                                                        "pagination.previous"
                                                            ? "&laquo"
                                                            : link.label ==
                                                            "pagination.next"
                                                            ? "&raquo"
                                                            : link.label,
                                                }}
                                            ></div>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default Pagination;
