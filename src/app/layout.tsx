import type { Metadata } from "next";
import "./globals.css";
import { withBasePath } from "@/lib/asset-path";
import FirstVisitIntro from "@/components/public/FirstVisitIntro";

export const metadata: Metadata = {
  title: "Porto de Registro | Horários de Ônibus — Vale do Ribeira",
  description:
    "Consulte horários, rotas e tarifas dos ônibus da Porto de Registro. Transporte intermunicipal no Vale do Ribeira: Registro, Cajati, Jacupiranga, Eldorado, Iguape, Miracatu, Juquiá, Sete Barras e região.",
  keywords: [
    "Porto de Registro",
    "ônibus Vale do Ribeira",
    "horários ônibus Registro",
    "transporte intermunicipal",
    "Cajati",
    "Jacupiranga",
    "Eldorado",
    "Iguape",
    "Miracatu",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1a5c2a" />
        <link rel="icon" href={withBasePath('/favicon.ico')} />
      </head>
      <body>
        <FirstVisitIntro />
        {children}
      </body>
    </html>
  );
}
