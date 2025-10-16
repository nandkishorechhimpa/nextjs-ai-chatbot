import Image from "next/image";
import Link from "next/link";

export const Header = () => {
  return (
    <header className="sticky top-0 flex items-center justify-center w-full  gap-2 py-1.5 ">
      <Link href={"/"} className="flex items-center gap-1 cursor-pointer">
        <Image
          src="/logo/LogoWhiteBack.webp"
          alt="logo"
          className="mil-logo "
          width={140}
          height={45}
          style={{ width: 140 }}
        />
      </Link>

    </header>
  );
}