// Demo catalog. Paths are relative to index.html for GitHub Pages.
export const overviewDatasets = [
  { id: "agibot", name: "AgiBotWorld Beta · Gripper", domain: "Real", secondStem: "overview_extra_agibot" },
  { id: "dexhand", name: "AgiBotWorld Beta · Dexterous hand", domain: "Real", secondStem: "dexhand_scan" },
  { id: "robomind", name: "RoboMIND", domain: "Real", secondStem: "overview_extra_robomind_pour" },
  { id: "realsource", name: "RealSource World", domain: "Real", secondStem: "overview_extra_realsource_rice" },
  { id: "libero", name: "LIBERO", domain: "Sim", secondStem: "overview_extra_libero" },
  { id: "maniskill", name: "ManiSkill2", domain: "Sim", secondStem: "overview_extra_maniskill" },
  { id: "robocasa", name: "RoboCasa", domain: "Sim", secondStem: "overview_extra_robocasa" },
  { id: "robotwin", name: "RoboTwin", domain: "Sim", secondStem: "overview_extra_robotwin" },
];

export const viewpointTasks = [
  { stem: "task4", label: "On Plate", instruction: "Put the bowl on the plate" },
  { stem: "task5", label: "On Stove", instruction: "Put the bowl on the stove" },
  { stem: "task2", label: "Cream Cheese", instruction: "Put the cream cheese in the bowl" },
  { stem: "task6", label: "Turn Stove", instruction: "Turn on the stove" },
  { stem: "task3", label: "Book", instruction: "Pick up the book and place it in the front compartment of the caddy" },
];

export const embodimentTasks = [
  { stem: "stack", label: "Stack" },
  { stem: "lift", label: "Lift" },
];

export const objectTasks = [
  { stem: "orange_duck", label: "Orange + Duck", source: "unseen_object1_orange_duck" },
  { stem: "succulent_apple", label: "Plant + Apple", source: "unseen_object2_succulent_apple" },
  { stem: "donut_can", label: "Donut + Can", source: "unseen_object3_donut_can" },
  { stem: "woodbowl_lemon", label: "Wood Bowl + Lemon", source: "unseen_object4_woodbowl_lemon" },
  { stem: "peach_pinecone", label: "Peach + Pinecone", source: "unseen_object5_peach_pinecone" },
];

export const reverseTasks = [
  { stem: "hairdryer", label: "Hairdryer", instruction: "Place the hairdryer on the rack", dataset: "AgiBotWorld Beta" },
  { stem: "block", label: "Block", instruction: "Move the brown block", dataset: "AgiBotWorld Beta" },
  { stem: "bowl", label: "Bowl", instruction: "Move the black bowl", dataset: "LIBERO" },
  { stem: "mug", label: "Mug", instruction: "Move the yellow-and-white mug", dataset: "LIBERO" },
  { stem: "peg", label: "Peg", instruction: "Insert the peg into the horizontal hole", dataset: "ManiSkill2" },
  { stem: "hamburger", label: "Food Tray", instruction: "Arrange the hamburger and fries", dataset: "RoboTwin" },
];
