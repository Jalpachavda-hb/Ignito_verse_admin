import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";

interface PlaceholderPageProps {
  title: string;
}

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div>
      <PageMeta
        title={`${title} | IgnitoVerse Admin`}
        description={`${title} page for IgnitoVerse Admin Dashboard`}
      />
      <PageBreadcrumb pageTitle={title} />
      <div className="min-h-[500px] rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] xl:p-8">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h3 className="mb-3 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
            {title}
          </h3>
          <p className="max-w-md text-sm text-gray-500 dark:text-gray-400 sm:text-base">
            This section is ready for content integration. Connect this page with your backend services or page components.
          </p>
        </div>
      </div>
    </div>
  );
}
