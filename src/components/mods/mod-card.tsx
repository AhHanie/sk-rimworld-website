"use client";

import * as React from "react";
import Image from "next/image";
import { ArrowUpRight, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { compareVersionsDesc, formatTagLabel } from "@/lib/catalog";
import { PLACEHOLDER_IMAGE_SRC } from "@/lib/constants";
import { getSteamWorkshopStarRating } from "@/lib/steam-rating";
import type { CatalogMod } from "@/types/mod";

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "long",
  day: "numeric",
});

function formatRatingCount(count: number): string {
  return `${count} positive rating${count === 1 ? "" : "s"}`;
}

function ModRatingRow({ positiveRatingCount }: { positiveRatingCount: number }) {
  const stars = getSteamWorkshopStarRating(positiveRatingCount, 0);
  const countLabel = formatRatingCount(positiveRatingCount);

  if (stars === undefined) {
    return (
      <p className="text-xs text-muted-foreground">No ratings yet · {countLabel}</p>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span
        role="img"
        aria-label={`${stars} out of 5 stars from ${countLabel}`}
        className="flex items-center gap-0.5"
      >
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            aria-hidden="true"
            className={
              index < stars
                ? "size-3.5 fill-foreground text-foreground"
                : "size-3.5 text-muted-foreground"
            }
          />
        ))}
      </span>
      <span aria-hidden="true">
        {stars}/5 · {countLabel}
      </span>
    </div>
  );
}

export function ModCard({ mod }: { mod: CatalogMod }) {
  const [imageFailed, setImageFailed] = React.useState(false);
  const uploadDate = new Date(mod.uploadDate);
  const sortedVersions = [...mod.supportedVersions].sort(compareVersionsDesc);

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-shadow hover:border-foreground/20 hover:shadow-md">
      <a
        href={mod.workshopUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={`Open ${mod.name} on the Steam Workshop (opens in a new tab)`}
        className="relative block aspect-video w-full overflow-hidden bg-muted"
      >
        <Image
          src={imageFailed ? PLACEHOLDER_IMAGE_SRC : mod.previewImage.src}
          alt={mod.previewImage.alt}
          width={mod.previewImage.width}
          height={mod.previewImage.height}
          sizes="(min-width: 1440px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          loading="lazy"
          unoptimized
          onError={() => setImageFailed(true)}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </a>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-base font-semibold leading-snug">
            <a
              href={mod.workshopUrl}
              target="_blank"
              rel="noreferrer"
              className="group-hover:underline hover:underline"
            >
              {mod.name}
            </a>
          </h2>
        </div>

        {mod.positiveRatingCount !== undefined && (
          <ModRatingRow positiveRatingCount={mod.positiveRatingCount} />
        )}

        <p className="line-clamp-3 text-sm text-muted-foreground" title={mod.description}>
          {mod.description}
        </p>

        {mod.tags.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label="Tags">
            {mod.tags.map((tag) => (
              <li key={tag}>
                <Badge variant="secondary">{formatTagLabel(tag)}</Badge>
              </li>
            ))}
          </ul>
        )}

        {sortedVersions.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label="Supported RimWorld versions">
            {sortedVersions.map((version) => (
              <li key={version}>
                <Badge variant="outline">{version}</Badge>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex items-center justify-between pt-2 text-xs text-muted-foreground">
          <time dateTime={mod.uploadDate}>{dateFormatter.format(uploadDate)}</time>
          <a
            href={mod.workshopUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-medium text-foreground hover:underline"
          >
            View on Steam
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
      </div>
    </article>
  );
}
