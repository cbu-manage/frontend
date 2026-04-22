import ErrorFallback from "@/components/common/ErrorFallback";

export default function NotFound() {
  return <ErrorFallback status={404} />;
}
