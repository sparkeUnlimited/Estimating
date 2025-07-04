import Image from "next/image";

export default function Logo() {
  return (
    <Image
      src="/assets/img/larger_icon.png"
      alt="logo"
      width={100}
      height={100}
      style={{ objectFit: "contain" }}
    />
  );
}
