"use client";

import { Grid } from "@chakra-ui/react";
import { Arrangement, LibraryArrangementCard } from "./library-arrangement-card";

interface LibraryArrangementGridProps {
  arrangements: Arrangement[];
}

export function LibraryArrangementGrid({ arrangements }: LibraryArrangementGridProps) {
  return (
    <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6} w="full">
      {arrangements.map((arrangement) => (
        <LibraryArrangementCard key={arrangement.id} arrangement={arrangement} />
      ))}
    </Grid>
  );
}
