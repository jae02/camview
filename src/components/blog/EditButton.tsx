"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PenSquare } from "lucide-react";

export default function EditButton({ slug }: { slug: string }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if admin_auth cookie exists (client-side check)
    setIsAdmin(document.cookie.includes('admin_auth='));
  }, []);

  if (!isAdmin) return null;

  return (
    <Link
      href={`/admin/edit/${slug}`}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
    >
      <PenSquare className="w-4 h-4" />
      수정하기
    </Link>
  );
}
