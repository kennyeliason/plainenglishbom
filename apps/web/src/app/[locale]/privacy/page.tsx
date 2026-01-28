import type { Metadata } from "next";
import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { generatePageMetadata } from "@/lib/seo";
import { locales } from "../../../../i18n/config";

interface PrivacyPageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PrivacyPageProps): Promise<Metadata> {
  const { locale } = await params;
  const urlPrefix = `/${locale}`;

  return generatePageMetadata({
    title:
      locale === "es"
        ? "Política de Privacidad - Libro de Mormón en Español Sencillo"
        : "Privacy Policy - Plain English Book of Mormon",
    description:
      locale === "es"
        ? "Política de privacidad para la aplicación y sitio web del Libro de Mormón en Español Sencillo."
        : "Privacy policy for the Plain English Book of Mormon app and website.",
    path: `${urlPrefix}/privacy`,
    locale,
  });
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("navigation");
  const homeUrl = locale === "en" ? "/" : `/${locale}`;

  return (
    <main className="min-h-screen bg-[#0d1520] text-[#c9d1d9]">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link
          href={homeUrl}
          className="text-[#58a6ff] hover:underline mb-8 inline-block"
        >
          &larr; {t("backToHome")}
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">
          {locale === "es" ? "Política de Privacidad" : "Privacy Policy"}
        </h1>
        <p className="text-[#8b949e] mb-8">
          {locale === "es"
            ? "Última actualización: 16 de enero de 2026"
            : "Last updated: January 16, 2026"}
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              {locale === "es" ? "Resumen" : "Overview"}
            </h2>
            <p>
              {locale === "es"
                ? 'Libro de Mormón en Español Sencillo ("nosotros", "nuestro") está comprometido a proteger tu privacidad. Esta Política de Privacidad explica cómo recopilamos, usamos y protegemos tu información cuando usas nuestra aplicación móvil y sitio web.'
                : 'Plain English Book of Mormon ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application and website.'}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              {locale === "es"
                ? "Información que Recopilamos"
                : "Information We Collect"}
            </h2>
            <p className="mb-4">
              <strong className="text-white">
                {locale === "es"
                  ? "Recopilamos información mínima:"
                  : "We collect minimal information:"}
              </strong>
            </p>
            <ul className="list-disc list-inside space-y-2 text-[#8b949e]">
              <li>
                <strong className="text-[#c9d1d9]">
                  {locale === "es" ? "Datos de análisis:" : "Analytics data:"}
                </strong>{" "}
                {locale === "es"
                  ? "Usamos Google Analytics para entender cómo los usuarios interactúan con nuestra aplicación y sitio web. Esto incluye estadísticas de uso anónimas como páginas visitadas y tiempo de lectura."
                  : "We use Google Analytics to understand how users interact with our app and website. This includes anonymous usage statistics such as pages visited and time spent reading."}
              </li>
              <li>
                <strong className="text-[#c9d1d9]">
                  {locale === "es"
                    ? "Información del dispositivo:"
                    : "Device information:"}
                </strong>{" "}
                {locale === "es"
                  ? "Se puede recopilar información básica del dispositivo para informes de errores y optimización del rendimiento de la aplicación."
                  : "Basic device information may be collected for crash reporting and app performance optimization."}
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              {locale === "es"
                ? "Información que NO Recopilamos"
                : "Information We Do NOT Collect"}
            </h2>
            <ul className="list-disc list-inside space-y-2 text-[#8b949e]">
              <li>
                {locale === "es"
                  ? "Información de identificación personal (nombre, correo electrónico, etc.)"
                  : "Personal identification information (name, email, etc.)"}
              </li>
              <li>
                {locale === "es" ? "Datos de ubicación" : "Location data"}
              </li>
              <li>
                {locale === "es"
                  ? "Contactos o libreta de direcciones"
                  : "Contacts or address book"}
              </li>
              <li>{locale === "es" ? "Fotos o medios" : "Photos or media"}</li>
              <li>
                {locale === "es"
                  ? "Información financiera"
                  : "Financial information"}
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              {locale === "es"
                ? "Cómo Usamos la Información"
                : "How We Use Information"}
            </h2>
            <p>
              {locale === "es"
                ? "La información limitada que recopilamos se usa únicamente para:"
                : "The limited information we collect is used solely to:"}
            </p>
            <ul className="list-disc list-inside space-y-2 text-[#8b949e] mt-2">
              <li>
                {locale === "es"
                  ? "Mejorar la experiencia de la aplicación y el sitio web"
                  : "Improve the app and website experience"}
              </li>
              <li>
                {locale === "es"
                  ? "Corregir errores y problemas técnicos"
                  : "Fix bugs and technical issues"}
              </li>
              <li>
                {locale === "es"
                  ? "Entender qué funciones son más útiles"
                  : "Understand which features are most useful"}
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              {locale === "es"
                ? "Almacenamiento de Datos"
                : "Data Storage"}
            </h2>
            <p>
              {locale === "es"
                ? "Todo el texto de las escrituras y tus preferencias de lectura se almacenan localmente en tu dispositivo. No almacenamos tus datos personales en nuestros servidores."
                : "All scripture text and your reading preferences are stored locally on your device. We do not store your personal data on our servers."}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              {locale === "es"
                ? "Servicios de Terceros"
                : "Third-Party Services"}
            </h2>
            <p>
              {locale === "es"
                ? "Usamos los siguientes servicios de terceros:"
                : "We use the following third-party services:"}
            </p>
            <ul className="list-disc list-inside space-y-2 text-[#8b949e] mt-2">
              <li>
                <strong className="text-[#c9d1d9]">Google Analytics:</strong>{" "}
                {locale === "es"
                  ? "Para análisis de uso anónimo"
                  : "For anonymous usage analytics"}
              </li>
              <li>
                <strong className="text-[#c9d1d9]">Expo/EAS:</strong>{" "}
                {locale === "es"
                  ? "Para distribución y actualizaciones de la aplicación"
                  : "For app distribution and updates"}
              </li>
            </ul>
            <p className="mt-2">
              {locale === "es"
                ? "Estos servicios tienen sus propias políticas de privacidad que rigen su uso de datos."
                : "These services have their own privacy policies governing their use of data."}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              {locale === "es"
                ? "Privacidad de los Niños"
                : "Children's Privacy"}
            </h2>
            <p>
              {locale === "es"
                ? "Nuestra aplicación es adecuada para todas las edades. No recopilamos intencionalmente información personal de niños menores de 13 años."
                : "Our app is suitable for all ages. We do not knowingly collect personal information from children under 13."}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              {locale === "es"
                ? "Cambios a Esta Política"
                : "Changes to This Policy"}
            </h2>
            <p>
              {locale === "es"
                ? "Podemos actualizar esta Política de Privacidad de vez en cuando. Te notificaremos de cualquier cambio publicando la nueva Política de Privacidad en esta página y actualizando la fecha de «Última actualización»."
                : "We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the «Last updated» date."}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              {locale === "es" ? "Contáctanos" : "Contact Us"}
            </h2>
            <p>
              {locale === "es"
                ? "Si tienes preguntas sobre esta Política de Privacidad, contáctanos en: "
                : "If you have questions about this Privacy Policy, please contact us at: "}
              <a
                href="mailto:support@plainenglishbom.com"
                className="text-[#58a6ff] hover:underline"
              >
                support@plainenglishbom.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
