import Link from "next/link";

interface NavbarProps {
  brand: string;
  links: { label: string; href: string }[];
}

export function Navbar({ brand, links }: NavbarProps) {
  return (
    <nav className="flex items-center justify-between px-6 py-4 shadow-sm bg-white sticky top-0 z-50">
      <div className="text-xl font-bold text-emerald-600">{brand}</div>
      <div className="hidden md:flex space-x-6">
        {links.map((link, i) => (
          <Link key={i} href={link.href} className="text-gray-600 hover:text-emerald-600">
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
