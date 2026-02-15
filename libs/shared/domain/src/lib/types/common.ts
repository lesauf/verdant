// Common domain types

export type GeoJSON = any; // TODO: Define proper GeoJSON type

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  syncedAt: Date | null;
  isDeleted: boolean;
}
