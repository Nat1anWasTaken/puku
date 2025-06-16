import { ArrangementDetailsHeaderSkeleton } from "@/components/details/arrangement-details-header-skeleton";
import { ArrangementPartListingSkeleton } from "@/components/details/arrangement-part-listing-skeleton";
import { Container } from "@chakra-ui/react";

export default function ArrangementPageLoading() {
  return (
    <Container maxW="7xl" py={8}>
      <ArrangementDetailsHeaderSkeleton />
      <ArrangementPartListingSkeleton />
    </Container>
  );
}
