import type { Metadata } from "next";
import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { generatePageMetadata } from "@/lib/seo";
import { locales } from "../../../../i18n/config";

interface SupportPageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: SupportPageProps): Promise<Metadata> {
  const { locale } = await params;
  const urlPrefix = `/${locale}`;

  return generatePageMetadata({
    title:
      locale === "es"
        ? "Soporte - Libro de Mormón en Español Sencillo"
        : "Support - Plain English Book of Mormon",
    description:
      locale === "es"
        ? "Obtén ayuda con la aplicación del Libro de Mormón en Español Sencillo. Contáctanos con preguntas, comentarios o problemas."
        : "Get help with the Plain English Book of Mormon app. Contact us with questions, feedback, or issues.",
    path: `${urlPrefix}/support`,
    locale,
  });
}

export default async function SupportPage({ params }: SupportPageProps) {
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

        <h1 className="text-3xl font-bold text-white mb-8">
          {locale === "es" ? "Soporte" : "Support"}
        </h1>

        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-3">
              {locale === "es" ? "Contáctanos" : "Contact Us"}
            </h2>
            <p className="mb-4">
              {locale === "es"
                ? "¿Tienes preguntas, comentarios o necesitas ayuda con la aplicación del Libro de Mormón en Español Sencillo? Nos encantaría saber de ti."
                : "Have questions, feedback, or need help with the Plain English Book of Mormon app? We'd love to hear from you."}
            </p>
            <p>
              {locale === "es" ? "Correo electrónico: " : "Email: "}
              <a
                href="mailto:support@plainenglishbom.com"
                className="text-[#58a6ff] hover:underline"
              >
                support@plainenglishbom.com
              </a>
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">
              {locale === "es"
                ? "Preguntas Frecuentes"
                : "Frequently Asked Questions"}
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-white">
                  {locale === "es"
                    ? "¿Qué es el Libro de Mormón en Español Sencillo?"
                    : "What is the Plain English Book of Mormon?"}
                </h3>
                <p className="text-[#8b949e]">
                  {locale === "es"
                    ? "Es una traducción moderna del Libro de Mormón que convierte el lenguaje arcaico estilo Rey Jacobo a un inglés claro y fácil de entender, preservando el significado original."
                    : "It's a modern translation of the Book of Mormon that converts archaic King James-style language into clear, easy-to-understand English while preserving the original meaning."}
                </p>
              </div>

              <div>
                <h3 className="font-medium text-white">
                  {locale === "es"
                    ? "¿Cuánto cuesta la aplicación?"
                    : "How much does the app cost?"}
                </h3>
                <p className="text-[#8b949e]">
                  {locale === "es"
                    ? "La aplicación cuesta $0.99 sin anuncios ni suscripciones."
                    : "The app costs $0.99 with no ads or subscriptions."}
                </p>
              </div>

              <div>
                <h3 className="font-medium text-white">
                  {locale === "es"
                    ? "¿La aplicación funciona sin conexión?"
                    : "Does the app work offline?"}
                </h3>
                <p className="text-[#8b949e]">
                  {locale === "es"
                    ? "Sí, una vez descargada, puedes leer todo el Libro de Mormón sin conexión a internet."
                    : "Yes, once downloaded, you can read the entire Book of Mormon without an internet connection."}
                </p>
              </div>

              <div>
                <h3 className="font-medium text-white">
                  {locale === "es"
                    ? "¿Qué tan precisa es la traducción?"
                    : "How accurate is the translation?"}
                </h3>
                <p className="text-[#8b949e]">
                  {locale === "es"
                    ? "Usamos una combinación de transformaciones basadas en reglas e IA para modernizar el lenguaje mientras preservamos cuidadosamente la precisión doctrinal y el significado."
                    : "We use a combination of rule-based transformations and AI to modernize the language while carefully preserving doctrinal accuracy and meaning."}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">
              {locale === "es"
                ? "Reportar un Problema"
                : "Report an Issue"}
            </h2>
            <p>
              {locale === "es"
                ? "¿Encontraste un error o problema de traducción? Por favor envíanos un correo a "
                : "Found a bug or translation error? Please email us at "}
              <a
                href="mailto:support@plainenglishbom.com"
                className="text-[#58a6ff] hover:underline"
              >
                support@plainenglishbom.com
              </a>{" "}
              {locale === "es"
                ? "con detalles sobre el problema, incluyendo el libro y capítulo donde lo encontraste."
                : "with details about the issue, including the book and chapter where you found it."}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
