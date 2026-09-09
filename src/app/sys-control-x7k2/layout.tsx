import { Metadata } from "next";

export const metadata: Metadata = {
  title: "System Control",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SuperConfigLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
