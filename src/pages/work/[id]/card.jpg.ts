import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";
import { cover } from "../../../lib/assets";
import { renderCard } from "../../../lib/card";
import { site } from "../../../site";

export const getStaticPaths = (async () => {
  const pieces = await getCollection("work");
  return pieces.map((piece) => ({
    params: { id: piece.id },
    props: { piece },
  }));
}) satisfies GetStaticPaths;

/** The share card for one piece. */
export const GET: APIRoute<{ piece: CollectionEntry<"work"> }> = async ({
  props: { piece },
}) => {
  const card = await renderCard({
    title: piece.data.title,
    caption: [piece.data.medium, site.author].filter(Boolean).join(" · "),
    image: cover(piece)?.path,
  });
  return new Response(new Uint8Array(card), {
    headers: { "Content-Type": "image/jpeg" },
  });
};
