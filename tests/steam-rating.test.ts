import { describe, expect, it } from "vitest";
import { getSteamWorkshopStarRating } from "@/lib/steam-rating";

describe("getSteamWorkshopStarRating", () => {
  it("returns undefined when there are no votes", () => {
    expect(getSteamWorkshopStarRating(0, 0)).toBeUndefined();
  });

  it("returns undefined below the 25-vote threshold", () => {
    expect(getSteamWorkshopStarRating(24, 0)).toBeUndefined();
  });

  it("returns 4 stars right at the 25-vote threshold", () => {
    expect(getSteamWorkshopStarRating(25, 0)).toBe(4);
  });

  it("returns 4 stars at the top of the 4-star band", () => {
    expect(getSteamWorkshopStarRating(149, 0)).toBe(4);
  });

  it("returns 5 stars at the start of the 5-star band", () => {
    expect(getSteamWorkshopStarRating(150, 0)).toBe(5);
  });

  it("accounts for non-zero negative votes", () => {
    expect(getSteamWorkshopStarRating(100, 50)).toBe(4);
  });
});
