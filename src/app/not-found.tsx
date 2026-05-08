import ErrorFallback from "@/components/common/ErrorFallback";

export default function NotFound() {
  return (
    <ErrorFallback message="주소가 잘못되었거나 삭제된 페이지예요." />
  );
}
