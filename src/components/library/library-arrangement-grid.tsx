"use client";

import { Grid } from "@chakra-ui/react";
import { LibraryArrangementCard, Arrangement } from "./library-arrangement-card";

interface LibraryArrangementGridProps {
  arrangements: Arrangement[];
  onView: (id: string) => void;
}

export function LibraryArrangementGrid({ arrangements, onView }: LibraryArrangementGridProps) {
  return (
    <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6} w="full">
      {arrangements.map((arrangement) => (
        <LibraryArrangementCard key={arrangement.id} arrangement={arrangement} onView={onView} />
      ))}
    </Grid>
  );
}
