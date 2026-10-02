import { describe, expect, test } from "vitest";
import {
  embedUrl,
  isValidPieceId,
  mediaKind,
  orphanFolders,
  parseDate,
} from "./media";

describe("mediaKind", () => {
  test.each([
    ["cover.jpg", "image"],
    ["scan.jpeg", "image"],
    ["a.png", "image"],
    ["a.webp", "image"],
    ["a.gif", "image"],
    ["a.avif", "image"],
    ["song.mp3", "audio"],
    ["song.m4a", "audio"],
    ["song.wav", "audio"],
    ["song.ogg", "audio"],
    ["clip.mp4", "video"],
    ["clip.webm", "video"],
    ["https://youtu.be/aqz-KE-bpKQ", "embed"],
    ["https://vimeo.com/76979871", "embed"],
  ])("%s is %s", (src, kind) => {
    expect(mediaKind(src)).toBe(kind);
  });

  test("upper-case extensions from cameras and phones are accepted", () => {
    expect(mediaKind("IMG_1234.JPG")).toBe("image");
    expect(mediaKind("MOV_0001.MP4")).toBe("video");
  });

  test("file names with extra dots use the last extension", () => {
    expect(mediaKind("koi.pond.final.png")).toBe("image");
  });

  test.each(["photo.heic", "notes.txt", "art.psd", "noextension", ""])(
    "%j is unsupported",
    (src) => {
      expect(mediaKind(src)).toBeUndefined();
    },
  );

  test("links that are not YouTube or Vimeo are unsupported", () => {
    expect(
      mediaKind("https://drive.google.com/file/d/abc/view"),
    ).toBeUndefined();
    expect(mediaKind("https://soundcloud.com/kai/song")).toBeUndefined();
    expect(mediaKind("https://example.com/cover.jpg")).toBeUndefined();
  });
});

describe("embedUrl", () => {
  const youtube = "https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ";

  test.each([
    "https://youtu.be/aqz-KE-bpKQ",
    "https://youtu.be/aqz-KE-bpKQ?t=42",
    "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
    "https://www.youtube.com/watch?v=aqz-KE-bpKQ&t=42s",
    "https://m.youtube.com/watch?v=aqz-KE-bpKQ",
    "https://youtube.com/shorts/aqz-KE-bpKQ",
    "https://www.youtube.com/embed/aqz-KE-bpKQ",
    "http://youtu.be/aqz-KE-bpKQ",
  ])("YouTube link %s", (src) => {
    expect(embedUrl(src)).toBe(youtube);
  });

  test("public Vimeo link", () => {
    expect(embedUrl("https://vimeo.com/76979871")).toBe(
      "https://player.vimeo.com/video/76979871",
    );
  });

  test("unlisted Vimeo link keeps its privacy hash", () => {
    expect(embedUrl("https://vimeo.com/76979871/0a1b2c3d4e")).toBe(
      "https://player.vimeo.com/video/76979871?h=0a1b2c3d4e",
    );
  });

  test.each([
    "cover.jpg",
    "https://www.youtube.com/",
    "https://www.youtube.com/watch",
    "https://www.youtube.com/@somechannel",
    "https://vimeo.com/kai",
    "https://example.com/watch?v=aqz-KE-bpKQ",
    "ftp://youtu.be/aqz-KE-bpKQ",
  ])("%s has no embed address", (src) => {
    expect(embedUrl(src)).toBeUndefined();
  });
});

describe("parseDate", () => {
  test("year and month", () => {
    expect(parseDate("2026-03")?.toISOString()).toBe(
      "2026-03-01T00:00:00.000Z",
    );
  });

  test("full date", () => {
    expect(parseDate("2026-03-14")?.toISOString()).toBe(
      "2026-03-14T00:00:00.000Z",
    );
  });

  test("a Date, as YAML produces for a full date, passes through", () => {
    const date = new Date("2026-03-14T00:00:00Z");
    expect(parseDate(date)).toBe(date);
  });

  test.each([
    2024,
    "2024",
    "March 2026",
    "2026-13",
    "03-2026",
    "",
    null,
    undefined,
  ])("%j is rejected rather than guessed", (value) => {
    expect(parseDate(value)).toBeUndefined();
  });

  test("an invalid Date is rejected", () => {
    expect(parseDate(new Date("nonsense"))).toBeUndefined();
  });
});

describe("isValidPieceId", () => {
  test.each(["koi-pond", "2026-koi-pond", "a", "piece2"])(
    "%s is valid",
    (id) => {
      expect(isValidPieceId(id)).toBe(true);
    },
  );

  test.each([
    "Koi Pond",
    "koi pond",
    "Koi-Pond",
    "koi_pond",
    "-koi",
    "koi-",
    "koi--pond",
    "ko/i",
    "",
  ])("%j is invalid", (id) => {
    expect(isValidPieceId(id)).toBe(false);
  });
});

describe("orphanFolders", () => {
  test("folders with media but no piece are reported once each, sorted", () => {
    const files = [
      "/content/work/koi-pond/cover.jpg",
      "/content/work/koi-pond/detail.jpg",
      "/content/work/no-index/a.jpg",
      "/content/work/no-index/b.mp3",
      "/content/work/also-missing/a.png",
    ];
    expect(orphanFolders(files, ["koi-pond"])).toEqual([
      "also-missing",
      "no-index",
    ]);
  });

  test("no orphans when every folder has a piece", () => {
    expect(
      orphanFolders(["/content/work/koi-pond/cover.jpg"], ["koi-pond"]),
    ).toEqual([]);
  });
});
