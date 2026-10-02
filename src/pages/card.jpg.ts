import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { cover } from "../lib/assets";
import { renderCard } from "../lib/card";
import { byNewest } from "../lib/media";
import { site } from "../site";

/** The share card for every page that is not a piece, showing the newest piece with an image. */
export const GET: APIRoute = async () => {
  const pieces = (await getCollection("work")).sort(byNewest);
  const card = await renderCard({
    title: site.name,
    caption: site.description,
    image: pieces.map(cover).find(Boolean)?.path,
  });
  return new Response(new Uint8Array(card), {
    headers: { "Content-Type": "image/jpeg" },
  });
};
