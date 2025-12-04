// Mock data for development without database
export const mockBlocks = [
  {
    id: "1",
    name: "Block A",
    areaHa: 2.0,
    status: "Planted",
    geoJson: null,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    name: "Block B",
    areaHa: 2.0,
    status: "Prep",
    geoJson: null,
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-01"),
  },
  {
    id: "3",
    name: "Block C",
    areaHa: 1.5,
    status: "Fallow",
    geoJson: null,
    createdAt: new Date("2024-03-10"),
    updatedAt: new Date("2024-03-10"),
  },
];

export const mockTasks = [
  {
    id: "1",
    title: "Clear brush from Block A",
    description: "Remove all overgrown vegetation and prepare the land for planting. Focus on the northern section first.",
    status: "Done",
    blockId: "1",
    assignedTo: null,
    startDate: new Date("2024-11-25"),
    dueDate: new Date("2024-12-01"),
    createdAt: new Date("2024-11-25"),
  },
  {
    id: "2",
    title: "Apply fertilizer to Block A",
    description: "Use organic fertilizer mix. Apply 50kg per hectare evenly across the entire block.",
    status: "In Progress",
    blockId: "1",
    assignedTo: null,
    startDate: new Date("2024-12-02"),
    dueDate: new Date("2024-12-05"),
    createdAt: new Date("2024-11-28"),
  },
  {
    id: "3",
    title: "Soil testing for Block B",
    description: "Collect soil samples from 5 different points. Send to lab for pH and nutrient analysis.",
    status: "Todo",
    blockId: "2",
    assignedTo: null,
    startDate: new Date("2024-12-04"),
    dueDate: new Date("2024-12-10"),
    createdAt: new Date("2024-12-01"),
  },
  {
    id: "4",
    title: "Install irrigation system",
    description: "Set up drip irrigation for Block B. Include main line and lateral pipes with emitters every 30cm.",
    status: "Todo",
    blockId: "2",
    assignedTo: null,
    startDate: new Date("2024-12-10"),
    dueDate: new Date("2024-12-15"),
    createdAt: new Date("2024-12-02"),
  },
];

export type Block = typeof mockBlocks[0];
export type Task = typeof mockTasks[0] & {
  blockId?: string | null;
  startDate?: Date | null;
  dueDate?: Date | null;
  description?: string | null;
};
