export type RemoveIndex<IndexedType> = {
  [
    Item in keyof IndexedType as string extends Item
      ? never
      : number extends Item
        ? never
        : symbol extends Item
          ? never
          : Item
  ]: IndexedType[Item];
};

export interface Admonishment {
  text: string;
  type: "caution" | "important" | "note" | "tip" | "warning";
}
