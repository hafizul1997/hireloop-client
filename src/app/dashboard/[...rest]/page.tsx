import { ComingSoon } from "../components/coming-soon";

/**
 * Placeholder for any /dashboard/* section without a dedicated page yet
 * (e.g. /dashboard/saved-jobs). Dedicated pages take precedence over this
 * catch-all, so new sections can be added without touching this file.
 */
export default async function DashboardSectionPage({
  params,
}: PageProps<"/dashboard/[...rest]">) {
  const { rest } = await params;
  const title = (rest?.[rest.length - 1] ?? "page").replaceAll("-", " ");

  return <ComingSoon>{title} is coming soon</ComingSoon>;
}
